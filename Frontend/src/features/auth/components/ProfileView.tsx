import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthApi } from "../api/AuthApi";

interface ProfileViewProps {
  onBack?: () => void;
  onShowToast: (message: string) => void;
}

export function ProfileView({ onBack, onShowToast }: ProfileViewProps) {
  const { user, updateUser } = useAuth();

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Email Verification State
  const [otpCode, setOtpCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const initials = (displayName || user?.username || "U")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const isOAuth = user?.provider && user.provider !== "INTERNAL";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      onShowToast("Tên hiển thị không được để trống");
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await AuthApi.updateProfile({
        display_name: displayName.trim(),
        email: isOAuth ? undefined : (email.trim() || undefined),
      });

      if (res.data) {
        updateUser(res.data);
        onShowToast("Cập nhật thông tin tài khoản thành công!");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      onShowToast(error?.message || "Không thể cập nhật thông tin tài khoản");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (isOAuth) {
      onShowToast("Tài khoản liên kết không hỗ trợ gửi mã xác thực");
      return;
    }
    if (!email.trim()) {
      onShowToast("Vui lòng cung cấp email trước khi xác thực");
      return;
    }

    try {
      setIsSendingCode(true);
      await AuthApi.sendEmailVerification({ email: email.trim() });
      setCodeSent(true);
      setCountdown(60);
      onShowToast("Mã xác thực đã được gửi! Vui lòng kiểm tra email của bạn.");
    } catch (err: unknown) {
      const error = err as { message?: string };
      onShowToast(error?.message || "Không thể gửi mã xác thực");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      onShowToast("Vui lòng nhập mã xác thực 6 số");
      return;
    }

    try {
      setIsVerifyingCode(true);
      const res = await AuthApi.verifyEmail({ code: otpCode.trim() });
      if (res.data) {
        updateUser(res.data);
        setOtpCode("");
        setCodeSent(false);
        onShowToast("Xác thực email thành công! Email của bạn đã được kích hoạt.");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      onShowToast(error?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!oldPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu mới không khớp");
      return;
    }

    try {
      setIsChangingPassword(true);
      await AuthApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onShowToast("Đổi mật khẩu thành công!");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setPasswordError(error?.message || "Không thể đổi mật khẩu");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Không xác định";
    try {
      return new Date(isoString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner / Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản lý tài khoản cá nhân
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Xem và cập nhật thông tin định danh, email và bảo mật tài khoản
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Quay lại
          </button>
        )}
      </div>

      {/* User Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-xl font-bold text-white shadow-md shadow-emerald-600/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 truncate">
                {user?.display_name || user?.username}
              </h2>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                @{user?.username}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {user?.provider === "GOOGLE"
                  ? "Google OAuth"
                  : user?.provider === "MEZON"
                  ? "Mezon OAuth"
                  : "Tài khoản hệ thống"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                {user?.email || "Chưa thiết lập email"}
              </span>
              {user?.email && (
                user.email_verified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    Đã xác thực
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                    Chưa xác thực
                  </span>
                )
              )}
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                Tham gia: {formatDate(user?.joined_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Change Display Name & Email */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Thông tin cơ bản</h3>
              <p className="text-xs text-slate-400">Thay đổi tên hiển thị và địa chỉ email</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên đăng nhập (Username)
              </label>
              <input
                type="text"
                disabled
                value={user?.username || ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tên đăng nhập là định danh cố định không thể thay đổi
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên hiển thị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị của bạn..."
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Địa chỉ Email
                </label>
                {isOAuth && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Cố định ({user?.provider})
                  </span>
                )}
              </div>
              <input
                type="email"
                disabled={Boolean(isOAuth)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className={`w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm transition ${
                  isOAuth
                    ? "bg-slate-50 text-slate-500 cursor-not-allowed select-none"
                    : "bg-white text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {isOAuth ? (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Tài khoản đăng nhập qua {user?.provider} không thể thay đổi địa chỉ email.
                </span>
              ) : email !== user?.email ? (
                <span className="text-[11px] text-amber-600 mt-1 block">
                  * Thay đổi email sẽ yêu cầu bạn xác thực lại địa chỉ mới này.
                </span>
              ) : null}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 transition"
              >
                {isUpdatingProfile ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu thay đổi thông tin</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Email Verification */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Xác thực Email</h3>
              <p className="text-xs text-slate-400">Xác nhận quyền sở hữu email để nhận thông báo và bảo mật</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Email cần xác thực:</span>
                <span className="text-xs font-semibold text-slate-800">{user?.email || "Chưa có email"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Trạng thái xác thực:</span>
                {user?.email_verified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Đã xác thực thành công
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Chưa xác thực
                  </span>
                )}
              </div>
            </div>

            {user?.email_verified ? (
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4 text-center space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-emerald-800">Email của bạn đã được xác thực an toàn</p>
                <p className="text-xs text-emerald-600">
                  {isOAuth
                    ? `Địa chỉ email được liên kết và đồng bộ trực tiếp từ tài khoản ${user?.provider}.`
                    : "Nếu bạn thay đổi địa chỉ email ở ô bên trái, hệ thống sẽ tự động chuyển sang trạng thái chờ xác thực lại."}
                </p>
              </div>
            ) : isOAuth ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center space-y-1">
                <p className="text-sm font-semibold text-slate-700">Tài khoản liên kết {user?.provider}</p>
                <p className="text-xs text-slate-500">Email được quản lý bởi {user?.provider} và không cần xác thực thủ công.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isSendingCode || countdown > 0 || !user?.email}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 transition"
                  >
                    {isSendingCode ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Đang gửi mã...</span>
                      </>
                    ) : countdown > 0 ? (
                      <span>Gửi lại sau ({countdown}s)</span>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                        <span>Gửi mã xác thực qua Email</span>
                      </>
                    )}
                  </button>
                </div>

                {codeSent && (
                  <form onSubmit={handleVerifyCode} className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700">
                      Nhập mã xác thực 6 chữ số (OTP)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={10}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Ví dụ: 123456"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-center font-mono tracking-widest text-base font-bold text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingCode || !otpCode.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition"
                      >
                        {isVerifyingCode ? "Kiểm tra..." : "Xác nhận"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Mã xác thực có hiệu lực trong vòng 15 phút kể từ khi gửi.
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Password & Security */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Bảo mật & Mật khẩu</h3>
            <p className="text-xs text-slate-400">Thay đổi mật khẩu đăng nhập tài khoản</p>
          </div>
        </div>

        {isOAuth ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-sm text-slate-600 flex items-start gap-3">
            <svg className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div>
              <p className="font-semibold text-slate-800">Tài khoản liên kết bên ngoài ({user?.provider})</p>
              <p className="text-xs text-slate-500 mt-1">
                Tài khoản này được xác thực trực tiếp qua dịch vụ {user?.provider}. Bạn không cần thiết lập mật khẩu riêng cho hệ thống Laboratory Management.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            {passwordError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu cũ..."
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 active:bg-black disabled:opacity-60 transition"
              >
                {isChangingPassword ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang cập nhật mật khẩu...</span>
                  </>
                ) : (
                  <span>Đổi mật khẩu</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
