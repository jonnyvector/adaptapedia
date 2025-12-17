/**
 * API client for Adaptapedia backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(
      error.error || 'Request failed',
      response.status,
      error.detail
    );
  }

  return response.json();
}

export const api = {
  works: {
    list: async (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi(`/works/${query}`);
    },
    get: async (slug: string) => {
      return fetchApi(`/works/${slug}/`);
    },
  },

  screen: {
    list: async (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi(`/screen/works/${query}`);
    },
    get: async (slug: string) => {
      return fetchApi(`/screen/works/${slug}/`);
    },
  },

  diffs: {
    list: async (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi(`/diffs/items/${query}`);
    },
    create: async (data: unknown) => {
      return fetchApi('/diffs/items/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};
