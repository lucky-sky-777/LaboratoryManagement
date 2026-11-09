import { useState } from "react";
import type {
  OrganizationItemDTO,
  OrganizationJoinRequestEntity,
} from "../types/organization";

interface JoinRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationItemDTO | null;
  requests: OrganizationJoinRequestEntity[];
  onApprove: (requestId: number) => void;
  onReject: (requestId: number, reason: string) => void;
}

export function JoinRequestsModal({
  isOpen,
  onClose,
  organization,
  requests,
  onApprove,
  onReject,
}: JoinRequestsModalProps) {
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (!isOpen || !organization) return null;

  // Filter requests for this organization
  const orgRequests = requests.filter(
    (r) => r.organization_id === organization.id && r.status === "PENDING"
  );

  const handleConfirmReject = (requestId: number) => {
    onReject(requestId, rejectReason.trim() || "Không đáp ứng tiêu chuẩn tham gia phòng lab");
    setRejectingId(null);
    setRejectReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Yêu cầu gia nhập tổ chức</h2>
              <p className="text-xs text-slate-500 font-medium">
                {organization.name} • <span className="font-mono">[{organization.code}]</span>
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

        {/* Request List (from organization_join_requests table) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orgRequests.length > 0 ? (
            orgRequests.map((req) => {
              const formattedDate = new Date(req.created_at).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              });

              return (
                <div
                  key={req.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                        {(req.creator_user_name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          {req.creator_user_name || `Người dùng #${req.creator_user_id}`}
                        </div>
                        <div className="text-xs text-slate-400">{req.creator_user_email}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">{formattedDate}</span>
                  </div>

                  {/* Message property: organization_join_requests.message */}
                  <div className="mt-3 rounded-lg bg-white border border-slate-100 p-3 text-xs text-slate-700 leading-relaxed italic">
                    "{req.message || "Không có lời nhắn đi kèm."}"
                  </div>

                  {/* Reject reason input prompt if user clicked Reject */}
                  {rejectingId === req.id ? (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Lý do từ chối (reject_reason):
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmReject(req.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded"
                        >
                          Xác nhận từ chối
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Action buttons */
                    <div className="mt-3.5 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectingId(req.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        Từ chối (REJECT)
                      </button>
                      <button
                        type="button"
                        onClick={() => onApprove(req.id)}
                        className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Phê duyệt (APPROVE)
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Không có yêu cầu chờ duyệt</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tất cả các yêu cầu xin gia nhập tổ chức này đã được xử lý.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
