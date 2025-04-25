export abstract class BaseHttpService {
    private readonly baseUrl: string;

    protected constructor(baseUrl: string = import.meta.env.VITE_API_GATEWAY_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = localStorage.getItem('token'); // or however you manage auth
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    }

    protected async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            //headers: await this.getAuthHeaders(),
        });
        return this.handleResponse<T>(response);
    }

    protected async post<T, B = unknown>(endpoint: string, body: B): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response);
    }

    protected async put<T, B = unknown>(endpoint: string, body: B): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response);
    }

    protected async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: await this.getAuthHeaders(),
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
