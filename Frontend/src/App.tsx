import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import HomePage from "./features/home/pages/HomePage";
import SignInPage from "./features/auth/pages/SignInPage";
import { ProtectedRoute } from "./routes/ProtedtecRoute";

import "./App.css";
import { AuthProvider } from "./features/auth/context/AuthContext";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					{/* Public Route */}
					<Route path="/signin" element={<SignInPage />} />

					{/* Protected Routes: Bất kỳ route nào nằm trong này đều bị kiểm tra localStorage */}
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<HomePage />} />
					</Route>

					{/* Điều hướng các đường dẫn không tồn tại */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
