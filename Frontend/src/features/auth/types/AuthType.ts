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
	email: string;
	password: string;
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
}