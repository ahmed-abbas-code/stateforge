// src/authentication/client/utils/backendClient.ts

export function createBackendClient(baseURL = '') {
  return {
    async get<T>(path: string, init?: RequestInit): Promise<{ data: T }> {
      const res = await fetch(`${baseURL}${path}`, {
        ...init,
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Request failed');
      return { data: json as T };
    },

    async post<T>(path: string, body: unknown, init?: RequestInit): Promise<{ data: T }> {
      const res = await fetch(`${baseURL}${path}`, {
        ...init,
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Request failed');
      return { data: json as T };
    },

    async delete<T = unknown>(path: string, init?: RequestInit): Promise<{ data: T }> {
      const res = await fetch(`${baseURL}${path}`, {
        ...init,
        method: 'DELETE',
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Request failed');
      return { data: json as T };
    },
  };
}
