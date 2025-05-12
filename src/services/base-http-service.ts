export abstract class BaseHttpService {
    private readonly baseUrl: string;

    protected constructor(baseUrl: string = import.meta.env.VITE_API_GATEWAY_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    protected async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            credentials: "include"
        });
        return this.handleResponse<T>(response);
    }

    protected async post<T, B = unknown>(endpoint: string, body: B): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response);
    }

    protected async put<T, B = unknown>(endpoint: string, body: B): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response);
    }

    protected async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            credentials: "include"
        });
        return this.handleResponse<T>(response);
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorBody}`);
        }
        return response.json();
    }
}
