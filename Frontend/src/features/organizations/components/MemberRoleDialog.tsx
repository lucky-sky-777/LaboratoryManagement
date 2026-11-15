import { useState } from "react";
import { OrganizationUserApi } from "../api/OrganizationUserApi";
import type {
  OrganizationItemDTO,
  OrganizationRole,
  OrganizationUserResponse,
} from "../types/OrganizationType";
import { getRoleLabel } from "../types/OrganizationType";

interface MemberRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationItemDTO;
  member: OrganizationUserResponse | null;
  onRoleUpdated: () => void;
  onShowToast: (message: string) => void;
}

interface RoleOption {
  role: OrganizationRole;
  title: string;
  badgeClass: string;
  description: string;
  permissions: string[];
}

const ASSIGNABLE_ROLES: RoleOption[] = [
  {
    role: "MEMBER",
    title: "Thành viên",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    description: "Thành viên thông thường trong tổ chức.",
    permissions: [
      "Xem danh sách phòng thí nghiệm và thiết bị",
      "Xem danh sách các thành viên trong tổ chức",
      "Gửi yêu cầu mượn thiết bị hoặc đăng ký phòng thí nghiệm",
    ],
  },
  {
    role: "LABORATORY_MANAGER",
    title: "Quản lý phòng lab",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
    description: "Phụ trách quản trị các phòng thí nghiệm và trang thiết bị.",
    permissions: [
      "Tất cả quyền hạn của Thành viên",
      "Cấu hình và cập nhật thông tin phòng thí nghiệm",
      "Quản lý danh mục thiết bị, duyệt mượn trả và bảo trì thiết bị",
    ],
  },
  {
    role: "ORGANIZATION_MANAGER",
    title: "Quản lý tổ chức",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Hỗ trợ Chủ sở hữu quản trị vận hành tổ chức.",
    permissions: [
      "Tất cả quyền hạn của Quản lý phòng lab",
      "Kiểm duyệt và phê duyệt / từ chối các yêu cầu gia nhập",
      "Thêm mới và quản lý thành viên thông thường",
      "Cập nhật thông tin và cài đặt chung của tổ chức",
    ],
  },
];

export function MemberRoleDialog({
  isOpen,
  onClose,
  organization,
  member,
  onRoleUpdated,
  onShowToast,
}: MemberRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<OrganizationRole>(
    member?.role || "MEMBER"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sync selectedRole if member prop changes
  if (!isOpen || !member) return null;

  const currentRole = member.role;
  const isUnchanged = selectedRole === currentRole;

  const handleSave = async () => {
    if (isUnchanged) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const res = await OrganizationUserApi.updateRole(
        organization.id,
        member.user_id,
        selectedRole
      );

      if (res.success) {
        onShowToast(
          `Đã phân quyền thành công: "${
            member.display_name || member.username
          }" hiện là ${getRoleLabel(selectedRole)}.`
        );
        onRoleUpdated();
        onClose();
      } else {
        onShowToast(res.message || "Cập nhật phân quyền thất bại.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Cập nhật phân quyền thất bại.";
      onShowToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const memberInitials = (member.display_name || member.username || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              <svg
                className="h-5 w-5"
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
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Phân quyền thành viên
              </h2>
              <p className="text-xs text-slate-500">
                Chỉ định vai trò và phạm vi quyền hạn trong tổ chức
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Member Profile Summary */}
        <div className="border-b border-slate-100 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.display_name || member.username}
                className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs">
                {memberInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-slate-900">
                  {member.display_name || member.username}
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  (@{member.username})
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span className="truncate">{member.email || "Không có email"}</span>
                <span>•</span>
                <span>
                  Hiện tại:{" "}
                  <strong className="text-slate-700">
                    {getRoleLabel(currentRole)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Roles List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Chọn vai trò phân quyền
          </label>

          <div className="space-y-2.5">
            {ASSIGNABLE_ROLES.map((opt) => {
              const isSelected = selectedRole === opt.role;
              return (
                <div
                  key={opt.role}
                  onClick={() => setSelectedRole(opt.role)}
                  className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all duration-150 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="memberRole"
                        checked={isSelected}
                        onChange={() => setSelectedRole(opt.role)}
                        className="mt-1 h-4 w-4 accent-emerald-600 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {opt.title}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${opt.badgeClass}`}
                          >
                            {getRoleLabel(opt.role)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {opt.description}
                        </p>

                        {/* Permissions list */}
                        <div className="mt-2.5 space-y-1">
                          <div className="text-[11px] font-semibold text-slate-500">
                            Quyền hạn bao gồm:
                          </div>
                          <ul className="space-y-1">
                            {opt.permissions.map((p, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-1.5 text-[11px] text-slate-600"
                              >
                                <svg
                                  className={`h-3.5 w-3.5 shrink-0 ${
                                    isSelected
                                      ? "text-emerald-600"
                                      : "text-slate-400"
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2.5"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m4.5 12.75 6 6 9-13.5"
                                  />
                                </svg>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System note */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2 mt-3">
            <svg
              className="h-4 w-4 text-amber-600 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <div>
              <span className="font-semibold">Lưu ý:</span> Chỉ Chủ sở hữu mới
              có quyền phân quyền này. Mọi thay đổi vai trò sẽ có hiệu lực ngay
              lập tức khi lưu.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isUnchanged}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
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
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                <span>Xác nhận phân quyền</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
