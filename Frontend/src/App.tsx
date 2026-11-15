import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import HomePage from "./features/home/pages/HomePage";
import SignInPage from "./features/auth/pages/SignInPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import OAuth2RedirectPage from "./features/auth/pages/OAuth2RedirectPage";
import { ProtectedRoute } from "./routes/ProtedtecRoute";

import "./App.css";
import { AuthProvider } from "./features/auth/context/AuthContext";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					{/* Public Routes */}
					<Route path="/signin" element={<SignInPage />} />
					<Route path="/signup" element={<SignUpPage />} />
					<Route path="/oauth2-signin-redirect" element={<OAuth2RedirectPage />} />

					{/* Protected Routes: Bất kỳ route nào nằm trong này đều bị kiểm tra localStorage */}
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<HomePage />} />
						<Route path="/laboratories" element={<HomePage />} />
						<Route path="/laboratories/:id" element={<HomePage />} />
						<Route path="/laboratories/:id/:tab" element={<HomePage />} />
						<Route path="/requests" element={<HomePage />} />
						<Route path="/laboratories/requests" element={<Navigate to="/requests" replace />} />
						<Route path="/join-requests" element={<Navigate to="/requests" replace />} />
						<Route path="/settings" element={<HomePage />} />
						<Route path="/profile" element={<HomePage />} />
					</Route>

					{/* Điều hướng các đường dẫn không tồn tại */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
