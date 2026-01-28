import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

type ApiResponse<T> = {
    data: T;
    status: number;
    headers: Record<string, string>;
};

class ApiService {
    private client: AxiosInstance;
    private authToken: string | null = null;

    constructor(baseURL: string = "") {
        this.client = axios.create({
            baseURL,
            timeout: 30_000,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        // Attach token to every request if present
        this.client.interceptors.request.use((config) => {
            // Get token from instance or from storage
            const token = this.authToken ||
                         localStorage.getItem("authToken") ||
                         sessionStorage.getItem("authToken");

            if (token) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    // Token management
    setToken(token: string) {
        this.authToken = token;
    }

    clearToken() {
        this.authToken = null;
    }

    getToken(): string | null {
        return this.authToken;
    }

    // Generic request wrapper
    private async request<T = any>(
        config: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        const res: AxiosResponse<T> = await this.client.request<T>(config);
        return {
            data: res.data,
            status: res.status,
            headers: (res.headers as Record<string, string>) ?? {},
        };
    }

    // Convenience methods
    get<T = any>(url: string, params?: Record<string, any>) {
        return this.request<T>({ url, method: "GET", params });
    }

    post<T = any>(url: string, data?: any) {
        return this.request<T>({ url, method: "POST", data });
    }

    put<T = any>(url: string, data?: any) {
        return this.request<T>({ url, method: "PUT", data });
    }

    patch<T = any>(url: string, data?: any) {
        return this.request<T>({ url, method: "PATCH", data });
    }

    delete<T = any>(url: string, params?: Record<string, any>) {
        return this.request<T>({ url, method: "DELETE", params });
    }

    // File upload helper
    async upload<T = any>(
        url: string,
        formData: FormData,
        extraHeaders?: Record<string, string>
    ) {
        const res = await this.client.request<T>({
            url,
            method: "POST",
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
                ...(extraHeaders ?? {}),
            },
        });
        return {
            data: res.data,
            status: res.status,
            headers: (res.headers as Record<string, string>) ?? {},
        } as ApiResponse<T>;
    }
}

// Create a singleton instance with base URL from env
// Use relative URL for proxy to work in development
const baseURL = process.env.REACT_APP_API_URL;
const api = new ApiService(baseURL);

export default api;