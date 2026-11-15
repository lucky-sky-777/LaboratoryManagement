import React, { useState } from "react";

interface GoogleSignInButtonProps {
    text?: string;
    disabled?: boolean;
    className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
    text = "Đăng nhập với Google",
    disabled = false,
    className = "",
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleAuth = () => {
        if (disabled || isLoading) return;
        setIsLoading(true);

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        // Create and submit form to POST /api/auth/google/signin
        // The browser sends the Origin header, which the backend reads to construct the state parameter
        // The backend then responds with 302 Found redirecting to Google OAuth login URL
        const form = document.createElement("form");
        form.method = "POST";
        form.action = `${apiUrl}/api/auth/google/signin`;
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={disabled || isLoading}
            className={`w-full h-11 px-4 flex items-center justify-center gap-3 rounded-lg border border-[#E2E8E4] bg-white text-[#17211B] text-sm font-medium hover:bg-[#F8FAF9] active:bg-[#F1F5F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 transition-all duration-150 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-5 w-5 text-gray-500"
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
            ) : (
                <svg
                    className="w-5 h-5 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                </svg>
            )}
            <span>{isLoading ? "Đang chuyển hướng tới Google..." : text}</span>
        </button>
    );
};
