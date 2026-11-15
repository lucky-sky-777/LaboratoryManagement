import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { AuthApi } from "../api/AuthApi";
import { HttpError } from "../../../services/http/HttpError";

function OAuth2RedirectPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithTokens } = useAuth();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(true);

    const hasExecutedRef = useRef<boolean>(false);

    useEffect(() => {
        if (hasExecutedRef.current) return;
        hasExecutedRef.current = true;

        const authCode = searchParams.get("authorization-code");
        const provider = searchParams.get("provider") || "google";
        const errorParam = searchParams.get("error-message");

        if (errorParam) {
            setErrorMessage(decodeURIComponent(errorParam));
            setIsProcessing(false);
            return;
        }

        if (!authCode) {
            setErrorMessage("Mã xác thực OAuth không hợp lệ hoặc đã hết hạn.");
            setIsProcessing(false);
            return;
        }

        const exchangeCode = async () => {
            try {
                const response = await AuthApi.exchangeOAuth(provider, {
                    oauth_authorization_code: authCode,
                });

                if (response.success && response.data) {
                    await loginWithTokens(
                        response.data.access_token,
                        response.data.refresh_token
                    );
                    navigate("/", { replace: true });
                } else {
                    setErrorMessage(response.message || "Xác thực tài khoản Google thất bại.");
                    setIsProcessing(false);
                }
            } catch (err: unknown) {
                setIsProcessing(false);
                if (err instanceof HttpError || err instanceof Error) {
                    setErrorMessage(err.message);
                } else {
                    setErrorMessage("Đã có lỗi xảy ra khi hoàn tất đăng nhập với Google.");
                }
            }
        };

        exchangeCode();
    }, [searchParams, loginWithTokens, navigate]);

    return (
        <main className="min-h-screen bg-[#F8FAF9] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased selection:bg-green-100 selection:text-green-800">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E2E8E4] p-8 text-center">
                {isProcessing ? (
                    <div className="py-8 space-y-4">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 border border-green-200 text-green-600 mb-2">
                            <svg
                                className="animate-spin h-7 w-7 text-green-600"
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
                        </div>
                        <h2 className="text-xl font-bold text-[#17211B]">
                            Đang xử lý đăng nhập Google...
                        </h2>
                        <p className="text-sm text-[#647067]">
                            Vui lòng đợi trong giây lát, hệ thống đang đồng bộ và xác thực thông tin tài khoản của bạn.
                        </p>
                    </div>
                ) : (
                    <div className="py-4 space-y-5">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 mb-1">
                            <svg
                                className="w-7 h-7 text-red-600"
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
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#17211B]">
                                Đăng nhập Google không thành công
                            </h2>
                            <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                                {errorMessage}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5 pt-2">
                            <Link
                                to="/signin"
                                className="w-full h-11 px-4 flex items-center justify-center rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors shadow-xs"
                            >
                                Về trang Đăng nhập
                            </Link>
                            <Link
                                to="/signup"
                                className="w-full h-11 px-4 flex items-center justify-center rounded-lg text-sm font-medium text-[#17211B] bg-white border border-[#E2E8E4] hover:bg-[#F8FAF9] transition-colors"
                            >
                                Về trang Đăng ký
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <footer className="mt-8 text-center text-xs text-[#8A948D]">
                Hệ thống Quản lý Phòng thí nghiệm &bull; An toàn &amp; Bảo mật
            </footer>
        </main>
    );
}

export default OAuth2RedirectPage;
