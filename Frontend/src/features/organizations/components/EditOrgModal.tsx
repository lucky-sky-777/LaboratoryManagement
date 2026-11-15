import { useState } from "react";
import { OrganizationApi } from "../api/OrganizationApi";
import { OrganizationUserApi } from "../api/OrganizationUserApi";
import type {
  OrganizationItemDTO,
  OrganizationPrivacy,
} from "../types/OrganizationType";

interface EditOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationItemDTO | null;
  onShowToast: (message: string) => void;
  onOrgUpdated: () => void;
  onOrgDeleted?: (orgId: number) => void;
}

export function EditOrgModal({
  isOpen,
  onClose,
  organization,
  onShowToast,
  onOrgUpdated,
  onOrgDeleted,
}: EditOrgModalProps) {
  const [name, setName] = useState(organization?.name || "");
  const [description, setDescription] = useState(organization?.description || "");
  const [privacy, setPrivacy] = useState<OrganizationPrivacy>(organization?.privacy || "PRIVATE");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  if (!isOpen || !organization) return null;

  const isOwner = organization.user_role === "OWNER";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await OrganizationApi.update(organization.id, {
        name: name.trim(),
        description: description.trim(),
        privacy,
      });

      if (res.success) {
        onShowToast(`Đã cập nhật thông tin tổ chức "${name.trim()}"!`);
        onOrgUpdated();
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật tổ chức thất bại.";
      onShowToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `XÁC NHẬN XÓA TỔ CHỨC:\nBạn có chắc chắn muốn xóa tổ chức "${organization.name}"?\nHành động này không thể hoàn tác!`
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await OrganizationApi.delete(organization.id);
      if (res.success) {
        onShowToast(`Đã xóa tổ chức "${organization.name}".`);
        onOrgDeleted?.(organization.id);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa tổ chức thất bại.";
      onShowToast(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn rời khỏi tổ chức "${organization.name}"?`)) {
      return;
    }

    setLeaveLoading(true);
    try {
      const res = await OrganizationUserApi.leaveOrganization(organization.id);
      if (res.success) {
        onShowToast(`Bạn đã rời khỏi tổ chức "${organization.name}".`);
        onOrgDeleted?.(organization.id);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Rời tổ chức thất bại.";
      onShowToast(msg);
    } finally {
      setLeaveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cấu hình tổ chức</h2>
              <p className="text-xs text-slate-400">
                Mã: <span className="font-mono font-bold text-slate-600">{organization.code}</span>
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

        {/* Content */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên tổ chức <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chế độ hiển thị</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                  privacy === "PRIVATE"
                    ? "border-emerald-600 bg-emerald-50/40 text-emerald-900"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value="PRIVATE"
                  checked={privacy === "PRIVATE"}
                  onChange={() => setPrivacy("PRIVATE")}
                  className="text-emerald-600"
                />
                <div>
                  <div className="text-xs font-bold">Riêng tư</div>
                  <div className="text-[10px] text-slate-500">Cần phê duyệt khi xin gia nhập</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                  privacy === "PUBLIC"
                    ? "border-emerald-600 bg-emerald-50/40 text-emerald-900"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value="PUBLIC"
                  checked={privacy === "PUBLIC"}
                  onChange={() => setPrivacy("PUBLIC")}
                  className="text-emerald-600"
                />
                <div>
                  <div className="text-xs font-bold">Công khai</div>
                  <div className="text-[10px] text-slate-500">Ai có mã cũng được vào ngay</div>
                </div>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isOwner ? (
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDelete}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
              >
                {deleteLoading ? "Đang xóa..." : "Xóa tổ chức"}
              </button>
            ) : (
              <button
                type="button"
                disabled={leaveLoading}
                onClick={handleLeave}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
              >
                {leaveLoading ? "Đang rời..." : "Rời tổ chức"}
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
