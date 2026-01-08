import { api, tokenManager } from './api';
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

// Real API functions for onboarding flow
export async function checkUsername(username: string): Promise<UsernameCheckResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/me/username/check/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenManager.getToken()}`,
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to check username' }));
    throw new Error(error.error || 'Failed to check username');
  }

  return response.json();
}

export async function setUsername(username: string): Promise<{ success: boolean; user?: any }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/me/username/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenManager.getToken()}`,
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to set username' }));
    throw new Error(error.error || 'Failed to set username');
  }

  return response.json();
}

export async function savePreferences(preferences: Partial<UserPreferences>): Promise<{ success: boolean }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/me/preferences/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenManager.getToken()}`,
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to save preferences' }));
    throw new Error(error.error || 'Failed to save preferences');
  }

  return response.json();
}

export async function getSuggestedComparisons(): Promise<SuggestedComparison[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/me/suggested-comparisons/`, {
    headers: {
      'Authorization': `Bearer ${tokenManager.getToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get suggestions' }));
    throw new Error(error.error || 'Failed to get suggestions');
  }

  const data = await response.json();
  return data.comparisons || [];
}

export async function completeOnboarding(): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/me/onboarding/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenManager.getToken()}`,
    },
    body: JSON.stringify({
      onboarding_completed: true,
      onboarding_step: 4,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to complete onboarding' }));
    throw new Error(error.error || 'Failed to complete onboarding');
  }
}
