import { useState, useRef, type SyntheticEvent, type ChangeEvent } from "react";
import { useNavigate, useLocation, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { tokenStorage } from "../../../utils/TokenStorage";
import { HttpError } from "../../../services/http/HttpError";

interface LocationState {
    from?: {
        pathname?: string;
    };
}

interface FieldErrors {
    username?: string;
    password?: string;
}

function SignInPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const { signin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (tokenStorage.hasTokens()) {
        return <Navigate to="/" replace />;
    }

    const state = location.state as LocationState | null;
    const from = state?.from?.pathname || "/";

    const validateForm = (): boolean => {
        const errors: FieldErrors = {};

        if (!username.trim()) {
            errors.username = "Vui lòng nhập tên đăng nhập.";
        }

        if (!password) {
            errors.password = "Vui lòng nhập mật khẩu.";
        }

        setFieldErrors(errors);

        if (errors.username) {
            usernameInputRef.current?.focus();
            return false;
        }

        if (errors.password) {
            passwordInputRef.current?.focus();
            return false;
        }

        return true;
    };

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setUsername(e.target.value);
        if (fieldErrors.username) {
            setFieldErrors((prev) => ({ ...prev, username: undefined }));
        }
        if (generalError) {
            setGeneralError("");
        }
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setPassword(e.target.value);
        if (fieldErrors.password) {
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
        }
        if (generalError) {
            setGeneralError("");
        }
    };

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setGeneralError("");

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await signin({ username: username.trim(), password });
            setIsSuccess(true);
            navigate(from, { replace: true });
        } catch (err: unknown) {
            setIsSuccess(false);
            if (err instanceof HttpError || err instanceof Error) {
                setGeneralError(err.message);
            } else {
                setGeneralError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAF9] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased selection:bg-green-100 selection:text-green-800">
            {/* Header / Brand */}
            <header className="w-full max-w-md text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 border border-green-200 text-green-600 shadow-xs mb-4">
                    {/* Beaker / Lab Icon */}
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5m4.75-11.396A2.25 2.25 0 0 1 12 2.25c.8 0 1.524.419 1.94 1.077l.31.543v5.484a2.25 2.25 0 0 0 .659 1.591L19 14.5M9.75 3.104h4.5m-4.5 0h-.75A2.25 2.25 0 0 0 6.75 5.354m10.5-2.25h.75a2.25 2.25 0 0 1 2.25 2.25M5 14.5 3.25 17.5a2.25 2.25 0 0 0 1.948 3.35h13.604a2.25 2.25 0 0 0 1.948-3.35L19 14.5m-14 0h14"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17211B]">
                    Đăng nhập hệ thống
                </h1>
                <p className="mt-2 text-sm text-[#647067]">
                    Hệ thống Quản lý Phòng thí nghiệm &amp; Thiết bị
                </p>
            </header>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E2E8E4] p-6 sm:p-8">
                {/* General Error Banner */}
                {generalError && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className="mb-6 flex items-start gap-3 p-3.5 rounded-lg bg-[#FEE2E2] border border-red-200 text-[#991B1B] text-sm animate-in fade-in duration-200"
                    >
                        <svg
                            className="w-5 h-5 shrink-0 text-red-600 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                            />
                        </svg>
                        <div className="flex-1 leading-snug">
                            <span className="font-semibold block text-red-900">Đăng nhập không thành công</span>
                            <span className="text-red-700 text-xs mt-0.5 block">{generalError}</span>
                        </div>
                    </div>
                )}

                {/* Success Banner */}
                {isSuccess && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="mb-6 flex items-center gap-3 p-3.5 rounded-lg bg-[#DCFCE7] border border-green-200 text-[#166534] text-sm animate-in fade-in duration-200"
                    >
                        <svg
                            className="w-5 h-5 shrink-0 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                        <span className="font-medium text-xs sm:text-sm">Đăng nhập thành công! Đang chuyển hướng...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Username Input */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-[#17211B] mb-1.5"
                        >
                            Tên đăng nhập <span className="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A948D]">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.75"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                    />
                                </svg>
                            </div>
                            <input
                                ref={usernameInputRef}
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                aria-required="true"
                                aria-invalid={!!fieldErrors.username}
                                aria-describedby={fieldErrors.username ? "username-error" : undefined}
                                value={username}
                                onChange={handleUsernameChange}
                                placeholder="Nhập tên đăng nhập"
                                disabled={loading || isSuccess}
                                className={`block w-full pl-10 pr-3.5 py-2.5 text-sm text-[#17211B] bg-white rounded-lg placeholder:text-[#8A948D] transition-colors duration-150 focus:outline-none disabled:bg-[#F1F5F2] disabled:text-[#8A948D] disabled:cursor-not-allowed ${
                                    fieldErrors.username
                                        ? "border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                        : "border border-[#E2E8E4] focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                }`}
                            />
                        </div>
                        {fieldErrors.username && (
                            <p
                                id="username-error"
                                role="alert"
                                className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5"
                            >
                                <svg
                                    className="w-4 h-4 shrink-0 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                    />
                                </svg>
                                <span>{fieldErrors.username}</span>
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[#17211B] mb-1.5"
                        >
                            Mật khẩu <span className="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A948D]">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.75"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                    />
                                </svg>
                            </div>
                            <input
                                ref={passwordInputRef}
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                aria-required="true"
                                aria-invalid={!!fieldErrors.password}
                                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="Nhập mật khẩu"
                                disabled={loading || isSuccess}
                                className={`block w-full pl-10 pr-10 py-2.5 text-sm text-[#17211B] bg-white rounded-lg placeholder:text-[#8A948D] transition-colors duration-150 focus:outline-none disabled:bg-[#F1F5F2] disabled:text-[#8A948D] disabled:cursor-not-allowed ${
                                    fieldErrors.password
                                        ? "border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                        : "border border-[#E2E8E4] focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                disabled={loading || isSuccess}
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A948D] hover:text-[#17211B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded-md transition-colors disabled:cursor-not-allowed"
                            >
                                {showPassword ? (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.75"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.75"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p
                                id="password-error"
                                role="alert"
                                className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5"
                            >
                                <svg
                                    className="w-4 h-4 shrink-0 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                    />
                                </svg>
                                <span>{fieldErrors.password}</span>
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || isSuccess}
                            className="w-full h-11 px-4 flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors duration-150 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span>Đang đăng nhập...</span>
                                </>
                            ) : (
                                <span>Đăng nhập</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center text-xs text-[#8A948D]">
                Hệ thống Quản lý Phòng thí nghiệm &bull; An toàn &amp; Bảo mật
            </footer>
        </main>
    );
}

export default SignInPage;
