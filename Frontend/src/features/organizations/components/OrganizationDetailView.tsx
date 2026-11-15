/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { OrganizationUserApi } from "../api/OrganizationUserApi";
import { OrganizationJoinRequestApi } from "../api/OrganizationJoinRequestApi";
import { MemberRoleDialog } from "./MemberRoleDialog";
import type {
  OrganizationItemDTO,
  OrganizationRole,
  OrganizationUserResponse,
} from "../types/OrganizationType";
import { getRoleLabel } from "../types/OrganizationType";
import type { OrganizationJoinRequestEntity } from "../../home/types/organization";
import type { UserProfile } from "../../auth/types/AuthType";

export type OrganizationDetailTab = "overview" | "members" | "requests";

interface OrganizationDetailViewProps {
  organization: OrganizationItemDTO;
  currentUser: UserProfile | null;
  activeTab?: OrganizationDetailTab;
  onTabChange?: (tab: OrganizationDetailTab) => void;
  onBack: () => void;
  onShowToast: (message: string) => void;
  onRefreshOrg?: () => void;
  onEditOrg?: (org: OrganizationItemDTO) => void;
  onViewRequests?: (org: OrganizationItemDTO) => void;
}

export function OrganizationDetailView({
  organization,
  currentUser,
  activeTab: controlledTab,
  onTabChange,
  onBack,
  onShowToast,
  onRefreshOrg,
  onEditOrg,
  onViewRequests: _onViewRequests,
}: OrganizationDetailViewProps) {
  // Current active tab ("overview" | "members" | "requests")
  const [internalTab, setInternalTab] = useState<OrganizationDetailTab>("overview");
  const activeTab = controlledTab ?? internalTab;

  const handleTabClick = (tab: OrganizationDetailTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  // Members state
  const [members, setMembers] = useState<OrganizationUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<OrganizationRole | "ALL">("ALL");

  // Add Member state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<OrganizationRole>("MEMBER");
  const [addLoading, setAddLoading] = useState(false);

  // Owner Role Assignment Dialog state
  const [selectedMemberForRole, setSelectedMemberForRole] =
    useState<OrganizationUserResponse | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  // Action states
  const [transferLoading, setTransferLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  // Organization-specific Join Requests state
  const [orgRequests, setOrgRequests] = useState<OrganizationJoinRequestEntity[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const isOwner = organization.user_role === "OWNER";
  const isOrgManager = organization.user_role === "ORGANIZATION_MANAGER";
  const canManage = isOwner || isOrgManager;

  const fetchMembers = useCallback(async () => {
    try {
      const res = await OrganizationUserApi.getMembers(organization.id);
      if (res.success && res.data) {
        setMembers(res.data);
      } else {
        setError(res.message || "Không thể tải danh sách thành viên.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Lỗi khi tải thành viên.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [organization.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Fetch join requests specifically for this organization
  const fetchOrgRequests = useCallback(async () => {
    if (!canManage) return;
    setLoadingRequests(true);
    try {
      const res = await OrganizationJoinRequestApi.getOrgJoinRequests(organization.id);
      if (res.success && res.data) {
        setOrgRequests(
          res.data.map((r) => ({
            id: r.id,
            organization_id: r.organization_id,
            message: r.message,
            creator_user_id: r.creator_user_id,
            creator_user_name: r.creator_display_name || r.creator_username,
            creator_user_email: r.creator_email,
            created_at: r.created_at,
            status: r.status,
            actor_user_id: r.actor_user_id,
            actor_username: r.actor_username,
            actor_display_name: r.actor_display_name,
            acted_at: r.acted_at,
            reject_reason: r.reject_reason,
          }))
        );
      }
    } catch {
      // Ignore
    } finally {
      setLoadingRequests(false);
    }
  }, [canManage, organization.id]);

  useEffect(() => {
    if (activeTab === "requests" || activeTab === "overview") {
      fetchOrgRequests();
    }
  }, [activeTab, fetchOrgRequests]);

  const handleApproveOrgRequest = async (requestId: number) => {
    try {
      const res = await OrganizationJoinRequestApi.approve(requestId);
      if (res.success) {
        onShowToast("Đã phê duyệt yêu cầu gia nhập thành công!");
        await fetchOrgRequests();
        await fetchMembers();
        onRefreshOrg?.();
      } else {
        onShowToast(res.message || "Phê duyệt thất bại.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Phê duyệt thất bại.";
      onShowToast(msg);
    }
  };

  const handleRejectOrgRequest = async (requestId: number) => {
    const reason = window.prompt("Nhập lý do từ chối (không bắt buộc):", "Không phù hợp với tiêu chí phòng lab");
    if (reason === null) return;

    try {
      const res = await OrganizationJoinRequestApi.reject(requestId, reason.trim() || "Từ chối");
      if (res.success) {
        onShowToast("Đã từ chối yêu cầu gia nhập.");
        await fetchOrgRequests();
        onRefreshOrg?.();
      } else {
        onShowToast(res.message || "Từ chối thất bại.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Từ chối thất bại.";
      onShowToast(msg);
    }
  };

  // Handlers
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(organization.code);
      onShowToast(`Đã sao chép mã tổ chức: "${organization.code}"`);
    } catch {
      onShowToast(`Mã tổ chức: ${organization.code}`);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setAddLoading(true);
    try {
      const res = await OrganizationUserApi.addMember(organization.id, {
        username: newUsername.trim(),
        role: newRole,
      });

      if (res.success) {
        onShowToast(`Đã thêm thành viên "${newUsername.trim()}" vào tổ chức!`);
        setNewUsername("");
        setIsAddFormOpen(false);
        await fetchMembers();
        onRefreshOrg?.();
      } else {
        onShowToast(res.message || "Thêm thành viên thất bại.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Thêm thành viên thất bại.";
      onShowToast(msg);
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenRoleDialog = (member: OrganizationUserResponse) => {
    setSelectedMemberForRole(member);
    setIsRoleDialogOpen(true);
  };

  const handleRemoveMember = async (userId: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi tổ chức?`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const res = await OrganizationUserApi.removeMember(
        organization.id,
        userId
      );
      if (res.success) {
        onShowToast(`Đã xóa thành viên "${name}" khỏi tổ chức.`);
        await fetchMembers();
        onRefreshOrg?.();
      } else {
        onShowToast(res.message || "Xóa thành viên thất bại.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa thành viên thất bại.";
      onShowToast(msg);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleTransferOwnership = async (newOwnerId: number, name: string) => {
    if (
      !window.confirm(
        `XÁC NHẬN CHUYỂN QUYỀN SỞ HỮU:\nBạn sẽ chuyển quyền Chủ sở hữu tổ chức "${organization.name}" cho "${name}".\nSau thao tác này, vai trò của bạn sẽ trở thành Quản lý tổ chức.`
      )
    ) {
      return;
    }

    setTransferLoading(true);
    try {
      const res = await OrganizationUserApi.transferOwnership(
        organization.id,
        newOwnerId
      );
      if (res.success) {
        onShowToast(`Đã chuyển quyền chủ sở hữu cho "${name}" thành công!`);
        await fetchMembers();
        onRefreshOrg?.();
      } else {
        onShowToast(res.message || "Chuyển quyền sở hữu thất bại.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Chuyển quyền sở hữu thất bại.";
      onShowToast(msg);
    } finally {
      setTransferLoading(false);
    }
  };

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter !== "ALL" && m.role !== roleFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (m.display_name || "").toLowerCase().includes(q);
        const matchUser = (m.username || "").toLowerCase().includes(q);
        const matchEmail = (m.email || "").toLowerCase().includes(q);
        return matchName || matchUser || matchEmail;
      }
      return true;
    });
  }, [members, roleFilter, searchQuery]);

  // Member stats
  const stats = useMemo(() => {
    const total = members.length;
    const managers = members.filter(
      (m) =>
        m.role === "OWNER" ||
        m.role === "ORGANIZATION_MANAGER" ||
        m.role === "LABORATORY_MANAGER"
    ).length;
    const regular = members.filter((m) => m.role === "MEMBER").length;
    return { total, managers, regular };
  }, [members]);

  const getRoleBadgeStyle = (role: OrganizationRole) => {
    switch (role) {
      case "OWNER":
        return "bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400/20";
      case "ORGANIZATION_MANAGER":
        return "bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400/20";
      case "LABORATORY_MANAGER":
        return "bg-sky-100 text-sky-900 border-sky-300 ring-1 ring-sky-400/20";
      case "MEMBER":
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span>Tất cả tổ chức</span>
          </button>
          <span>/</span>
          {activeTab === "overview" ? (
            <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
              {organization.name}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => handleTabClick("overview")}
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition truncate max-w-xs sm:max-w-md"
            >
              {organization.name}
            </button>
          )}
          {activeTab === "members" && (
            <>
              <span>/</span>
              <span className="font-semibold text-slate-800">Thành viên</span>
            </>
          )}
          {activeTab === "requests" && (
            <>
              <span>/</span>
              <span className="font-semibold text-slate-800">Yêu cầu gia nhập</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition self-start sm:self-auto"
        >
          <svg
            className="h-3.5 w-3.5 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
          <span>Quay lại danh sách</span>
        </button>
      </div>

      {/* Horizontal Tab Bar at the top */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {/* Tab 1: Tổng quan */}
          <button
            type="button"
            onClick={() => handleTabClick("overview")}
            className={`group inline-flex items-center gap-2 border-b-2 py-3.5 px-1 text-sm font-semibold transition ${
              activeTab === "overview"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <svg
              className={`h-5 w-5 ${
                activeTab === "overview" ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <span>Tổng quan</span>
          </button>

          {/* Tab 2: Thành viên */}
          <button
            type="button"
            onClick={() => handleTabClick("members")}
            className={`group inline-flex items-center gap-2 border-b-2 py-3.5 px-1 text-sm font-semibold transition ${
              activeTab === "members"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <svg
              className={`h-5 w-5 ${
                activeTab === "members" ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            <span>Thành viên</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === "members"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {members.length}
            </span>
          </button>

          {/* Tab 3: Yêu cầu gia nhập (quản lý / chủ sở hữu) */}
          {canManage && (
            <button
              type="button"
              onClick={() => handleTabClick("requests")}
              className={`group inline-flex items-center gap-2 border-b-2 py-3.5 px-1 text-sm font-semibold transition ${
                activeTab === "requests"
                  ? "border-emerald-600 text-emerald-800"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <svg
                className={`h-5 w-5 ${
                  activeTab === "requests" ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
              <span>Yêu cầu gia nhập</span>
              {organization.pending_requests_count && organization.pending_requests_count > 0 ? (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-2xs">
                  {organization.pending_requests_count}
                </span>
              ) : null}
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content: Overview (Tổng quan) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Organization Overview Header Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      organization.privacy === "PUBLIC"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {organization.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Bấm để sao chép mã tổ chức"
                    className="inline-flex items-center gap-1 font-mono text-xs font-bold tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 transition"
                  >
                    <span>Mã: {organization.code}</span>
                    <svg
                      className="h-3.5 w-3.5 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                      />
                    </svg>
                  </button>

                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeStyle(
                      organization.user_role
                    )}`}
                  >
                    Vai trò của bạn: {getRoleLabel(organization.user_role)}
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {organization.name}
                </h1>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>
                    Người tạo:{" "}
                    <strong className="text-slate-700">
                      {organization.creator_display_name || "Chủ nhiệm"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Ngày tạo:{" "}
                    {new Date(organization.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {canManage && onEditOrg && (
                <div className="self-start lg:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditOrg(organization)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                  >
                    <svg
                      className="h-4 w-4 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                    <span>Cấu hình tổ chức</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Overview Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thành viên</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{members.length}</span>
                <span className="text-xs text-slate-400">người</span>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                {stats.regular} thành viên thường
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quản trị viên</span>
                <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.managers}</span>
                <span className="text-xs text-slate-400">chủ sở hữu / quản lý</span>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Phụ trách quản trị & vận hành
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phạm vi</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${organization.privacy === "PUBLIC" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {organization.privacy === "PUBLIC" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {organization.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {organization.privacy === "PUBLIC" ? "Mã phòng duyệt tự động" : "Cần phê duyệt từ quản trị"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vai trò của bạn</span>
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-base font-bold text-slate-900 truncate">
                  {getRoleLabel(organization.user_role)}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Gia nhập: {new Date(organization.user_joined_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Overview Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Giới thiệu & Mô tả */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Giới thiệu & Mô tả phòng thí nghiệm
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {organization.description || "Chưa có mô tả chi tiết cho phòng thí nghiệm này. Quản trị viên có thể cập nhật trong mục Cấu hình tổ chức."}
              </p>
            </div>

            {/* Thông tin chi tiết */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Thông tin chi tiết
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Tên phòng lab:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{organization.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Mã mời tham gia:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {organization.code}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Người sáng lập / Chủ nhiệm:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {organization.creator_display_name || "Chủ nhiệm phòng"}
                    {organization.creator_email && (
                      <span className="text-slate-400 font-normal ml-1">({organization.creator_email})</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Ngày thành lập:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {new Date(organization.created_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Phạm vi truy cập:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {organization.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Vai trò tài khoản:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {getRoleLabel(organization.user_role)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Members Management */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* Member stats bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Tổng số thành viên</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Chủ sở hữu & Quản lý</div>
              <div className="mt-1 text-2xl font-bold text-emerald-700">{stats.managers}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="text-xs font-medium text-slate-500">Thành viên thường</div>
              <div className="mt-1 text-2xl font-bold text-slate-700">{stats.regular}</div>
            </div>
          </div>

          {/* Member Toolbar: Search, Role Filter, Add Member */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search box */}
              <div className="relative flex-1 max-w-md">
                <svg
                  className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, username hoặc email..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-slate-400">Vai trò:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as OrganizationRole | "ALL")}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-2 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="OWNER">Chủ sở hữu</option>
                  <option value="ORGANIZATION_MANAGER">Quản lý tổ chức</option>
                  <option value="LABORATORY_MANAGER">Quản lý phòng lab</option>
                  <option value="MEMBER">Thành viên</option>
                </select>
              </div>
            </div>

            {/* Add Member button (Owner or Org Manager) */}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsAddFormOpen((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition shrink-0"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>{isAddFormOpen ? "Đóng form thêm" : "Thêm thành viên"}</span>
              </button>
            )}
          </div>

          {/* Expandable Add Member Form */}
          {isAddFormOpen && canManage && (
            <form
              onSubmit={handleAddMember}
              className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Thêm thành viên mới vào tổ chức
                    </h3>
                    <p className="text-xs text-emerald-800/80">
                      Nhập tên đăng nhập (username) của người dùng đã có tài khoản trên hệ thống
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-emerald-100 hover:text-slate-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên đăng nhập (username) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="VD: nguyen_van_a"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai trò chỉ định ban đầu
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as OrganizationRole)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="MEMBER">Thành viên</option>
                    <option value="LABORATORY_MANAGER">Quản lý phòng lab</option>
                    {isOwner && (
                      <option value="ORGANIZATION_MANAGER">Quản lý tổ chức</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addLoading || !newUsername.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {addLoading ? "Đang thêm..." : "Xác nhận thêm vào tổ chức"}
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                <p className="text-xs font-medium">Đang tải danh sách thành viên...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 max-w-md mx-auto">
                  {error}
                </div>
                <button
                  type="button"
                  onClick={fetchMembers}
                  className="mt-3 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Thử tải lại
                </button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <svg
                  className="mx-auto h-10 w-10 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
                <div className="text-xs font-medium">Không tìm thấy thành viên nào phù hợp</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 pl-6 pr-4">Thành viên</th>
                      <th className="py-3.5 px-4">Vai trò</th>
                      <th className="py-3.5 px-4">Ngày tham gia</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredMembers.map((m) => {
                      const isCurrentUserMember = currentUser?.id === m.user_id;
                      const isMemberOwner = m.role === "OWNER";
                      const isMemberOrgManager = m.role === "ORGANIZATION_MANAGER";

                      // Permissions
                      const canAssignPermissions = isOwner && !isMemberOwner;
                      const canTransferOwnership = isOwner && !isMemberOwner;
                      const canRemove =
                        !isMemberOwner &&
                        !isCurrentUserMember &&
                        (isOwner || (isOrgManager && !isMemberOrgManager));

                      const initials = (m.display_name || m.username || "U")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase();

                      const formattedJoinedDate = m.joined_at
                        ? new Date(m.joined_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—";

                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Member info */}
                          <td className="py-3.5 pl-6 pr-4">
                            <div className="flex items-center gap-3">
                              {m.avatar_url ? (
                                <img
                                  src={m.avatar_url}
                                  alt={m.display_name || m.username}
                                  className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200"
                                />
                              ) : (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-2xs">
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 truncate">
                                    {m.display_name || m.username}
                                  </span>
                                  {isCurrentUserMember && (
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  @{m.username} {m.email ? `• ${m.email}` : ""}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getRoleBadgeStyle(
                                m.role
                              )}`}
                            >
                              {getRoleLabel(m.role)}
                            </span>
                          </td>

                          {/* Joined date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                            {formattedJoinedDate}
                          </td>

                          {/* Action buttons */}
                          <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* OWNER Action: Phân quyền Dialog */}
                              {canAssignPermissions && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRoleDialog(m)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 transition"
                                  title="Phân quyền thành viên"
                                >
                                  <svg
                                    className="h-3.5 w-3.5 text-emerald-700"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                                    />
                                  </svg>
                                  <span>Phân quyền</span>
                                </button>
                              )}

                              {/* OWNER Action: Chuyển quyền Chủ sở hữu */}
                              {canTransferOwnership && (
                                <button
                                  type="button"
                                  disabled={transferLoading}
                                  onClick={() =>
                                    handleTransferOwnership(
                                      m.user_id,
                                      m.display_name || m.username
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/70 p-1.5 text-xs text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition"
                                  title="Chuyển quyền Chủ sở hữu tổ chức cho thành viên này"
                                >
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                    />
                                  </svg>
                                </button>
                              )}

                              {/* Remove Member button */}
                              {canRemove && (
                                <button
                                  type="button"
                                  disabled={deletingUserId === m.user_id}
                                  onClick={() =>
                                    handleRemoveMember(
                                      m.user_id,
                                      m.display_name || m.username
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/70 p-1.5 text-xs text-red-600 hover:bg-red-100 hover:border-red-300 transition"
                                  title="Xóa thành viên khỏi tổ chức"
                                >
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                  </svg>
                                </button>
                              )}

                              {!canAssignPermissions && !canRemove && (
                                <span className="text-xs text-slate-400 italic">
                                  {isMemberOwner ? "Chủ sở hữu" : "Xem"}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Join Requests (Yêu cầu gia nhập) */}
      {activeTab === "requests" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Yêu cầu gia nhập phòng lab: {organization.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách người dùng xin tham gia phòng lab này cần được phê duyệt
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTabClick("overview")}
              className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              ← Về tổng quan
            </button>
          </div>

          {loadingRequests ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <span className="text-xs">Đang tải danh sách yêu cầu...</span>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orgRequests.filter((r) => r.status === "PENDING").length > 0 ? (
                orgRequests
                  .filter((r) => r.status === "PENDING")
                  .map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-xs">
                          {(req.creator_user_name || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {req.creator_user_name}
                            <span className="text-xs font-normal text-slate-400 ml-2">
                              ({req.creator_user_email})
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Gửi yêu cầu lúc: {new Date(req.created_at).toLocaleString("vi-VN")}
                          </div>
                          <div className="text-xs text-slate-600 mt-1.5 italic bg-white p-2.5 rounded-lg border border-slate-100">
                            "{req.message || "Không có lời nhắn đi kèm."}"
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleRejectOrgRequest(req.id)}
                          className="rounded-lg border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveOrgRequest(req.id)}
                          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          Phê duyệt
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Không có yêu cầu gia nhập nào đang chờ duyệt cho tổ chức này.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Owner Role Assignment Dialog */}
      <MemberRoleDialog
        isOpen={isRoleDialogOpen}
        onClose={() => {
          setIsRoleDialogOpen(false);
          setSelectedMemberForRole(null);
        }}
        organization={organization}
        member={selectedMemberForRole}
        onRoleUpdated={async () => {
          await fetchMembers();
          onRefreshOrg?.();
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
}
