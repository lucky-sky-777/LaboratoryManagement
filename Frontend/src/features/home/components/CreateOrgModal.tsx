import { useState, type FormEvent } from "react";
import type { OrganizationItemDTO, OrganizationPrivacy } from "../types/organization";

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newOrg: Omit<OrganizationItemDTO, "id">) => void;
  currentUserId?: number;
}

export function CreateOrgModal({
  isOpen,
  onClose,
  onCreate,
  currentUserId = 1,
}: CreateOrgModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [privacy, setPrivacy] = useState<OrganizationPrivacy>("PUBLIC");
  const [themeColor, setThemeColor] = useState<OrganizationItemDTO["theme_color"]>("emerald");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate code if empty: max 10 chars, uppercase
    const finalCode = (
      code.trim() || `ORG${Math.floor(1000 + Math.random() * 9000)}`
    )
      .slice(0, 10)
      .toUpperCase();

    const nowIso = new Date().toISOString();

    onCreate({
      name: name.trim(),
      description: description.trim(),
      code: finalCode, // varchar(10)
      privacy, // 'PUBLIC' | 'PRIVATE'
      creator_user_id: currentUserId,
      created_at: nowIso,
      user_role: "OWNER", // creator gets OWNER role
      user_joined_at: nowIso,
      creator_display_name: "Bạn (Chủ sở hữu)",
      members_count: 1,
      pending_requests_count: 0,
      theme_color: themeColor,
      is_pinned: true,
    });

    setName("");
    setDescription("");
    setCode("");
    setPrivacy("PUBLIC");
    onClose();
  };

  const themeOptions: { value: OrganizationItemDTO["theme_color"]; label: string; colorClass: string }[] = [
    { value: "emerald", label: "Xanh lá ngọc", colorClass: "bg-emerald-600" },
    { value: "blue", label: "Xanh dương", colorClass: "bg-blue-600" },
    { value: "indigo", label: "Chàm Indigo", colorClass: "bg-indigo-600" },
    { value: "purple", label: "Tím violet", colorClass: "bg-purple-600" },
    { value: "amber", label: "Hổ phách", colorClass: "bg-amber-600" },
    { value: "teal", label: "Xanh cổ vịt", colorClass: "bg-teal-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tạo tổ chức mới</h2>
              <p className="text-xs text-slate-400">Thiết lập thông tin tổ chức theo cơ sở dữ liệu hệ thống</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* organizations.name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên tổ chức (name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Phòng Thí Nghiệm Hóa Sinh Phân Tử"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* organizations.code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mã tham gia tổ chức (code) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Tối đa 10 ký tự [varchar(10)]</span>
            </div>
            <input
              type="text"
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: BIO401 (tối đa 10 ký tự)"
              className="w-full font-mono uppercase tracking-wider rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* organizations.privacy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Phạm vi truy cập (privacy) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrivacy("PUBLIC")}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                  privacy === "PUBLIC"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-slate-400">
                  {privacy === "PUBLIC" && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
                </div>
                <div>
                  <div className="text-xs font-bold">PUBLIC (Công khai)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Bất kỳ người dùng nào có mã đều có thể tham gia.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy("PRIVATE")}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                  privacy === "PRIVATE"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-slate-400">
                  {privacy === "PRIVATE" && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
                </div>
                <div>
                  <div className="text-xs font-bold">PRIVATE (Riêng tư)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cần phê duyệt yêu cầu tham gia hoặc nhận lời mời.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* organizations.description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mô tả tổ chức (description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả mục tiêu, nhiệm vụ và chức năng của tổ chức..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Theme Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Màu sắc hiển thị thẻ
            </label>
            <div className="flex flex-wrap gap-2.5">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setThemeColor(opt.value)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                    themeColor === opt.value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full ${opt.colorClass}`} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Tạo tổ chức
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
