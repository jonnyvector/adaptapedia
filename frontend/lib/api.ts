/**
 * API client for Adaptapedia backend.
 */

import type {
  AuthResponse,
  SignupData,
  LoginData,
  User,
  CreateDiffData,
  DiffItem,
  CreateComparisonVoteData,
  ComparisonVoteStats,
  SearchWithAdaptationsResponse
} from './types';

// Use API_URL for server-side, NEXT_PUBLIC_API_URL for client-side
const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.API_URL || 'http://backend:8000/api'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

// Token management
let accessToken: string | null = null;

export const tokenManager = {
  setToken: (token: string | null): void => {
    accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  },

  getToken: (): string | null => {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem('accessToken');
      return accessToken;
    }
    return null;
  },

  clearToken: (): void => {
    accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
};

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add authorization header if token exists
  const token = tokenManager.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
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
    searchWithAdaptations: async (query: string, limit?: number): Promise<SearchWithAdaptationsResponse> => {
      const params = new URLSearchParams({ q: query });
      if (limit) {
        params.set('limit', limit.toString());
      }
      return fetchApi<SearchWithAdaptationsResponse>(`/works/search-with-adaptations/?${params}`);
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

  adaptations: {
    byWork: async (workId: number) => {
      const query = `?work=${workId}`;
      return fetchApi(`/screen/adaptations/${query}`);
    },
    byScreenWork: async (screenWorkId: number) => {
      const query = `?screen_work=${screenWorkId}`;
      return fetchApi(`/screen/adaptations/${query}`);
    },
  },

  diffs: {
    list: async (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi(`/diffs/items/${query}`);
    },
    create: async (data: CreateDiffData): Promise<DiffItem> => {
      return fetchApi<DiffItem>('/diffs/items/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    topByWork: async (workId: number, limit: number = 10) => {
      const query = `?work=${workId}&ordering=-votes&limit=${limit}`;
      return fetchApi(`/diffs/items/${query}`);
    },
    topByScreenWork: async (screenWorkId: number, limit: number = 10) => {
      const query = `?screen_work=${screenWorkId}&ordering=-vote_counts__accurate&limit=${limit}`;
      return fetchApi(`/diffs/items/${query}`);
    },
    vote: async (diffId: number, voteType: 'ACCURATE' | 'NEEDS_NUANCE' | 'DISAGREE') => {
      return fetchApi(`/diffs/items/${diffId}/vote/`, {
        method: 'POST',
        body: JSON.stringify({ vote: voteType }),
      });
    },
  },

  compare: {
    get: async (workId: number, screenWorkId: number, spoilerScope?: string, ordering?: string) => {
      const params: Record<string, string> = {
        work: workId.toString(),
        screen_work: screenWorkId.toString(),
      };
      if (spoilerScope) {
        params.max_spoiler_scope = spoilerScope;
      }
      if (ordering) {
        params.ordering = ordering;
      }
      const query = `?${new URLSearchParams(params)}`;
      return fetchApi(`/diffs/items/${query}`);
    },
  },

  comments: {
    list: async (diffItemId: number) => {
      return fetchApi(`/diffs/comments/?diff_item=${diffItemId}`);
    },
    create: async (diffItemId: number, body: string, spoilerScope: string) => {
      return fetchApi('/diffs/comments/', {
        method: 'POST',
        body: JSON.stringify({
          diff_item: diffItemId,
          body,
          spoiler_scope: spoilerScope,
        }),
      });
    },
  },

  users: {
    getProfile: async (username: string) => {
      return fetchApi(`/users/${username}/`);
    },
    getDiffs: async (username: string, params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi(`/users/${username}/diffs/${query}`);
    },
    getComments: async (username: string, params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi(`/users/${username}/comments/${query}`);
    },
  },

  auth: {
    signup: async (data: SignupData): Promise<AuthResponse> => {
      return fetchApi<AuthResponse>('/users/signup/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
      return fetchApi<AuthResponse>('/users/login/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    logout: async (refreshToken: string): Promise<{ message: string }> => {
      return fetchApi('/users/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
    },

    getCurrentUser: async (): Promise<User> => {
      return fetchApi<User>('/users/me/');
    },
  },

  comparisonVotes: {
    getStats: async (workId: number, screenWorkId: number): Promise<ComparisonVoteStats> => {
      return fetchApi<ComparisonVoteStats>(
        `/diffs/comparison-votes/stats/?work=${workId}&screen_work=${screenWorkId}`
      );
    },

    submit: async (data: CreateComparisonVoteData) => {
      return fetchApi('/diffs/comparison-votes/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  moderation: {
    diffs: {
      list: async (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return fetchApi(`/mod/diffs/${query}`);
      },
      approve: async (diffId: number) => {
        return fetchApi(`/mod/diffs/${diffId}/approve/`, {
          method: 'POST',
        });
      },
      reject: async (diffId: number, reason?: string) => {
        return fetchApi(`/mod/diffs/${diffId}/reject/`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
      },
      flag: async (diffId: number) => {
        return fetchApi(`/mod/diffs/${diffId}/flag/`, {
          method: 'POST',
        });
      },
    },
    comments: {
      list: async (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return fetchApi(`/mod/comments/${query}`);
      },
      approve: async (commentId: number) => {
        return fetchApi(`/mod/comments/${commentId}/approve/`, {
          method: 'POST',
        });
      },
      hide: async (commentId: number) => {
        return fetchApi(`/mod/comments/${commentId}/hide/`, {
          method: 'POST',
        });
      },
      delete: async (commentId: number) => {
        return fetchApi(`/mod/comments/${commentId}/delete/`, {
          method: 'POST',
        });
      },
    },
  },
};
