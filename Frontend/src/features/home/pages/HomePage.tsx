import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/context/AuthContext";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { OrganizationCard } from "../components/OrganizationCard";
import { CreateOrgModal } from "../components/CreateOrgModal";
import { JoinOrgModal } from "../components/JoinOrgModal";
import { JoinRequestsModal } from "../components/JoinRequestsModal";
import {
  initialOrganizations,
  mockJoinRequests,
} from "../data/mockOrganizations";
import type {
  OrganizationItemDTO,
  OrganizationJoinRequestEntity,
  OrganizationPrivacy,
} from "../types/organization";
import { isManagerRole } from "../types/organization";

type FilterTab = "all" | "managed" | "joined";
type SortOption = "name" | "members" | "joined_at";

function HomePage() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  // Core State aligned with database schema
  const [organizations, setOrganizations] = useState<OrganizationItemDTO[]>(initialOrganizations);
  const [joinRequests, setJoinRequests] = useState<OrganizationJoinRequestEntity[]>(mockJoinRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [privacyFilter, setPrivacyFilter] = useState<OrganizationPrivacy | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<"all" | "requests" | "settings">("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals & Feedback
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [currentOrgForRequests, setCurrentOrgForRequests] = useState<OrganizationItemDTO | null>(null);
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const handleLogout = async () => {
    await signout();
    navigate("/signin", { replace: true });
  };

  // Handlers for organization actions
  const handleCreateOrg = (newOrgData: Omit<OrganizationItemDTO, "id">) => {
    const newOrg: OrganizationItemDTO = {
      ...newOrgData,
      id: Date.now(),
    };
    setOrganizations((prev) => [newOrg, ...prev]);
    showToast(`Đã tạo thành công tổ chức "${newOrg.name}" [Mã: ${newOrg.code}]!`);
  };

  const handleJoinOrg = (code: string, message?: string) => {
    const upperCode = code.toUpperCase();
    const existing = organizations.find((o) => o.code.toUpperCase() === upperCode);

    if (existing) {
      if (existing.user_role) {
        showToast(`Bạn đã là thành viên của "${existing.name}".`);
        setSelectedOrgId(existing.id);
        return;
      }
    }

    // Check if matching an existing known org or creating a join request
    const targetOrg = organizations.find((o) => o.code.toUpperCase() === upperCode);

    if (targetOrg) {
      if (targetOrg.privacy === "PUBLIC") {
        // Public -> Immediately join as MEMBER (organization_users table)
        setOrganizations((prev) =>
          prev.map((o) =>
            o.id === targetOrg.id
              ? {
                  ...o,
                  user_role: "MEMBER",
                  user_joined_at: new Date().toISOString(),
                  members_count: o.members_count + 1,
                }
              : o
          )
        );
        showToast(`Tham gia thành công vào tổ chức "${targetOrg.name}"!`);
      } else {
        // Private -> Create a PENDING record in organization_join_requests table
        const newRequest: OrganizationJoinRequestEntity = {
          id: Date.now(),
          organization_id: targetOrg.id,
          message: message || "Xin gia nhập tổ chức.",
          creator_user_id: user?.id || 1,
          creator_user_name: user?.display_name || user?.username || "Nghiên cứu viên",
          creator_user_email: user?.email || "user@edu.vn",
          created_at: new Date().toISOString(),
          status: "PENDING",
        };

        setJoinRequests((prev) => [newRequest, ...prev]);
        setOrganizations((prev) =>
          prev.map((o) =>
            o.id === targetOrg.id
              ? {
                  ...o,
                  pending_requests_count: (o.pending_requests_count || 0) + 1,
                }
              : o
          )
        );
        showToast(
          `Đã gửi yêu cầu gia nhập tới Ban quản lý tổ chức "${targetOrg.name}" (đang chờ duyệt).`
        );
      }
    } else {
      // Mock joining a new public organization via external code
      const nowIso = new Date().toISOString();
      const joinedOrg: OrganizationItemDTO = {
        id: Date.now(),
        name: `Tổ chức liên kết [${upperCode}]`,
        description: message || "Tổ chức được thêm qua mã mời tham gia.",
        code: upperCode,
        privacy: "PUBLIC",
        creator_user_id: 99,
        created_at: nowIso,
        user_role: "MEMBER",
        user_joined_at: nowIso,
        creator_display_name: "GS. Điều Phối Viên",
        members_count: 12,
        pending_requests_count: 0,
        theme_color: "teal",
      };

      setOrganizations((prev) => [joinedOrg, ...prev]);
      showToast(`Đã tham gia thành công vào tổ chức [Mã: ${upperCode}]!`);
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
    setCurrentOrgForRequests(org);
    setIsJoinRequestsModalOpen(true);
  };

  const handleApproveRequest = (requestId: number) => {
    const targetReq = joinRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    // Update request status to APPROVED (organization_join_requests table)
    setJoinRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "APPROVED",
              actor_user_id: user?.id || 1,
              acted_at: new Date().toISOString(),
            }
          : r
      )
    );

    // Increase members_count & decrement pending_requests_count (organizations table)
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === targetReq.organization_id
          ? {
              ...o,
              members_count: o.members_count + 1,
              pending_requests_count: Math.max(0, (o.pending_requests_count || 1) - 1),
            }
          : o
      )
    );

    showToast(`Đã phê duyệt người dùng "${targetReq.creator_user_name}" vào tổ chức!`);
  };

  const handleRejectRequest = (requestId: number, reason: string) => {
    const targetReq = joinRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    // Update request status to REJECTED (organization_join_requests table)
    setJoinRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "REJECTED",
              actor_user_id: user?.id || 1,
              acted_at: new Date().toISOString(),
              reject_reason: reason,
            }
          : r
      )
    );

    // Decrement pending_requests_count
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === targetReq.organization_id
          ? {
              ...o,
              pending_requests_count: Math.max(0, (o.pending_requests_count || 1) - 1),
            }
          : o
      )
    );

    showToast("Đã từ chối yêu cầu gia nhập.");
  };

  // Filter & Search Logic
  const filteredOrganizations = useMemo(() => {
    return organizations
      .filter((org) => {
        // Filter tab based on database schema role:
        // Managed: OWNER, ORGANIZATION_MANAGER, LABORATORY_MANAGER
        // Joined: MEMBER
        if (filterTab === "managed" && !isManagerRole(org.user_role)) return false;
        if (filterTab === "joined" && org.user_role !== "MEMBER") return false;

        // Privacy filter: ALL, PUBLIC, PRIVATE
        if (privacyFilter !== "ALL" && org.privacy !== privacyFilter) return false;

        // Selected from sidebar
        if (selectedOrgId && org.id !== selectedOrgId) return false;

        // Search query: name, code, creator, description
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
        // Pinned always on top
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;

        if (sortBy === "name") return a.name.localeCompare(b.name, "vi");
        if (sortBy === "members") return b.members_count - a.members_count;
        if (sortBy === "joined_at") {
          return new Date(b.user_joined_at).getTime() - new Date(a.user_joined_at).getTime();
        }
        return 0;
      });
  }, [organizations, filterTab, privacyFilter, selectedOrgId, searchQuery, sortBy]);

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
      />

      {/* Main Container with Left Sidebar & Right Grid */}
      <div className="flex flex-1 items-start">
        {/* Left Navigation Sidebar */}
        <Sidebar
          organizations={organizations}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          selectedOrgId={selectedOrgId}
          onSelectOrg={(id) => {
            setSelectedOrgId(id);
            setFilterTab("all");
          }}
          activeView={activeView}
          onSelectView={setActiveView}
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
                    Quản lý yêu cầu gia nhập (organization_join_requests)
                  </h1>
                  <p className="text-sm text-slate-500">
                    Danh sách người dùng xin tham gia các tổ chức mà bạn quản lý
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView("all")}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
                                "{req.message}"
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
                  onClick={() => setActiveView("all")}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
                    <div className="text-sm font-semibold text-slate-800">Thông báo khi có yêu cầu mới (organization_join_requests)</div>
                    <div className="text-xs text-slate-500">
                      Hiển thị biểu tượng badge số lượng yêu cầu trên thẻ tổ chức và sidebar
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-emerald-600" />
                </div>
              </div>
            </div>
          )}

          {/* View: All Organizations (Main Google Classroom Grid) */}
          {activeView === "all" && (
            <div className="space-y-6">
              {/* Header Toolbar: Filter Tabs & Sorting */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      {selectedOrgId
                        ? "Chi tiết tổ chức đã chọn"
                        : "Tất cả tổ chức & Phòng thí nghiệm"}
                    </h1>
                    {selectedOrgId && (
                      <button
                        type="button"
                        onClick={() => setSelectedOrgId(null)}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                      >
                        Bỏ chọn
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Phân loại theo vai trò (role) và phạm vi truy cập (privacy: PUBLIC, PRIVATE)
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Segmented Role Tabs: All, Managed (OWNER/MANAGER), Joined (MEMBER) */}
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTab("all");
                        setSelectedOrgId(null);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        filterTab === "all" && !selectedOrgId
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Tất cả ({organizations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTab("managed");
                        setSelectedOrgId(null);
                      }}
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
                      onClick={() => {
                        setFilterTab("joined");
                        setSelectedOrgId(null);
                      }}
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
                      <option value="PUBLIC">PUBLIC (Công khai)</option>
                      <option value="PRIVATE">PRIVATE (Riêng tư)</option>
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

              {/* Grid of Google Classroom style Organization Cards */}
              {filteredOrganizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredOrganizations.map((org) => (
                    <OrganizationCard
                      key={org.id}
                      organization={org}
                      onEnter={(o) => showToast(`Đang truy cập vào tổ chức: ${o.name}...`)}
                      onCopyCode={handleCopyCode}
                      onViewRequests={handleOpenRequestsModal}
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
                        setSelectedOrgId(null);
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
    </div>
  );
}

export default HomePage;
