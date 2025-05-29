import {ZodType} from "zod/v4";

export abstract class BaseHttpService {
    private readonly baseUrl: string;

    protected constructor(baseUrl: string = import.meta.env.VITE_API_GATEWAY_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    protected async get<T>(endpoint: string, type: ZodType<T>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            credentials: "include"
        });
        return this.handleResponse<T>(response, type);
    }

    protected async post<T, B = unknown>(endpoint: string, body: B, type: ZodType<T>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, type);
    }

    protected async put<T, B = unknown>(endpoint: string, body: B, type: ZodType<T>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, type);
    }

    protected async delete<T>(endpoint: string, type: ZodType<T>): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            credentials: "include"
        });
        return this.handleResponse<T>(response, type);
    }

    private async handleResponse<T>(response: Response, type: ZodType<T>): Promise<T> {
        if (response.redirected && response.url.includes("/api/oauth2/authorization/okta")) {
            window.location.href = response.url;
            return Promise.reject("Redirected");
        }
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorBody}`);
        }
        const raw = await response.json();
        return type.parse(raw);
    }
}
