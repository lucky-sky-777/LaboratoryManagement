import type { OrganizationItemDTO } from "../types/organization";
import { isManagerRole, getRoleLabel } from "../types/organization";

interface SidebarProps {
  organizations: OrganizationItemDTO[];
  isOpen: boolean;
  onCloseMobile: () => void;
  selectedOrgId: number | null;
  onSelectOrg: (id: number | null) => void;
  activeView: "all" | "requests" | "settings";
  onSelectView: (view: "all" | "requests" | "settings") => void;
  totalPendingRequests: number;
}

export function Sidebar({
  organizations,
  isOpen,
  onCloseMobile,
  selectedOrgId,
  onSelectOrg,
  activeView,
  onSelectView,
  totalPendingRequests,
}: SidebarProps) {
  // Categorize based on database schema role:
  // Managers: OWNER, ORGANIZATION_MANAGER, LABORATORY_MANAGER
  // Members: MEMBER
  const managedOrgs = organizations.filter((org) => isManagerRole(org.user_role));
  const joinedOrgs = organizations.filter((org) => org.user_role === "MEMBER");

  const getThemeBgColor = (theme?: OrganizationItemDTO["theme_color"]) => {
    switch (theme) {
      case "emerald":
        return "bg-emerald-600";
      case "blue":
        return "bg-blue-600";
      case "indigo":
        return "bg-indigo-600";
      case "purple":
        return "bg-purple-600";
      case "amber":
        return "bg-amber-600";
      case "teal":
        return "bg-teal-600";
      default:
        return "bg-slate-600";
    }
  };

  const renderOrgItem = (org: OrganizationItemDTO) => {
    const isSelected = selectedOrgId === org.id && activeView === "all";
    const initials = org.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    return (
      <button
        key={org.id}
        type="button"
        onClick={() => {
          onSelectOrg(org.id);
          onSelectView("all");
        }}
        title={`${org.name} (${org.code}) - ${getRoleLabel(org.user_role)}`}
        className={`group flex w-full items-center gap-3 rounded-r-full py-2.5 pl-4 pr-3 text-left transition-colors duration-150 ${
          isSelected
            ? "bg-emerald-50 text-emerald-900 font-semibold border-l-4 border-emerald-600"
            : "text-slate-700 hover:bg-slate-100/80 border-l-4 border-transparent"
        }`}
      >
        {/* Circle with initial letters */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${getThemeBgColor(
            org.theme_color
          )}`}
        >
          {initials}
        </div>

        {/* Text info: Name & Schema properties */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium leading-snug group-hover:text-slate-900">
            {org.name}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-500">
            <span className="font-mono text-[11px] font-semibold text-slate-600">
              [{org.code}]
            </span>
            <span>•</span>
            <span className="truncate">{getRoleLabel(org.user_role)}</span>
          </div>
        </div>

        {/* Pending Requests Badge if manager and has pending requests */}
        {org.pending_requests_count && org.pending_requests_count > 0 ? (
          <span
            title={`${org.pending_requests_count} yêu cầu tham gia chờ duyệt`}
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white shadow-xs"
          >
            {org.pending_requests_count}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Vertical Navigation Bar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 transform overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full lg:hidden"
        }`}
      >
        <div className="flex flex-col py-3">
          {/* Main system nav items */}
          <div className="space-y-1 pr-2">
            <button
              type="button"
              onClick={() => {
                onSelectOrg(null);
                onSelectView("all");
              }}
              className={`flex w-full items-center gap-3.5 rounded-r-full py-2.5 pl-4 pr-3 text-sm font-medium transition-colors ${
                activeView === "all" && selectedOrgId === null
                  ? "bg-emerald-50 text-emerald-900 font-semibold border-l-4 border-emerald-600"
                  : "text-slate-700 hover:bg-slate-100/80 border-l-4 border-transparent"
              }`}
            >
              <svg
                className={`h-5 w-5 ${
                  activeView === "all" && selectedOrgId === null
                    ? "text-emerald-700"
                    : "text-slate-500"
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
              <span>Trang chủ</span>
            </button>

            {/* Quick access to Join Requests */}
            <button
              type="button"
              onClick={() => {
                onSelectView("requests");
                onSelectOrg(null);
              }}
              className={`flex w-full items-center justify-between rounded-r-full py-2.5 pl-4 pr-3 text-sm font-medium transition-colors ${
                activeView === "requests"
                  ? "bg-emerald-50 text-emerald-900 font-semibold border-l-4 border-emerald-600"
                  : "text-slate-700 hover:bg-slate-100/80 border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <svg
                  className={`h-5 w-5 ${
                    activeView === "requests" ? "text-emerald-700" : "text-slate-500"
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
              </div>
              {totalPendingRequests > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-2xs">
                  {totalPendingRequests}
                </span>
              )}
            </button>
          </div>

          <div className="my-2 border-t border-slate-200" />

          {/* Section: Đang quản lý (OWNER, ORGANIZATION_MANAGER, LABORATORY_MANAGER) */}
          <div className="py-1">
            <div className="flex items-center justify-between px-4 py-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <span>Đang quản lý</span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-bold">
                {managedOrgs.length}
              </span>
            </div>

            <div className="mt-1 space-y-0.5 pr-2">
              {managedOrgs.length > 0 ? (
                managedOrgs.map(renderOrgItem)
              ) : (
                <div className="px-4 py-2 text-xs text-slate-400 italic">
                  Chưa quản lý tổ chức nào
                </div>
              )}
            </div>
          </div>

          <div className="my-2 border-t border-slate-200" />

          {/* Section: Đã tham gia (MEMBER) */}
          <div className="py-1">
            <div className="flex items-center justify-between px-4 py-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <span>Đã tham gia</span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-bold">
                {joinedOrgs.length}
              </span>
            </div>

            <div className="mt-1 space-y-0.5 pr-2">
              {joinedOrgs.length > 0 ? (
                joinedOrgs.map(renderOrgItem)
              ) : (
                <div className="px-4 py-2 text-xs text-slate-400 italic">
                  Chưa tham gia tổ chức nào
                </div>
              )}
            </div>
          </div>

          <div className="my-2 border-t border-slate-200" />

          {/* Bottom Settings Link */}
          <div className="space-y-1 pr-2">
            <button
              type="button"
              onClick={() => {
                onSelectView("settings");
                onSelectOrg(null);
              }}
              className={`flex w-full items-center gap-3.5 rounded-r-full py-2.5 pl-4 pr-3 text-sm font-medium transition-colors ${
                activeView === "settings"
                  ? "bg-emerald-50 text-emerald-900 font-semibold border-l-4 border-emerald-600"
                  : "text-slate-700 hover:bg-slate-100/80 border-l-4 border-transparent"
              }`}
            >
              <svg
                className={`h-5 w-5 ${
                  activeView === "settings" ? "text-emerald-700" : "text-slate-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>Cài đặt hệ thống</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
