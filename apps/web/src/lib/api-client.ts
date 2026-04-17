const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends Omit<RequestInit, 'body'> {
    body?: unknown | FormData;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { body, headers: customHeaders, ...rest } = options;

    // When body is FormData, let the browser set the Content-Type (with boundary)
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const headers: Record<string, string> = isFormData
        ? { ...(customHeaders as Record<string, string>) }
        : {
              'Content-Type': 'application/json',
              ...(customHeaders as Record<string, string>),
          };

    const res = await fetch(`${API_BASE}${path}`, {
        ...rest,
        headers,
        body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Forward cookies (session_token)
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ error: res.statusText }));
        throw new ApiClientError(
            errorBody.error || `Request failed: ${res.status}`,
            res.status,
            errorBody.code,
        );
    }

    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
}

export class ApiClientError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
    ) {
        super(message);
        this.name = 'ApiClientError';
    }
}

export const api = {
    get<T>(path: string, options?: FetchOptions): Promise<T> {
        return apiFetch<T>(path, { ...options, method: 'GET' });
    },

    post<T>(path: string, body?: unknown | FormData, options?: FetchOptions): Promise<T> {
        return apiFetch<T>(path, { ...options, method: 'POST', body });
    },

    patch<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
        return apiFetch<T>(path, { ...options, method: 'PATCH', body });
    },

    put<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
        return apiFetch<T>(path, { ...options, method: 'PUT', body });
    },

    delete<T>(path: string, options?: FetchOptions): Promise<T> {
        return apiFetch<T>(path, { ...options, method: 'DELETE' });
    },
};
