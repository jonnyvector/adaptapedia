/**
 * Utility functions for spoiler control and filtering.
 */

import type { SpoilerScope, DiffItem } from './types';
import type { SpoilerPreference } from '@/components/diff/SpoilerControl';

/**
 * Get allowed scopes for a given preference
 */
export function getAllowedScopes(preference: SpoilerPreference): SpoilerScope[] {
  switch (preference) {
    case 'SAFE':
      return ['NONE'];
    case 'BOOK_ALLOWED':
      return ['NONE', 'BOOK_ONLY'];
    case 'SCREEN_ALLOWED':
      return ['NONE', 'SCREEN_ONLY'];
    case 'FULL':
      return ['NONE', 'BOOK_ONLY', 'SCREEN_ONLY', 'FULL'];
    default:
      return ['NONE'];
  }
}

/**
 * Check if a diff should be shown based on user preference
 */
export function shouldShowDiff(
  diffScope: SpoilerScope,
  preference: SpoilerPreference
): boolean {
  const allowedScopes = getAllowedScopes(preference);
  return allowedScopes.includes(diffScope);
}

/**
 * Filter diffs into visible and masked based on preference
 */
export function filterDiffsByPreference(
  diffs: DiffItem[],
  preference: SpoilerPreference
): {
  visible: DiffItem[];
  masked: DiffItem[];
} {
  const visible: DiffItem[] = [];
  const masked: DiffItem[] = [];

  diffs.forEach((diff) => {
    if (shouldShowDiff(diff.spoiler_scope, preference)) {
      visible.push(diff);
    } else {
      masked.push(diff);
    }
  });

  return { visible, masked };
}

/**
 * Get the maximum spoiler scope to fetch from API based on preference
 */
export function getMaxScopeForAPI(preference: SpoilerPreference): SpoilerScope {
  switch (preference) {
    case 'SAFE':
      return 'NONE';
    case 'BOOK_ALLOWED':
      return 'BOOK_ONLY';
    case 'SCREEN_ALLOWED':
      return 'SCREEN_ONLY';
    case 'FULL':
      return 'FULL';
    default:
      return 'NONE';
  }
}

/**
 * Load spoiler preference from localStorage
 */
export function loadSpoilerPreference(): SpoilerPreference {
  if (typeof window === 'undefined') {
    return 'SAFE';
  }

  const stored = localStorage.getItem('spoilerPreference');
  if (
    stored === 'SAFE' ||
    stored === 'BOOK_ALLOWED' ||
    stored === 'SCREEN_ALLOWED' ||
    stored === 'FULL'
  ) {
    return stored;
  }

  return 'SAFE';
}

/**
 * Convert old SpoilerScope to new SpoilerPreference
 * (for backward compatibility if needed)
 */
export function scopeToPreference(scope: SpoilerScope): SpoilerPreference {
  switch (scope) {
    case 'NONE':
      return 'SAFE';
    case 'BOOK_ONLY':
      return 'BOOK_ALLOWED';
    case 'SCREEN_ONLY':
      return 'SCREEN_ALLOWED';
    case 'FULL':
      return 'FULL';
    default:
      return 'SAFE';
  }
}
