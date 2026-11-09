import { useState, type FormEvent } from "react";
import type { UserProfile } from "../../auth/types/AuthType";

interface JoinOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string, message?: string) => void;
  user: UserProfile | null;
}

export function JoinOrgModal({ isOpen, onClose, onJoin, user }: JoinOrgModalProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Vui lòng nhập mã tham gia tổ chức.");
      return;
    }
    setError("");
    onJoin(code.trim().toUpperCase(), message.trim());
    setCode("");
    setMessage("");
    onClose();
  };

  const displayName = user?.display_name || user?.username || "Nghiên cứu viên";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Tham gia tổ chức</h2>
              <p className="text-xs text-slate-400">Tham gia bằng mã định danh (organizations.code)</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User profile snippet (Google Classroom style) */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400">Tài khoản gửi yêu cầu:</div>
                <div className="truncate text-sm font-semibold text-slate-800">{displayName}</div>
                <div className="truncate text-xs text-slate-500">{user?.email || "lab-user@edu.vn"}</div>
              </div>
            </div>
          </div>

          {/* organizations.code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mã tham gia tổ chức (code) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Tối đa 10 ký tự</span>
            </div>
            <input
              type="text"
              autoFocus
              maxLength={10}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError("");
              }}
              placeholder="VD: BIO401 hoặc NANO102"
              className="w-full uppercase font-mono tracking-wider rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          {/* organization_join_requests.message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lời nhắn gia nhập (message)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Gửi lời giới thiệu hoặc lý do xin tham gia đến người quản lý..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              Đối với tổ chức <strong>PRIVATE</strong>, yêu cầu của bạn sẽ được gửi tới Ban quản lý phê duyệt.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
              Gửi yêu cầu tham gia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
