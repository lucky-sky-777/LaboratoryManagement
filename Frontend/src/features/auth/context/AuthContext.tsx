import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../../constants/StorageKey";
import type { SignInRequest, UserProfile } from "../types/AuthType";
import { AuthApi } from "../api/AuthApi";
import { tokenStorage } from "../../../utils/TokenStorage";

interface AuthContextType {
    user: UserProfile | null;
    isInitializing: boolean;
    signin: (credentials: SignInRequest) => Promise<UserProfile>;
    signout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    const fetchUserProfile = useCallback(async () => {
        const response = await AuthApi.getCurrentUser();
        setUser(response.data);
        return response.data;
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const hasToken =
                Boolean(localStorage.getItem(ACCESS_TOKEN)) ||
                Boolean(localStorage.getItem(REFRESH_TOKEN));

            if (!hasToken) {
                setIsInitializing(false);
                return;
            }

            try {
                // 1. Gọi API đăng nhập bằng access token
                // (Nếu 401 -> HttpService tự gọi refresh -> Nếu refresh 401 -> HttpService tự xóa 2 token & về /login)
                await AuthApi.validate();

                // 2. Thành công thì gọi tiếp API lấy thông tin user lưu vào phiên
                await fetchUserProfile();
            } catch (error) {
                setUser(null);
            } finally {
                setIsInitializing(false);
            }
        };

        initAuth();

        const handleLogoutEvent = () => setUser(null);
        window.addEventListener("auth:logout", handleLogoutEvent);
        return () => window.removeEventListener("auth:logout", handleLogoutEvent);
    }, [fetchUserProfile]);

    // Luồng khi nhấn nút Đăng nhập ở trang Login
    const signin = async (credentials: SignInRequest): Promise<UserProfile> => {
        const { data } = await AuthApi.signIn(credentials);

        // Lưu 2 token vào localStorage
        localStorage.setItem(ACCESS_TOKEN, data.access_token);
        localStorage.setItem(REFRESH_TOKEN, data.refresh_token);

        // Gọi API lấy thông tin user và lưu lại dùng chung cho phiên
        return await fetchUserProfile();
    };

    const signout = useCallback(async (): Promise<void> => {
		try {
			AuthApi.signOut();
			// (Tùy chọn) Nếu Backend có API hủy token trên server thì mở comment dòng dưới:
			// await HttpService.post("/auth/logout");
		} catch {
			// Bỏ qua lỗi nếu API logout thất bại
		} finally {
			// 1. Xóa sạch cả ACCESS_TOKEN và REFRESH_TOKEN trong localStorage
			tokenStorage.clearTokens();
	
			// 2. Xóa thông tin user đang lưu trong phiên (state)
			setUser(null);
		}
	}, []);

    return (
        <AuthContext.Provider value={{ user, isInitializing, signin, signout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
    }
    return context;
};