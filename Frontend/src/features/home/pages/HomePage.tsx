/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useAuth } from "../../auth/context/AuthContext";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { OrganizationCard } from "../components/OrganizationCard";
import { CreateOrgModal } from "../components/CreateOrgModal";
import { JoinOrgModal } from "../components/JoinOrgModal";
import { JoinRequestsModal } from "../components/JoinRequestsModal";
import { EditOrgModal } from "../../organizations/components/EditOrgModal";
import { ProfileView } from "../../auth/components/ProfileView";
import {
  OrganizationDetailView,
  type OrganizationDetailTab,
} from "../../organizations/components/OrganizationDetailView";
import { OrganizationApi } from "../../organizations/api/OrganizationApi";
import { OrganizationUserApi } from "../../organizations/api/OrganizationUserApi";
import { OrganizationJoinRequestApi } from "../../organizations/api/OrganizationJoinRequestApi";
import type {
  OrganizationItemDTO,
  OrganizationJoinRequestEntity,
  OrganizationPrivacy,
  OrganizationRole,
} from "../types/organization";
import { isManagerRole } from "../types/organization";

type FilterTab = "all" | "managed" | "joined";
type SortOption = "name" | "members" | "joined_at";

const THEME_COLORS: Array<NonNullable<OrganizationItemDTO["theme_color"]>> = [
  "emerald",
  "blue",
  "indigo",
  "purple",
  "amber",
  "teal",
];

function getThemeForOrg(orgId: number): NonNullable<OrganizationItemDTO["theme_color"]> {
  return THEME_COLORS[Math.abs(orgId) % THEME_COLORS.length];
}

function HomePage() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, tab } = useParams<{ id?: string; tab?: string }>();

  // Route-derived active states
  const selectedOrgId = id ? Number(id) : null;
  const activeView: "all" | "requests" | "settings" | "profile" = useMemo(() => {
    if (location.pathname.startsWith("/requests")) return "requests";
    if (location.pathname.startsWith("/settings")) return "settings";
    if (location.pathname.startsWith("/profile")) return "profile";
    return "all";
  }, [location.pathname]);

  const activeTab: OrganizationDetailTab = useMemo(() => {
    if (tab === "members") return "members";
    if (tab === "requests") return "requests";
    return "overview";
  }, [tab]);

  // Core API State
  const [organizations, setOrganizations] = useState<OrganizationItemDTO[]>([]);
  const [directOrg, setDirectOrg] = useState<OrganizationItemDTO | null>(null);
  const [joinRequests, setJoinRequests] = useState<OrganizationJoinRequestEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [privacyFilter, setPrivacyFilter] = useState<OrganizationPrivacy | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals & Feedback
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [currentOrgForRequests, setCurrentOrgForRequests] = useState<OrganizationItemDTO | null>(null);
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = useState(false);

  const [currentOrgForEdit, setCurrentOrgForEdit] = useState<OrganizationItemDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  }, []);

  const handleLogout = async () => {
    await signout();
    navigate("/signin", { replace: true });
  };

  /**
   * Fetch all organizations and related join requests from real backend APIs
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch joined organizations
      const joinedRes = await OrganizationUserApi.getJoinedOrganizations();
      const memberships = (joinedRes.success && joinedRes.data) ? joinedRes.data : [];

      // 2. Map into OrganizationItemDTO array
      const orgItems: OrganizationItemDTO[] = await Promise.all(
        memberships.map(async (m) => {
          let orgDetail = null;
          let membersCount = 1;
          let pendingRequestsCount = 0;

          try {
            const orgRes = await OrganizationApi.getById(m.organization_id);
            if (orgRes.success && orgRes.data) {
              orgDetail = orgRes.data;
            }
          } catch {
            // Ignore individual fetch failure
          }

          // Count members
          try {
            const memRes = await OrganizationUserApi.getMembers(m.organization_id);
            if (memRes.success && memRes.data) {
              membersCount = memRes.data.length;
            }
          } catch {
            // Ignore
          }

          // If manager/owner, fetch pending requests count
          if (isManagerRole(m.role)) {
            try {
              const reqRes = await OrganizationJoinRequestApi.getOrgJoinRequests(
                m.organization_id,
                "PENDING"
              );
              if (reqRes.success && reqRes.data) {
                pendingRequestsCount = reqRes.data.length;
              }
            } catch {
              // Ignore
            }
          }

          return {
            id: m.organization_id,
            name: orgDetail?.name || m.organization_name,
            description: orgDetail?.description || "",
            code: orgDetail?.code || m.organization_code,
            privacy: orgDetail?.privacy || "PRIVATE",
            creator_user_id: orgDetail?.creator_id || 0,
            created_at: orgDetail?.created_at || m.joined_at,
            user_role: m.role as OrganizationRole,
            user_joined_at: m.joined_at,
            creator_display_name: orgDetail?.creator?.display_name || orgDetail?.creator?.username || "Chủ nhiệm phòng",
            creator_email: orgDetail?.creator?.email || "",
            members_count: membersCount,
            pending_requests_count: pendingRequestsCount,
            theme_color: getThemeForOrg(m.organization_id),
            is_pinned: false,
          };
        })
      );

      setOrganizations(orgItems);

      // 3. Fetch all join requests for organizations managed by this user
      const managedOrgIds = orgItems
        .filter((o) => isManagerRole(o.user_role))
        .map((o) => o.id);

      const allRequests: OrganizationJoinRequestEntity[] = [];
      await Promise.all(
        managedOrgIds.map(async (orgId) => {
          try {
            const reqRes = await OrganizationJoinRequestApi.getOrgJoinRequests(orgId);
            if (reqRes.success && reqRes.data) {
              reqRes.data.forEach((r) => {
                allRequests.push({
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
                });
              });
            }
          } catch {
            // Ignore
          }
        })
      );

      setJoinRequests(allRequests);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải dữ liệu tổ chức.";
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for organization actions
  const handleCreateOrg = async (newOrgData: Omit<OrganizationItemDTO, "id">) => {
    try {
      const res = await OrganizationApi.create({
        name: newOrgData.name,
        description: newOrgData.description,
        code: newOrgData.code,
        privacy: newOrgData.privacy,
      });

      if (res.success && res.data) {
        showToast(`Đã tạo thành công tổ chức "${res.data.name}" [Mã: ${res.data.code}]!`);
        await loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tạo tổ chức thất bại.";
      showToast(msg);
    }
  };

  const handleJoinOrg = async (code: string, message?: string) => {
    try {
      const res = await OrganizationJoinRequestApi.submitJoin({
        code: code.trim().toUpperCase(),
        message: message?.trim(),
      });

      if (res.success && res.data) {
        showToast(res.data.message || res.message);
        await loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tham gia tổ chức thất bại.";
      showToast(msg);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast(`Đã sao chép mã tổ chức "${code}" vào clipboard!`);
    } catch {
      showToast(`Mã tham gia tổ chức: ${code}`);
    }
  };

  const handleTogglePin = (id: number) => {
    setOrganizations((prev) =>
      prev.map((org) => (org.id === id ? { ...org, is_pinned: !org.is_pinned } : org))
    );
  };

  const handleOpenRequestsModal = (org: OrganizationItemDTO) => {
    navigate(`/laboratories/${org.id}/requests`);
  };

  const handleOpenMembersModal = (org: OrganizationItemDTO) => {
    navigate(`/laboratories/${org.id}/members`);
  };

  const handleOpenEditModal = (org: OrganizationItemDTO) => {
    setCurrentOrgForEdit(org);
    setIsEditModalOpen(true);
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      const res = await OrganizationJoinRequestApi.approve(requestId);
      if (res.success) {
        showToast("Đã phê duyệt yêu cầu gia nhập thành công!");
        await loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Phê duyệt thất bại.";
      showToast(msg);
    }
  };

  const handleRejectRequest = async (requestId: number, reason: string) => {
    try {
      const res = await OrganizationJoinRequestApi.reject(requestId, reason);
      if (res.success) {
        showToast("Đã từ chối yêu cầu gia nhập.");
        await loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Từ chối yêu cầu thất bại.";
      showToast(msg);
    }
  };

  // If accessing a lab by URL directly that wasn't in organizations state yet, fetch it
  useEffect(() => {
    if (!selectedOrgId) {
      setDirectOrg(null);
      return;
    }

    const found = organizations.find((o) => o.id === selectedOrgId);
    if (found) {
      setDirectOrg(found);
      return;
    }

    if (!isLoading && !found) {
      OrganizationApi.getById(selectedOrgId)
        .then(async (res) => {
          if (res.success && res.data) {
            const orgData = res.data;
            let membersCount = 1;
            let userRole: OrganizationRole = "MEMBER";

            try {
              const memRes = await OrganizationUserApi.getMembers(selectedOrgId);
              if (memRes.success && memRes.data) {
                membersCount = memRes.data.length;
                const myMem = memRes.data.find((m) => m.user_id === user?.id);
                if (myMem) {
                  userRole = myMem.role;
                }
              }
            } catch {
              // Ignore
            }

            setDirectOrg({
              id: orgData.id,
              name: orgData.name,
              description: orgData.description || "",
              code: orgData.code,
              privacy: orgData.privacy || "PRIVATE",
              creator_user_id: orgData.creator_id || 0,
              created_at: orgData.created_at,
              user_role: userRole,
              user_joined_at: orgData.created_at,
              creator_display_name: orgData.creator?.display_name || orgData.creator?.username || "Chủ nhiệm phòng",
              creator_email: orgData.creator?.email || "",
              members_count: membersCount,
              pending_requests_count: 0,
              theme_color: getThemeForOrg(orgData.id),
              is_pinned: false,
            });
          }
        })
        .catch(() => {
          // Ignore
        });
    }
  }, [selectedOrgId, organizations, isLoading, user?.id]);

  // Currently accessed organization (when entering an organization)
  const accessedOrg = useMemo(() => {
    if (!selectedOrgId) return null;
    return organizations.find((o) => o.id === selectedOrgId) || directOrg;
  }, [organizations, selectedOrgId, directOrg]);

  // Filter & Search Logic
  const filteredOrganizations = useMemo(() => {
    return organizations
      .filter((org) => {
        if (filterTab === "managed" && !isManagerRole(org.user_role)) return false;
        if (filterTab === "joined" && org.user_role !== "MEMBER") return false;

        if (privacyFilter !== "ALL" && org.privacy !== privacyFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = org.name.toLowerCase().includes(q);
          const matchCode = org.code.toLowerCase().includes(q);
          const matchDesc = org.description.toLowerCase().includes(q);
          const matchCreator = (org.creator_display_name || "").toLowerCase().includes(q);
          return matchName || matchCode || matchDesc || matchCreator;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;

        if (sortBy === "name") return a.name.localeCompare(b.name, "vi");
        if (sortBy === "members") return b.members_count - a.members_count;
        if (sortBy === "joined_at") {
          return new Date(b.user_joined_at).getTime() - new Date(a.user_joined_at).getTime();
        }
        return 0;
      });
  }, [organizations, filterTab, privacyFilter, searchQuery, sortBy]);

  const managedCount = organizations.filter((o) => isManagerRole(o.user_role)).length;
  const joinedCount = organizations.filter((o) => o.user_role === "MEMBER").length;

  const totalPendingRequests = useMemo(() => {
    return organizations
      .filter((o) => isManagerRole(o.user_role))
      .reduce((sum, o) => sum + (o.pending_requests_count || 0), 0);
  }, [organizations]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased">
      {/* Top Google Classroom Navigation Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onNavigateHome={() => navigate("/")}
        onNavigateSettings={() => navigate("/settings")}
        onNavigateProfile={() => navigate("/profile")}
      />

      {/* Main Container with Left Sidebar & Right Grid */}
      <div className="flex flex-1 items-start">
        {/* Left Navigation Sidebar */}
        <Sidebar
          organizations={organizations}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          selectedOrgId={selectedOrgId}
          onSelectOrg={(orgId) => {
            if (orgId) {
              navigate(`/laboratories/${orgId}`);
            } else {
              navigate("/");
            }
          }}
          activeView={activeView}
          onSelectView={(view) => {
            if (view === "requests") {
              navigate("/requests");
            } else if (view === "settings") {
              navigate("/settings");
            } else if (view === "profile") {
              navigate("/profile");
            } else {
              navigate("/");
            }
          }}
          totalPendingRequests={totalPendingRequests}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
              <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* View: Join Requests Management (organization_join_requests) */}
          {activeView === "requests" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Quản lý yêu cầu gia nhập
                  </h1>
                  <p className="text-sm text-slate-500">
                    Danh sách người dùng xin tham gia các tổ chức mà bạn quản lý
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  ← Về danh sách tổ chức
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {joinRequests.filter((r) => r.status === "PENDING").length > 0 ? (
                  joinRequests
                    .filter((r) => r.status === "PENDING")
                    .map((req) => {
                      const org = organizations.find((o) => o.id === req.organization_id);
                      return (
                        <div
                          key={req.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/90 p-4 bg-slate-50/50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                              {(req.creator_user_name || "U").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                {req.creator_user_name}
                                <span className="text-xs font-normal text-slate-400 ml-2">
                                  ({req.creator_user_email})
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                                Tổ chức: {org?.name} [{org?.code}]
                              </div>
                              <div className="text-xs text-slate-600 mt-1 italic bg-white p-2 rounded border border-slate-100">
                                "{req.message || "Không có lời nhắn đi kèm."}"
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleRejectRequest(req.id, "Từ chối")}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                            >
                              Từ chối
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveRequest(req.id)}
                              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                            >
                              Phê duyệt
                            </button>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    Không có yêu cầu gia nhập nào đang chờ duyệt.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View: Settings */}
          {activeView === "settings" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Cài đặt hệ thống Laboratory</h1>
                  <p className="text-sm text-slate-500">Tùy chỉnh phân quyền, phạm vi truy cập và thông báo</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  ← Về danh sách tổ chức
                </button>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Tự động duyệt yêu cầu phòng PUBLIC</div>
                    <div className="text-xs text-slate-500">
                      Cho phép người dùng có mã phòng PUBLIC tham gia trực tiếp không cần tạo yêu cầu chờ duyệt
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-emerald-600" />
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Thông báo khi có yêu cầu mới</div>
                    <div className="text-xs text-slate-500">
                      Hiển thị biểu tượng badge số lượng yêu cầu trên thẻ tổ chức và sidebar
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-emerald-600" />
                </div>
              </div>
            </div>
          )}

          {/* View: User Profile Management */}
          {activeView === "profile" && (
            <ProfileView
              onBack={() => navigate("/")}
              onShowToast={showToast}
            />
          )}

          {/* View: All Organizations or Accessed Organization Content */}
          {activeView === "all" && (
            selectedOrgId !== null ? (
              isLoading && !accessedOrg ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  <p className="text-xs font-medium">Đang tải thông tin tổ chức...</p>
                </div>
              ) : accessedOrg ? (
                <OrganizationDetailView
                  organization={accessedOrg}
                  currentUser={user}
                  activeTab={activeTab}
                  onTabChange={(newTab) => {
                    if (newTab === "overview") {
                      navigate(`/laboratories/${accessedOrg.id}`);
                    } else {
                      navigate(`/laboratories/${accessedOrg.id}/${newTab}`);
                    }
                  }}
                  onBack={() => navigate("/")}
                  onShowToast={showToast}
                  onRefreshOrg={loadData}
                  onEditOrg={handleOpenEditModal}
                  onViewRequests={handleOpenRequestsModal}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Không tìm thấy tổ chức</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md">
                    Tổ chức với mã số #{selectedOrgId} không tồn tại hoặc bạn chưa được thêm vào tổ chức này.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    ← Quay lại danh sách tổ chức
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-6">
                {/* Header Toolbar: Filter Tabs & Sorting */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                        Tất cả tổ chức & Phòng thí nghiệm
                      </h1>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                      Phân loại theo vai trò và phạm vi truy cập
                    </p>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Segmented Role Tabs */}
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => setFilterTab("all")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          filterTab === "all"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Tất cả ({organizations.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterTab("managed")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          filterTab === "managed"
                            ? "bg-white text-emerald-800 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Đang quản lý ({managedCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterTab("joined")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          filterTab === "joined"
                            ? "bg-white text-emerald-800 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Đã tham gia ({joinedCount})
                      </button>
                    </div>

                    {/* Privacy Filter Dropdown (PUBLIC / PRIVATE) */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Phạm vi:</span>
                      <select
                        value={privacyFilter}
                        onChange={(e) => setPrivacyFilter(e.target.value as OrganizationPrivacy | "ALL")}
                        className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">Tất cả</option>
                        <option value="PUBLIC">Công khai</option>
                        <option value="PRIVATE">Riêng tư</option>
                      </select>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                      </svg>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="name">Tên tổ chức A-Z</option>
                        <option value="members">Nhiều thành viên nhất</option>
                        <option value="joined_at">Mới tham gia gần đây</option>
                      </select>
                    </div>

                    {/* Quick Action Button */}
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span>Tạo tổ chức</span>
                    </button>
                  </div>
                </div>

                {/* Grid or Loading / Empty */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    <p className="text-xs font-medium">Đang tải danh sách tổ chức...</p>
                  </div>
                ) : filteredOrganizations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredOrganizations.map((org) => (
                      <OrganizationCard
                        key={org.id}
                        organization={org}
                        onEnter={(o) => navigate(`/laboratories/${o.id}`)}
                        onCopyCode={handleCopyCode}
                        onViewRequests={handleOpenRequestsModal}
                        onViewMembers={handleOpenMembersModal}
                        onEditOrg={handleOpenEditModal}
                        onTogglePin={handleTogglePin}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Không tìm thấy tổ chức phù hợp</h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md">
                      Không có tổ chức nào khớp với bộ lọc vai trò, phạm vi truy cập hoặc từ khóa tìm kiếm.
                    </p>
                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setFilterTab("all");
                          setPrivacyFilter("ALL");
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Xóa bộ lọc
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        + Tạo tổ chức mới
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateOrgModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateOrg}
        currentUserId={user?.id || 1}
      />

      <JoinOrgModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinOrg}
        user={user}
      />

      <JoinRequestsModal
        isOpen={isJoinRequestsModalOpen}
        onClose={() => {
          setIsJoinRequestsModalOpen(false);
          setCurrentOrgForRequests(null);
        }}
        organization={currentOrgForRequests}
        requests={joinRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />

      {/* Organization Configuration & Deletion Modal */}
      <EditOrgModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCurrentOrgForEdit(null);
        }}
        organization={currentOrgForEdit}
        onShowToast={showToast}
        onOrgUpdated={loadData}
        onOrgDeleted={loadData}
      />
    </div>
  );
}

export default HomePage;
