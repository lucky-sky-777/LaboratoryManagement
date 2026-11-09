import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants/StorageKey";
import { AuthApi } from "../../features/auth/api/AuthApi";
import { HttpError } from "./HttpError";
import { HttpMethod } from "./HttpMethod";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
	params?: QueryParams;
	body?: unknown;
	// === [MỚI 2]: Cờ đánh dấu request đã được thử lại sau khi refresh để tránh lặp vô tận ===
    _retry?: boolean;
}

// === [MỚI 4]: Cấu hình đường dẫn API để tránh lặp interceptor ===
const AUTH_REFRESH_PATH = "/api/auth/refresh";
const AUTH_LOGIN_PATH = "/api/auth/signin";
const LOGIN_PAGE_URL = "/signin";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class HttpService {
	// === [MỚI 5]: Biến giữ Promise khi đang refresh, giúp các API bị 401 cùng lúc đợi chung 1 kết quả ===
    private static refreshPromise: Promise<boolean> | null = null;

	// === [MỚI 6]: Hàm gọi API Refresh Token ===
    private static async refreshAccessToken(): Promise<boolean> {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            return false;
        }

        try {
            const response = await AuthApi.refresh();

            // Nếu API refresh trả về 401 (hoặc lỗi bất kỳ) -> Thất bại
            if (!response.success) {
                return false;
            }

            const data = response.data;

            if (data.access_token) {
                localStorage.setItem(ACCESS_TOKEN, data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem(REFRESH_TOKEN, data.refresh_token);
                }
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }

    // === [MỚI 7]: Hàm xóa sạch cả 2 token và điều hướng về trang đăng nhập ===
    public static forceLogout(): void {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);

        // Phát sự kiện để AuthContext xóa state user hiện tại
        window.dispatchEvent(new Event("auth:logout"));

        if (window.location.pathname !== LOGIN_PAGE_URL) {
            window.location.href = LOGIN_PAGE_URL;
        }
    }

	private static buildURL(path: string): URL {
		return new URL(
			`${BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`,
			window.location.origin,
		);
	}

	private static addQueryParams(url: URL, params: QueryParams | undefined): URL {
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					url.searchParams.set(key, String(value));
				}
			});
		}
		return url;
	}

	private static async request<T>(
		method: string,
		path: string,
		options: RequestOptions = {},
	): Promise<T> {
		const { params, body, headers, _retry, ...init } = options;

		// Xây dựng URL
		let url = this.buildURL(path);

		// Thêm query parameters
		url = this.addQueryParams(url, params);

		const requestHeaders = new Headers(headers);

		const accessToken = localStorage.getItem(ACCESS_TOKEN);

		if (accessToken) {
			requestHeaders.set("Authorization", `Bearer ${accessToken}`);
		}

		let requestBody: BodyInit | undefined;

		if (body !== undefined && body !== null) {
			if (
				body instanceof FormData ||
				body instanceof Blob ||
				typeof body === "string"
			) {
				requestBody = body;
			} else {
				requestHeaders.set("Content-Type", "application/json");
				requestBody = JSON.stringify(body);
			}
		}

		// Gửi request
		const response = await fetch(url, {
			...init,
			method,
			headers: requestHeaders,
			body: requestBody,
		});

		// === [MỚI 9]: Bắt lỗi 401 để tự động gọi Refresh Token trước khi đọc lỗi ===
        const isAuthEndpoint =
            path.includes(AUTH_LOGIN_PATH) || path.includes(AUTH_REFRESH_PATH);

        if (response.status === 401 && !_retry && !isAuthEndpoint) {
            // Nếu chưa có tiến trình refresh nào đang chạy thì khởi tạo
            if (!this.refreshPromise) {
                this.refreshPromise = this.refreshAccessToken().finally(() => {
                    this.refreshPromise = null;
                });
            }

            const isRefreshed = await this.refreshPromise;

            if (isRefreshed) {
                // Refresh thành công -> Gọi lại chính request vừa bị lỗi với token mới
                return this.request<T>(method, path, {
                    ...options,
                    _retry: true,
                });
            } else {
                // Refresh trả về 401 / thất bại -> Xóa cả 2 token và chuyển về trang đăng nhập
                this.forceLogout();
            }
        }

		// Đọc response
		const contentType = response.headers.get("content-type") ?? "";

		let data = null;

		if (response.status !== 204) {
			if (contentType.includes("application/json")) {
				data = await response.json();
			} else {
				data = await response.text();
			}
		}

		// Xử lý lỗi HTTP
		if (!response.ok) {
			// === [ĐÃ SỬA 10]: Sửa lỗi crash "message in data" khi data là null hoặc string ===
            const hasMessage =
                typeof data === "object" &&
                data !== null &&
                "message" in data &&
                typeof (data as Record<string, unknown>).message === "string";

            const message = hasMessage
                ? ((data as Record<string, unknown>).message as string)
                : `HTTP ${response.status}: ${response.statusText}`;

            throw new HttpError(response.status, message, data);
		}

		return data as T;
	}

	static get<T>(
		path: string,
		options?: Omit<RequestOptions, "body">,
	): Promise<T> {
		return this.request<T>(HttpMethod.GET, path, options);
	}

	static post<T>(
		path: string,
		body?: unknown,
		options?: Omit<RequestOptions, "body">,
	): Promise<T> {
		return this.request<T>(HttpMethod.POST, path, {
			...options,
			body,
		});
	}

	static put<T>(
		path: string,
		body?: unknown,
		options?: Omit<RequestOptions, "body">,
	): Promise<T> {
		return this.request<T>(HttpMethod.PUT, path, {
			...options,
			body,
		});
	}

	static patch<T>(
		path: string,
		body?: unknown,
		options?: Omit<RequestOptions, "body">,
	): Promise<T> {
		return this.request<T>(HttpMethod.PATCH, path, {
			...options,
			body,
		});
	}

	static delete<T>(
		path: string,
		options?: Omit<RequestOptions, "body">,
	): Promise<T> {
		return this.request<T>(HttpMethod.DELETE, path, options);
	}
}
