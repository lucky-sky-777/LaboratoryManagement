import { useState, useRef, useEffect } from "react";
import type { OrganizationItemDTO } from "../types/organization";
import { isManagerRole, getRoleLabel } from "../types/organization";

interface OrganizationCardProps {
  organization: OrganizationItemDTO;
  onEnter: (org: OrganizationItemDTO) => void;
  onCopyCode: (code: string) => void;
  onViewRequests?: (org: OrganizationItemDTO) => void;
  onTogglePin?: (id: number) => void;
}

export function OrganizationCard({
  organization,
  onEnter,
  onCopyCode,
  onViewRequests,
  onTogglePin,
}: OrganizationCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isManager = isManagerRole(organization.user_role);

  // Role Badge Styling according to schema role enum
  const getRoleBadgeStyle = (role: OrganizationItemDTO["user_role"]) => {
    switch (role) {
      case "OWNER":
        return "bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400/20";
      case "ORGANIZATION_MANAGER":
        return "bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400/20";
      case "LABORATORY_MANAGER":
        return "bg-sky-100 text-sky-900 border-sky-300 ring-1 ring-sky-400/20";
      case "MEMBER":
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  // Theme Gradient for Google Classroom Card Banner
  const getThemeGradient = (theme?: OrganizationItemDTO["theme_color"]) => {
    switch (theme) {
      case "emerald":
        return "from-emerald-700 via-teal-800 to-slate-900";
      case "blue":
        return "from-sky-700 via-blue-800 to-indigo-950";
      case "indigo":
        return "from-indigo-700 via-indigo-900 to-slate-950";
      case "purple":
        return "from-purple-800 via-purple-950 to-slate-950";
      case "amber":
        return "from-amber-700 via-orange-800 to-neutral-900";
      case "teal":
        return "from-teal-700 via-cyan-900 to-slate-950";
      default:
        return "from-slate-700 via-slate-800 to-slate-950";
    }
  };

  const creatorName = organization.creator_display_name || "Chủ nhiệm phòng";
  const creatorInitials = creatorName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // Format joined date (timestamptz)
  const formattedJoinedDate = new Date(organization.user_joined_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/40">
      {/* Top Banner (Google Classroom Card Header) */}
      <div
        className={`relative flex h-36 flex-col justify-between p-4 bg-gradient-to-br ${getThemeGradient(
          organization.theme_color
        )} text-white overflow-hidden`}
      >
        {/* Subtle decorative background pattern */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-10">
          <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z" />
          </svg>
        </div>

        {/* Top Header Row: Privacy Badge & Action Menu */}
        <div className="flex items-start justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Database schema property: privacy (PUBLIC / PRIVATE) */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-md ${
                organization.privacy === "PUBLIC"
                  ? "bg-emerald-500/30 text-emerald-100 border border-emerald-400/30"
                  : "bg-amber-500/30 text-amber-100 border border-amber-400/30"
              }`}
            >
              {organization.privacy === "PUBLIC" ? (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  <span>Công khai</span>
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <span>Riêng tư</span>
                </>
              )}
            </span>

            {/* Database schema property: code (varchar(10)) */}
            <span className="font-mono text-[11px] font-bold tracking-wider bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full text-white/90 border border-white/10">
              {organization.code}
            </span>
          </div>

          {/* 3-dots Classroom Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Tùy chọn tổ chức"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-9 z-30 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onCopyCode(organization.code);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                  <span>Sao chép mã tham gia ({organization.code})</span>
                </button>

                {isManager && onViewRequests && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onViewRequests(organization);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                    <span>Xem yêu cầu gia nhập</span>
                  </button>
                )}

                {onTogglePin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onTogglePin(organization.id);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    <span>{organization.is_pinned ? "Bỏ ghim" : "Ghim lên đầu"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Creator Row */}
        <div className="z-10 mt-1">
          <button
            type="button"
            onClick={() => onEnter(organization)}
            className="group/title block text-left"
          >
            <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-white transition-colors group-hover/title:underline">
              {organization.name}
            </h3>
          </button>
        </div>

        {/* Bottom Banner Row: Creator Display Name & Overlapping Avatar */}
        <div className="flex items-end justify-between z-10 pt-1">
          <div className="truncate pr-2">
            <span className="text-[10px] uppercase tracking-wider text-white/70 block">
              Người tạo (creator)
            </span>
            <span className="truncate text-xs font-semibold text-white drop-shadow-xs">
              {creatorName}
            </span>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-xs font-bold text-white shadow-md">
            {creatorInitials}
          </div>
        </div>
      </div>

      {/* Middle Card Content: Database Schema Attributes */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3.5">
        {/* User's Role Tag & Description */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Database schema property: organization_users.role */}
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${getRoleBadgeStyle(
                organization.user_role
              )}`}
            >
              {getRoleLabel(organization.user_role)}
            </span>

            {/* Database schema property: organization_users.joined_at */}
            <span className="text-[11px] text-slate-400">
              Gia nhập: {formattedJoinedDate}
            </span>
          </div>

          {/* Database schema property: organizations.description */}
          <p className="line-clamp-2 text-xs text-slate-600 leading-relaxed">
            {organization.description || "Chưa có mô tả cho tổ chức này."}
          </p>
        </div>

        {/* Database Schema Statistics: members_count, privacy, code */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-center">
          <div>
            <div className="text-base font-bold text-slate-800">{organization.members_count}</div>
            <div className="text-[10px] font-medium text-slate-500">Thành viên (users)</div>
          </div>
          <div className="border-l border-slate-200/80">
            <div className="text-base font-bold text-slate-800 capitalize">
              {organization.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}
            </div>
            <div className="text-[10px] font-medium text-slate-500">Phạm vi (privacy)</div>
          </div>
        </div>

        {/* Notification Banner for Pending Join Requests (organization_join_requests) */}
        {isManager && organization.pending_requests_count && organization.pending_requests_count > 0 ? (
          <div
            onClick={() => onViewRequests && onViewRequests(organization)}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 transition hover:bg-amber-100/70"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white font-bold">
                !
              </span>
              <span className="text-xs font-semibold text-amber-900">
                {organization.pending_requests_count} yêu cầu tham gia chờ duyệt
              </span>
            </div>
            <span className="text-xs font-bold text-amber-700 underline">Duyệt ngay →</span>
          </div>
        ) : null}
      </div>

      {/* Card Footer (Google Classroom style bottom actions) */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-mono text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
            Mã: {organization.code}
          </span>
        </div>

        {/* Enter Organization Action Button */}
        <button
          type="button"
          onClick={() => onEnter(organization)}
          className="group/btn flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-300 shadow-2xs transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
        >
          <span>Vào tổ chức</span>
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
