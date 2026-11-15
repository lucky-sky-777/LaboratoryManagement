import { REFRESH_TOKEN } from "../../../constants/StorageKey";
import type { ResponseDTO } from "../../../dto/ResponseDTO";
import { HttpService } from "../../../services/http/HttpService";
import type {
	SignInRequest,
	SignUpRequest,
	SignInResponse,
	SignUpResponse,
	ExchangeOAuthCodeRequest,
	UserProfile,
	UpdateProfileRequest,
	ChangePasswordRequest,
	SendVerificationCodeRequest,
	VerifyEmailRequest,
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
	signUp(request: SignUpRequest): Promise<ResponseDTO<SignUpResponse>> {
		return HttpService.post<ResponseDTO<SignUpResponse>>("/api/auth/signup", request);
	},

	/**
	 * Trao đổi OAuth authorization code lấy JWT token
	 */
	exchangeOAuth(
		provider: string,
		request: ExchangeOAuthCodeRequest,
	): Promise<ResponseDTO<SignInResponse>> {
		return HttpService.post<ResponseDTO<SignInResponse>>(
			`/api/auth/${provider}/exchange`,
			request,
		);
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

	/**
	 * Cập nhật thông tin cá nhân (tên hiển thị, email)
	 */
	updateProfile(request: UpdateProfileRequest): Promise<ResponseDTO<UserProfile>> {
		return HttpService.put<ResponseDTO<UserProfile>>("/api/auth/profile", request);
	},

	/**
	 * Đổi mật khẩu
	 */
	changePassword(request: ChangePasswordRequest): Promise<ResponseDTO<void>> {
		return HttpService.post<ResponseDTO<void>>("/api/auth/change-password", request);
	},

	/**
	 * Gửi mã xác thực email
	 */
	sendEmailVerification(request?: SendVerificationCodeRequest): Promise<ResponseDTO<string>> {
		return HttpService.post<ResponseDTO<string>>("/api/auth/email/send-verification", request || {});
	},

	/**
	 * Xác thực email bằng mã OTP
	 */
	verifyEmail(request: VerifyEmailRequest): Promise<ResponseDTO<UserProfile>> {
		return HttpService.post<ResponseDTO<UserProfile>>("/api/auth/email/verify", request);
	},
};
