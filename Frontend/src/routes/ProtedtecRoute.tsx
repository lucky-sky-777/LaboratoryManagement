import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants/StorageKey";
import { useAuth } from "../features/auth/context/AuthContext";

export const ProtectedRoute: React.FC = () => {
    const { isInitializing } = useAuth();
    const location = useLocation();

    const hasAnyToken =
        Boolean(localStorage.getItem(ACCESS_TOKEN)) ||
        Boolean(localStorage.getItem(REFRESH_TOKEN));

    // Khi truy cập bất cứ trang nào, nếu localStorage không có lưu token nào -> về trang đăng nhập
    if (!hasAnyToken) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    if (isInitializing) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    return <Outlet />;
};