import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants/StorageKey";

export const tokenStorage = {
	getAccessToken: () => localStorage.getItem(ACCESS_TOKEN),
	getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN),

	setTokens: (accessToken: string, refreshToken: string) => {
		if (accessToken) localStorage.setItem(ACCESS_TOKEN, accessToken);
		if (refreshToken) localStorage.setItem(REFRESH_TOKEN, refreshToken);
	},

	clearTokens: () => {
		localStorage.removeItem(ACCESS_TOKEN);
		localStorage.removeItem(REFRESH_TOKEN);
	},

	hasTokens: () => {
		return Boolean(
			localStorage.getItem(ACCESS_TOKEN) ||
			localStorage.getItem(REFRESH_TOKEN),
		);
	},
};