import { useState, useRef, type SyntheticEvent, type ChangeEvent } from "react";
import { useNavigate, Navigate, Link } from "react-router";
import { tokenStorage } from "../../../utils/TokenStorage";
import { HttpError } from "../../../services/http/HttpError";
import { AuthApi } from "../api/AuthApi";

interface FieldErrors {
    displayName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

function SignUpPage() {
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [generalError, setGeneralError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const displayNameInputRef = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    // Nếu đã đăng nhập thì chuyển hướng về trang chủ
    if (tokenStorage.hasTokens()) {
        return <Navigate to="/" replace />;
    }

    const validateForm = (): boolean => {
        const errors: FieldErrors = {};

        const trimmedDisplayName = displayName.trim();
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        if (trimmedDisplayName && trimmedDisplayName.length < 2) {
            errors.displayName = "Họ và tên cần có ít nhất 2 ký tự.";
        }

        if (!trimmedUsername) {
            errors.username = "Vui lòng nhập tên đăng nhập.";
        } else if (trimmedUsername.length < 3) {
            errors.username = "Tên đăng nhập phải có ít nhất 3 ký tự.";
        } else if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUsername)) {
            errors.username = "Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới, gạch ngang hoặc dấu chấm.";
        }

        if (!trimmedEmail) {
            errors.email = "Vui lòng nhập địa chỉ email.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            errors.email = "Địa chỉ email không đúng định dạng.";
        }

        if (!password) {
            errors.password = "Vui lòng nhập mật khẩu.";
        } else if (password.length < 6) {
            errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không trùng khớp.";
        }

        setFieldErrors(errors);

        if (errors.displayName) {
            displayNameInputRef.current?.focus();
            return false;
        }
        if (errors.username) {
            usernameInputRef.current?.focus();
            return false;
        }
        if (errors.email) {
            emailInputRef.current?.focus();
            return false;
        }
        if (errors.password) {
            passwordInputRef.current?.focus();
            return false;
        }
        if (errors.confirmPassword) {
            confirmPasswordInputRef.current?.focus();
            return false;
        }

        return true;
    };

    const handleFieldChange = (field: keyof FieldErrors) => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
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
            await AuthApi.signUp({
                username: username.trim(),
                password,
                display_name: displayName.trim() || undefined,
                email: email.trim(),
            });

            setIsSuccess(true);
            setTimeout(() => {
                navigate("/signin", {
                    state: {
                        registered: true,
                        prefillUsername: username.trim(),
                    },
                    replace: true,
                });
            }, 1500);
        } catch (err: unknown) {
            setIsSuccess(false);
            if (err instanceof HttpError || err instanceof Error) {
                setGeneralError(err.message);
            } else {
                setGeneralError("Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin.");
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
                    Tạo tài khoản mới
                </h1>
                <p className="mt-2 text-sm text-[#647067]">
                    Hệ thống Quản lý Phòng thí nghiệm &amp; Thiết bị
                </p>
            </header>

            {/* Signup Card */}
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
                            <span className="font-semibold block text-red-900">Đăng ký không thành công</span>
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
                        <span className="font-medium text-xs sm:text-sm">
                            Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...
                        </span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Display Name Input */}
                    <div>
                        <label
                            htmlFor="displayName"
                            className="block text-sm font-medium text-[#17211B] mb-1.5"
                        >
                            Họ và tên
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
                                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                                    />
                                </svg>
                            </div>
                            <input
                                ref={displayNameInputRef}
                                id="displayName"
                                name="displayName"
                                type="text"
                                autoComplete="name"
                                aria-invalid={!!fieldErrors.displayName}
                                aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined}
                                value={displayName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    setDisplayName(e.target.value);
                                    handleFieldChange("displayName");
                                }}
                                placeholder="Nhập họ và tên (VD: Nguyễn Văn A)"
                                disabled={loading || isSuccess}
                                className={`block w-full pl-10 pr-3.5 py-2.5 text-sm text-[#17211B] bg-white rounded-lg placeholder:text-[#8A948D] transition-colors duration-150 focus:outline-none disabled:bg-[#F1F5F2] disabled:text-[#8A948D] disabled:cursor-not-allowed ${
                                    fieldErrors.displayName
                                        ? "border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                        : "border border-[#E2E8E4] focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                }`}
                            />
                        </div>
                        {fieldErrors.displayName && (
                            <p
                                id="displayName-error"
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
                                <span>{fieldErrors.displayName}</span>
                            </p>
                        )}
                    </div>

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
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    setUsername(e.target.value);
                                    handleFieldChange("username");
                                }}
                                placeholder="Nhập tên đăng nhập (tối thiểu 3 ký tự)"
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

                    {/* Email Input */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[#17211B] mb-1.5"
                        >
                            Email <span className="text-red-500" aria-hidden="true">*</span>
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
                                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                    />
                                </svg>
                            </div>
                            <input
                                ref={emailInputRef}
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                aria-required="true"
                                aria-invalid={!!fieldErrors.email}
                                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    setEmail(e.target.value);
                                    handleFieldChange("email");
                                }}
                                placeholder="name@example.com"
                                disabled={loading || isSuccess}
                                className={`block w-full pl-10 pr-3.5 py-2.5 text-sm text-[#17211B] bg-white rounded-lg placeholder:text-[#8A948D] transition-colors duration-150 focus:outline-none disabled:bg-[#F1F5F2] disabled:text-[#8A948D] disabled:cursor-not-allowed ${
                                    fieldErrors.email
                                        ? "border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                        : "border border-[#E2E8E4] focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                }`}
                            />
                        </div>
                        {fieldErrors.email && (
                            <p
                                id="email-error"
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
                                <span>{fieldErrors.email}</span>
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
                                autoComplete="new-password"
                                required
                                aria-required="true"
                                aria-invalid={!!fieldErrors.password}
                                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    setPassword(e.target.value);
                                    handleFieldChange("password");
                                }}
                                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A948D] hover:text-[#17211B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded-md transition-colors disabled:cursor-not-allowed cursor-pointer"
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

                    {/* Confirm Password Input */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-[#17211B] mb-1.5"
                        >
                            Xác nhận mật khẩu <span className="text-red-500" aria-hidden="true">*</span>
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
                                        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                                    />
                                </svg>
                            </div>
                            <input
                                ref={confirmPasswordInputRef}
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                aria-required="true"
                                aria-invalid={!!fieldErrors.confirmPassword}
                                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                                value={confirmPassword}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    setConfirmPassword(e.target.value);
                                    handleFieldChange("confirmPassword");
                                }}
                                placeholder="Nhập lại mật khẩu"
                                disabled={loading || isSuccess}
                                className={`block w-full pl-10 pr-10 py-2.5 text-sm text-[#17211B] bg-white rounded-lg placeholder:text-[#8A948D] transition-colors duration-150 focus:outline-none disabled:bg-[#F1F5F2] disabled:text-[#8A948D] disabled:cursor-not-allowed ${
                                    fieldErrors.confirmPassword
                                        ? "border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                        : "border border-[#E2E8E4] focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                disabled={loading || isSuccess}
                                aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiển thị mật khẩu xác nhận"}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A948D] hover:text-[#17211B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded-md transition-colors disabled:cursor-not-allowed cursor-pointer"
                            >
                                {showConfirmPassword ? (
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
                        {fieldErrors.confirmPassword && (
                            <p
                                id="confirmPassword-error"
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
                                <span>{fieldErrors.confirmPassword}</span>
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || isSuccess}
                            className="w-full h-11 px-4 flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors duration-150 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
                                    <span>Đang tạo tài khoản...</span>
                                </>
                            ) : (
                                <span>Đăng ký tài khoản</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Already have an account link */}
                <div className="mt-6 pt-5 border-t border-[#E2E8E4] text-center text-sm text-[#647067]">
                    Đã có tài khoản?{" "}
                    <Link
                        to="/signin"
                        className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded-xs"
                    >
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center text-xs text-[#8A948D]">
                Hệ thống Quản lý Phòng thí nghiệm &bull; An toàn &amp; Bảo mật
            </footer>
        </main>
    );
}

export default SignUpPage;
