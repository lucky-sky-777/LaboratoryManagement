import { useState, useEffect } from "react";
import { OrganizationUserApi } from "../api/OrganizationUserApi";
import type {
  OrganizationItemDTO,
  OrganizationRole,
  OrganizationUserResponse,
} from "../types/OrganizationType";
import { getRoleLabel } from "../types/OrganizationType";
import type { UserProfile } from "../../auth/types/AuthType";

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationItemDTO | null;
  currentUser: UserProfile | null;
  onShowToast: (message: string) => void;
  onRefreshOrg?: () => void;
}

export function MembersModal({
  isOpen,
  onClose,
  organization,
  currentUser,
  onShowToast,
  onRefreshOrg,
}: MembersModalProps) {
  const [members, setMembers] = useState<OrganizationUserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add member state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<OrganizationRole>("MEMBER");
  const [addLoading, setAddLoading] = useState(false);

  // Transfer ownership state
  const [transferLoading, setTransferLoading] = useState(false);

  const fetchMembers = async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const res = await OrganizationUserApi.getMembers(organization.id);
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách thành viên.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && organization) {
      fetchMembers();
      setIsAddingMember(false);
    }
  }, [isOpen, organization?.id]);

  if (!isOpen || !organization) return null;

  const currentRole = organization.user_role;
  const isOwner = currentRole === "OWNER";
  const isOrgManager = currentRole === "ORGANIZATION_MANAGER";
  const canManageMembers = isOwner || isOrgManager;

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
        setIsAddingMember(false);
        fetchMembers();
        onRefreshOrg?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thêm thành viên thất bại.";
      onShowToast(msg);
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, role: OrganizationRole) => {
    try {
      const res = await OrganizationUserApi.updateRole(organization.id, userId, role);
      if (res.success) {
        onShowToast("Đã cập nhật vai trò thành công!");
        fetchMembers();
        onRefreshOrg?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật vai trò thất bại.";
      onShowToast(msg);
    }
  };

  const handleRemoveMember = async (userId: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi tổ chức?`)) return;

    try {
      const res = await OrganizationUserApi.removeMember(organization.id, userId);
      if (res.success) {
        onShowToast(`Đã xóa thành viên "${name}" khỏi tổ chức.`);
        fetchMembers();
        onRefreshOrg?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa thành viên thất bại.";
      onShowToast(msg);
    }
  };

  const handleTransferOwnership = async (newOwnerId: number, name: string) => {
    if (
      !window.confirm(
        `XÁC NHẬN CHUYỂN QUYỀN SỞ HỮU:\nBạn sẽ chuyển quyền Chủ sở hữu tổ chức "${organization.name}" cho "${name}".\nSau thao tác này, bạn sẽ trở thành Quản lý tổ chức.`
      )
    ) {
      return;
    }

    setTransferLoading(true);
    try {
      const res = await OrganizationUserApi.transferOwnership(organization.id, newOwnerId);
      if (res.success) {
        onShowToast(`Đã chuyển quyền chủ sở hữu cho "${name}" thành công!`);
        fetchMembers();
        onRefreshOrg?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chuyển quyền sở hữu thất bại.";
      onShowToast(msg);
    } finally {
      setTransferLoading(false);
    }
  };

  const getRoleBadgeClass = (role: OrganizationRole) => {
    switch (role) {
      case "OWNER":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "ORGANIZATION_MANAGER":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "LABORATORY_MANAGER":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "MEMBER":
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Danh sách thành viên</h2>
              <p className="text-xs text-slate-500 font-medium">
                {organization.name} • <span className="font-mono">[{organization.code}]</span> • {members.length} thành viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar: Add member toggle */}
        {canManageMembers && (
          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Thao tác thành viên</span>
            <button
              type="button"
              onClick={() => setIsAddingMember((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {isAddingMember ? "Đóng form thêm" : "Thêm thành viên"}
            </button>
          </div>
        )}

        {/* Form Add Member */}
        {isAddingMember && (
          <form onSubmit={handleAddMember} className="border-b border-emerald-100 bg-emerald-50/40 p-4 space-y-3">
            <div className="text-xs font-bold text-emerald-900">Thêm thành viên mới vào tổ chức</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tên đăng nhập (username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="VD: user123"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vai trò</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as OrganizationRole)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="MEMBER">Thành viên</option>
                  <option value="LABORATORY_MANAGER">Quản lý phòng lab</option>
                  {isOwner && <option value="ORGANIZATION_MANAGER">Quản lý tổ chức</option>}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="rounded-lg px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="rounded-lg bg-emerald-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {addLoading ? "Đang thêm..." : "Xác nhận thêm"}
              </button>
            </div>
          </form>
        )}

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Đang tải danh sách thành viên...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">{error}</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Chưa có thành viên nào trong tổ chức.</div>
          ) : (
            members.map((m) => {
              const isCurrentUserMember = currentUser?.id === m.user_id;
              const isMemberOwner = m.role === "OWNER";
              const isMemberOrgManager = m.role === "ORGANIZATION_MANAGER";

              // Can current user change this member's role?
              const canEditRole =
                !isMemberOwner &&
                (isOwner || (isOrgManager && !isMemberOrgManager));

              // Can current user remove this member?
              const canRemove =
                !isMemberOwner &&
                !isCurrentUserMember &&
                (isOwner || (isOrgManager && !isMemberOrgManager));

              const joinedDateFormatted = new Date(m.joined_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });

              return (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 transition hover:border-slate-300"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={m.display_name || m.username}
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                        {(m.display_name || m.username).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold text-slate-900">
                          {m.display_name || m.username}
                        </span>
                        {isCurrentUserMember && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">{m.email || m.username}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Tham gia: {joinedDateFormatted}</div>
                    </div>
                  </div>

                  {/* Actions & Role Badge */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Role Dropdown / Badge */}
                    {canEditRole ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleUpdateRole(m.user_id, e.target.value as OrganizationRole)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(
                          m.role
                        )} focus:outline-none`}
                      >
                        <option value="MEMBER">Thành viên</option>
                        <option value="LABORATORY_MANAGER">Quản lý lab</option>
                        {isOwner && <option value="ORGANIZATION_MANAGER">Quản lý tổ chức</option>}
                      </select>
                    ) : (
                      <span
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(m.role)}`}
                      >
                        {getRoleLabel(m.role)}
                      </span>
                    )}

                    {/* Transfer Ownership button (only for current Owner, targeting non-owner) */}
                    {isOwner && !isMemberOwner && (
                      <button
                        type="button"
                        disabled={transferLoading}
                        onClick={() => handleTransferOwnership(m.user_id, m.display_name || m.username)}
                        title="Chuyển quyền Chủ sở hữu cho thành viên này"
                        className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-xs text-amber-700 hover:bg-amber-100 transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                      </button>
                    )}

                    {/* Remove Member button */}
                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.user_id, m.display_name || m.username)}
                        title="Xóa thành viên khỏi tổ chức"
                        className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-xs text-red-600 hover:bg-red-100 transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
