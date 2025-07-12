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

    /**
     * Fetches a binary blob (e.g. DOCX, image) without JSON parsing.
     */
    async getBlob(path: string, init?: RequestInit): Promise<Blob> {
      const res = await fetch(`${baseURL}${path}`, {
        ...init,
        credentials: 'include',
      });

      if (!res.ok) {
        // try to surface any error message
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Request failed (${res.status})`);
      }

      return res.blob();
    },
  };
}
