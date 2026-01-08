import { api } from './api';
import { UsernameCheckResponse, UserPreferences, SuggestedComparison } from './types';

// Debounce helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Validate username format client-side
export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
}

// Genre options for quiz
export const GENRE_OPTIONS = [
  'Fiction',
  'Non-Fiction',
  'Fantasy',
  'Mystery',
  'Sci-Fi',
  'Romance',
  'Horror',
  'Biography',
  'Drama',
  'Historical',
  'Thriller',
  'Comedy',
];

// Mock API functions (replace with real API calls when backend is ready)
export async function checkUsername(username: string): Promise<UsernameCheckResponse> {
  // TODO: Replace with real API call when backend endpoint is ready
  // Example: return api.onboarding.checkUsername(username);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        available: !['admin', 'test', 'user'].includes(username.toLowerCase()),
        suggestions: ['bookworm_2026', 'reader_x', 'adaptafan_123'],
      });
    }, 300);
  });
}

export async function setUsername(username: string): Promise<{ success: boolean; user?: any }> {
  // TODO: Replace with real API call when backend endpoint is ready
  // Example: return api.onboarding.setUsername({ username });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}

export async function savePreferences(preferences: Partial<UserPreferences>): Promise<{ success: boolean }> {
  // TODO: Replace with real API call when backend endpoint is ready
  // Example: return api.onboarding.savePreferences(preferences);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
}

export async function getSuggestedComparisons(): Promise<SuggestedComparison[]> {
  // TODO: Replace with real API call when backend endpoint is ready
  // Example: return api.onboarding.getSuggestions();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          work_slug: 'hunger-games',
          work_title: 'The Hunger Games',
          screen_work_slug: 'hunger-games-movie',
          screen_work_title: 'The Hunger Games (Movie)',
          genres: ['Fantasy', 'Sci-Fi'],
          diff_count: 12,
          vote_count: 45,
          comment_count: 8,
        },
        {
          work_slug: 'harry-potter-philosophers-stone',
          work_title: "Harry Potter and the Philosopher's Stone",
          screen_work_slug: 'harry-potter-sorcerers-stone',
          screen_work_title: "Harry Potter and the Sorcerer's Stone (Movie)",
          genres: ['Fantasy'],
          diff_count: 24,
          vote_count: 89,
          comment_count: 15,
        },
        {
          work_slug: 'lord-of-the-rings-fellowship',
          work_title: 'The Fellowship of the Ring',
          screen_work_slug: 'lotr-fellowship-movie',
          screen_work_title: 'The Lord of the Rings: The Fellowship of the Ring (Movie)',
          genres: ['Fantasy'],
          diff_count: 31,
          vote_count: 102,
          comment_count: 22,
        },
      ]);
    }, 500);
  });
}
