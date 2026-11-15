export interface SignInRequest {
	username: string;
	password: string;
}

export interface SignInResponse {
	access_token: string;
	refresh_token: string;
}

export interface SignUpRequest {
	username: string;
	password: string;
	display_name?: string;
	email?: string;
	avatar_url?: string;
}

export interface SignUpResponse {
	user_id: number;
	username: string;
}

export interface ExchangeOAuthCodeRequest {
	oauth_authorization_code: string;
}

export interface UserInfo {
	id: number;
	username: string;
	email: string;
}

export interface UserProfile {
    id: number;
    username: string;
	display_name: string;
	avatar_url: string;
    email: string;
    email_verified?: boolean;
    provider?: "INTERNAL" | "GOOGLE" | "MEZON" | string;
    joined_at?: string;
}

export interface UpdateProfileRequest {
	display_name?: string;
	email?: string;
}

export interface ChangePasswordRequest {
	old_password: string;
	new_password: string;
}

export interface SendVerificationCodeRequest {
	email?: string;
}

export interface VerifyEmailRequest {
	code: string;
}