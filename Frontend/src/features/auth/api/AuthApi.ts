import { REFRESH_TOKEN } from "../../../constants/StorageKey";
import type { ResponseDTO } from "../../../dto/ResponseDTO";
import { HttpService } from "../../../services/http/HttpService";
import type {
	SignInRequest,
	SignUpRequest,
	SignInResponse,
	UserProfile,
} from "../types/AuthType";

export const AuthApi = {
	/**
	 * Đăng nhập
	 */
	signIn(request: SignInRequest): Promise<ResponseDTO<SignInResponse>> {
		return HttpService.post<ResponseDTO<SignInResponse>>(
			"/api/auth/signin",
			request,
		);
	},

	/**
	 * Đăng ký tài khoản
	 */
	signUp(request: SignUpRequest): Promise<void> {
		return HttpService.post<void>("/api/auth/signup", request);
	},

	/**
	 * Refresh
	 */
	refresh(): Promise<ResponseDTO<SignInResponse>> {
		return HttpService.post<ResponseDTO<SignInResponse>>("/api/auth/refresh", null, {
			headers: {
				"X-Refresh-Token": localStorage.getItem(REFRESH_TOKEN) || "",
			},
		});
	},

	/**
	 * Đăng xuất
	 */
	signOut() {
		HttpService.post<void>("/api/auth/signout");
	},

	/**
	 * Lấy thông tin người dùng hiện tại
	 */
	getCurrentUser(): Promise<ResponseDTO<UserProfile>> {
		return HttpService.get<ResponseDTO<UserProfile>>("/api/auth/user");
	},

	/**
	 * Xác thực
	 */
	validate(): Promise<void> {
		return HttpService.post<void>("/api/auth/validate");
	},
};
