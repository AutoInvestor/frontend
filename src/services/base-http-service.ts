import {ZodType, ZodVoid} from "zod/v4";

export abstract class BaseHttpService {
    private readonly baseUrl: string;

    protected constructor(baseUrl: string = import.meta.env.VITE_API_GATEWAY_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    protected async get<T>(endpoint: string, type: ZodType<T>): Promise<T> {
        const response = await this.customFetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
        });
        return this.handleResponse<T>(response, type);
    }

    protected async post<T, B = unknown>(endpoint: string, body: B, type: ZodType<T>): Promise<T> {
        const response = await this.customFetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, type);
    }

    protected async put<T, B = unknown>(endpoint: string, body: B, type: ZodType<T>): Promise<T> {
        const response = await this.customFetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response, type);
    }

    protected async delete<T>(endpoint: string, type: ZodType<T>): Promise<T> {
        const response = await this.customFetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
        });
        return this.handleResponse<T>(response, type);
    }

    private async customFetch(endpoint: string, init: RequestInit): Promise<Response> {
        return await fetch(endpoint, {
            ...init,
            credentials: "include"
        });
    }

    private async handleResponse<T>(response: Response, type: ZodType<T>): Promise<T> {
        if (response.redirected) {
            if (response.url.startsWith("https://dev-20214328.okta.com")) {
                window.location.replace(response.url);
                return Promise.reject("Redirected to login");
            }
            return Promise.reject(`Redirect to ${response.url} is unauthorized`);
        }
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorBody}`);
        }

        if (type instanceof ZodVoid) return type.parse(undefined) as T;

        const raw = await response.json();
        return type.parse(raw);
    }
}
