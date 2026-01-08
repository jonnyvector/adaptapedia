/**
 * API client for Adaptapedia backend.
 */

import type {
  AuthResponse,
  SignupData,
  LoginData,
  User,
  UserProfile,
  CreateDiffData,
  DiffItem,
  CreateComparisonVoteData,
  ComparisonVoteStats,
  SearchWithAdaptationsResponse,
  GenreListResponse,
  ApiResponse,
  WorkWithAdaptations,
  SimilarBooksResponse,
  TrendingComparison,
  Vote,
  VoteType,
  Comment,
  Bookmark,
  BookmarkCheckResponse,
  Notification,
  VoteResponse,
  NeedsHelpResponse
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
      // Remove current tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Also remove old underscore versions (from social auth before fix)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
};

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
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

    // Don't log 401 errors for /users/me/ - these are expected for expired tokens
    const shouldLog = !(response.status === 401 && url.includes('/users/me'));
    if (shouldLog) {
      console.error('API Error:', {
        url,
        status: response.status,
        error,
      });
    }

    // Handle validation errors (400) with field-level errors
    if (response.status === 400 && !error.error && typeof error === 'object') {
      // Check if this looks like DRF validation errors {field: [messages]}
      const hasFieldErrors = Object.values(error).some(val => Array.isArray(val));
      if (hasFieldErrors) {
        throw new ApiError(
          'Validation failed',
          response.status,
          error // Pass field errors as detail
        );
      }
    }

    throw new ApiError(
      error.error || error.detail || 'Request failed',
      response.status,
      error.detail || error
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
    genres: async (): Promise<GenreListResponse> => {
      return fetchApi<GenreListResponse>('/works/genres/');
    },
    byGenre: async (genre: string, page?: number, pageSize?: number): Promise<ApiResponse<WorkWithAdaptations>> => {
      const params: Record<string, string> = {};
      if (page) params.page = page.toString();
      if (pageSize) params.page_size = pageSize.toString();
      const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<ApiResponse<WorkWithAdaptations>>(`/works/by-genre/${encodeURIComponent(genre)}/${query}`);
    },
    similar: async (slug: string, limit?: number): Promise<SimilarBooksResponse> => {
      const params = limit ? `?limit=${limit}` : '';
      return fetchApi<SimilarBooksResponse>(`/works/${slug}/similar/${params}`);
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
    genres: async (type?: 'MOVIE' | 'TV') => {
      const params = type ? `?type=${type}` : '';
      return fetchApi(`/screen/works/genres/${params}`);
    },
    byGenre: async (genre: string, type?: 'MOVIE' | 'TV', page?: number, pageSize?: number) => {
      const params: Record<string, string> = {};
      if (type) params.type = type;
      if (page) params.page = page.toString();
      if (pageSize) params.page_size = pageSize.toString();
      const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
      return fetchApi(`/screen/works/by-genre/${encodeURIComponent(genre)}/${query}`);
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
    createWithImage: async (formData: FormData): Promise<DiffItem> => {
      const url = `${API_BASE_URL}/diffs/items/`;

      const headers: Record<string, string> = {};

      // Add authorization header if token exists
      const token = tokenManager.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
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
    },
    topByWork: async (workId: number, limit: number = 10) => {
      const query = `?work=${workId}&ordering=-votes&limit=${limit}`;
      return fetchApi(`/diffs/items/${query}`);
    },
    topByScreenWork: async (screenWorkId: number, limit: number = 10) => {
      const query = `?screen_work=${screenWorkId}&ordering=-vote_counts__accurate&limit=${limit}`;
      return fetchApi(`/diffs/items/${query}`);
    },
    vote: async (diffId: number, voteType: 'ACCURATE' | 'NEEDS_NUANCE' | 'DISAGREE'): Promise<VoteResponse> => {
      return fetchApi<VoteResponse>(`/diffs/items/${diffId}/vote/`, {
        method: 'POST',
        body: JSON.stringify({ vote: voteType }),
      });
    },
    getNeedsHelp: async (limit?: number): Promise<NeedsHelpResponse> => {
      const params = limit ? `?limit=${limit}` : '';
      return fetchApi<NeedsHelpResponse>(`/diffs/items/needs-help/${params}`);
    },
    getRandomComparison: async (): Promise<{ work_slug: string; screen_work_slug: string; diff_count: number }> => {
      return fetchApi('/diffs/items/random-comparison/');
    },
    browse: async () => {
      return fetchApi('/diffs/items/browse/');
    },
    getTrending: async (limit?: number, days?: number): Promise<TrendingComparison[]> => {
      const params: Record<string, string> = {};
      if (limit) params.limit = limit.toString();
      if (days) params.days = days.toString();
      const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<TrendingComparison[]>(`/diffs/items/trending/${query}`);
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
    create: async (diffItemId: number, body: string, spoilerScope: string, parentId?: number) => {
      const payload: Record<string, unknown> = {
        diff_item: diffItemId,
        body,
        spoiler_scope: spoilerScope,
      };
      if (parentId) {
        payload.parent = parentId;
      }
      return fetchApi('/diffs/comments/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  users: {
    getProfile: async (username: string): Promise<UserProfile> => {
      return fetchApi<UserProfile>(`/users/${username}/`);
    },
    getDiffs: async (username: string, params?: Record<string, string>): Promise<ApiResponse<DiffItem>> => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<ApiResponse<DiffItem>>(`/users/${username}/diffs/${query}`);
    },
    getComments: async (username: string, params?: Record<string, string>): Promise<ApiResponse<Comment>> => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<ApiResponse<Comment>>(`/users/${username}/comments/${query}`);
    },
    getVotes: async (username: string, params?: Record<string, string>): Promise<ApiResponse<Vote>> => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<ApiResponse<Vote>>(`/users/${username}/votes/${query}`);
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

  bookmarks: {
    list: async (params?: Record<string, string>): Promise<ApiResponse<Bookmark>> => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<ApiResponse<Bookmark>>(`/users/bookmarks/${query}`);
    },
    create: async (workId: number, screenWorkId: number): Promise<Bookmark> => {
      return fetchApi<Bookmark>('/users/bookmarks/', {
        method: 'POST',
        body: JSON.stringify({
          work: workId,
          screen_work: screenWorkId,
        }),
      });
    },
    delete: async (bookmarkId: number): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>(`/users/bookmarks/${bookmarkId}/`, {
        method: 'DELETE',
      });
    },
    deleteByComparison: async (workId: number, screenWorkId: number): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>(
        `/users/bookmarks/delete-by-comparison/?work=${workId}&screen_work=${screenWorkId}`,
        {
          method: 'DELETE',
        }
      );
    },
    check: async (workId: number, screenWorkId: number): Promise<BookmarkCheckResponse> => {
      return fetchApi<BookmarkCheckResponse>('/users/bookmarks/check/', {
        method: 'POST',
        body: JSON.stringify({
          work: workId,
          screen_work: screenWorkId,
        }),
      });
    },
  },

  notifications: {
    list: async (params?: Record<string, string>): Promise<ApiResponse<Notification>> => {
      const query = params ? `?${new URLSearchParams(params)}` : '';
      return fetchApi<ApiResponse<Notification>>(`/users/notifications/${query}`);
    },
    getUnreadCount: async (): Promise<{ count: number }> => {
      return fetchApi<{ count: number }>('/users/notifications/unread-count/');
    },
    markAsRead: async (notificationId: number): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>(`/users/notifications/${notificationId}/mark-read/`, {
        method: 'POST',
      });
    },
    markAllAsRead: async (): Promise<{ message: string; count: number }> => {
      return fetchApi<{ message: string; count: number }>('/users/notifications/mark-all-read/', {
        method: 'POST',
      });
    },
  },

  votes: {
    submit: async (diffId: number, data: { vote_type: VoteType }) => {
      return fetchApi(`/diffs/items/${diffId}/vote/`, {
        method: 'POST',
        body: JSON.stringify({ vote: data.vote_type }),
      });
    },
    delete: async (diffId: number) => {
      return fetchApi(`/diffs/items/${diffId}/vote/`, {
        method: 'DELETE',
      });
    },
  },
};
