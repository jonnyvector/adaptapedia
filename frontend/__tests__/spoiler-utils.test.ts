/**
 * Tests for spoiler utility functions
 */

import {
  getAllowedScopes,
  shouldShowDiff,
  filterDiffsByPreference,
  getMaxScopeForAPI,
  loadSpoilerPreference,
  scopeToPreference,
} from '@/lib/spoiler-utils';
import type { DiffItem } from '@/lib/types';

describe('Spoiler Utilities', () => {
  describe('getAllowedScopes', () => {
    it('returns only NONE for SAFE preference', () => {
      expect(getAllowedScopes('SAFE')).toEqual(['NONE']);
    });

    it('returns NONE and BOOK_ONLY for BOOK_ALLOWED preference', () => {
      expect(getAllowedScopes('BOOK_ALLOWED')).toEqual(['NONE', 'BOOK_ONLY']);
    });

    it('returns NONE and SCREEN_ONLY for SCREEN_ALLOWED preference', () => {
      expect(getAllowedScopes('SCREEN_ALLOWED')).toEqual(['NONE', 'SCREEN_ONLY']);
    });

    it('returns all scopes for FULL preference', () => {
      expect(getAllowedScopes('FULL')).toEqual(['NONE', 'BOOK_ONLY', 'SCREEN_ONLY', 'FULL']);
    });
  });

  describe('shouldShowDiff', () => {
    it('shows NONE scope diffs for all preferences', () => {
      expect(shouldShowDiff('NONE', 'SAFE')).toBe(true);
      expect(shouldShowDiff('NONE', 'BOOK_ALLOWED')).toBe(true);
      expect(shouldShowDiff('NONE', 'SCREEN_ALLOWED')).toBe(true);
      expect(shouldShowDiff('NONE', 'FULL')).toBe(true);
    });

    it('hides BOOK_ONLY for SAFE and SCREEN_ALLOWED', () => {
      expect(shouldShowDiff('BOOK_ONLY', 'SAFE')).toBe(false);
      expect(shouldShowDiff('BOOK_ONLY', 'SCREEN_ALLOWED')).toBe(false);
    });

    it('shows BOOK_ONLY for BOOK_ALLOWED and FULL', () => {
      expect(shouldShowDiff('BOOK_ONLY', 'BOOK_ALLOWED')).toBe(true);
      expect(shouldShowDiff('BOOK_ONLY', 'FULL')).toBe(true);
    });

    it('hides SCREEN_ONLY for SAFE and BOOK_ALLOWED', () => {
      expect(shouldShowDiff('SCREEN_ONLY', 'SAFE')).toBe(false);
      expect(shouldShowDiff('SCREEN_ONLY', 'BOOK_ALLOWED')).toBe(false);
    });

    it('shows SCREEN_ONLY for SCREEN_ALLOWED and FULL', () => {
      expect(shouldShowDiff('SCREEN_ONLY', 'SCREEN_ALLOWED')).toBe(true);
      expect(shouldShowDiff('SCREEN_ONLY', 'FULL')).toBe(true);
    });

    it('only shows FULL scope for FULL preference', () => {
      expect(shouldShowDiff('FULL', 'SAFE')).toBe(false);
      expect(shouldShowDiff('FULL', 'BOOK_ALLOWED')).toBe(false);
      expect(shouldShowDiff('FULL', 'SCREEN_ALLOWED')).toBe(false);
      expect(shouldShowDiff('FULL', 'FULL')).toBe(true);
    });
  });

  describe('filterDiffsByPreference', () => {
    const mockDiffs: DiffItem[] = [
      {
        id: 1,
        work: 1,
        screen_work: 1,
        category: 'PLOT',
        claim: 'Safe diff',
        detail: '',
        spoiler_scope: 'NONE',
        status: 'LIVE',
        created_by: 1,
        created_by_username: 'user1',
        vote_counts: { accurate: 5, needs_nuance: 1, disagree: 0 },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 2,
        work: 1,
        screen_work: 1,
        category: 'CHARACTER',
        claim: 'Book spoiler diff',
        detail: '',
        spoiler_scope: 'BOOK_ONLY',
        status: 'LIVE',
        created_by: 1,
        created_by_username: 'user1',
        vote_counts: { accurate: 3, needs_nuance: 0, disagree: 1 },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 3,
        work: 1,
        screen_work: 1,
        category: 'ENDING',
        claim: 'Screen spoiler diff',
        detail: '',
        spoiler_scope: 'SCREEN_ONLY',
        status: 'LIVE',
        created_by: 1,
        created_by_username: 'user1',
        vote_counts: { accurate: 2, needs_nuance: 2, disagree: 0 },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 4,
        work: 1,
        screen_work: 1,
        category: 'ENDING',
        claim: 'Full spoiler diff',
        detail: '',
        spoiler_scope: 'FULL',
        status: 'LIVE',
        created_by: 1,
        created_by_username: 'user1',
        vote_counts: { accurate: 1, needs_nuance: 1, disagree: 1 },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    it('filters correctly for SAFE preference', () => {
      const { visible, masked } = filterDiffsByPreference(mockDiffs, 'SAFE');
      expect(visible).toHaveLength(1);
      expect(masked).toHaveLength(3);
      expect(visible[0].spoiler_scope).toBe('NONE');
    });

    it('filters correctly for BOOK_ALLOWED preference', () => {
      const { visible, masked } = filterDiffsByPreference(mockDiffs, 'BOOK_ALLOWED');
      expect(visible).toHaveLength(2);
      expect(masked).toHaveLength(2);
      expect(visible.map((d) => d.spoiler_scope)).toEqual(['NONE', 'BOOK_ONLY']);
    });

    it('filters correctly for SCREEN_ALLOWED preference', () => {
      const { visible, masked } = filterDiffsByPreference(mockDiffs, 'SCREEN_ALLOWED');
      expect(visible).toHaveLength(2);
      expect(masked).toHaveLength(2);
      expect(visible.map((d) => d.spoiler_scope)).toEqual(['NONE', 'SCREEN_ONLY']);
    });

    it('shows all diffs for FULL preference', () => {
      const { visible, masked } = filterDiffsByPreference(mockDiffs, 'FULL');
      expect(visible).toHaveLength(4);
      expect(masked).toHaveLength(0);
    });
  });

  describe('getMaxScopeForAPI', () => {
    it('returns correct max scope for each preference', () => {
      expect(getMaxScopeForAPI('SAFE')).toBe('NONE');
      expect(getMaxScopeForAPI('BOOK_ALLOWED')).toBe('BOOK_ONLY');
      expect(getMaxScopeForAPI('SCREEN_ALLOWED')).toBe('SCREEN_ONLY');
      expect(getMaxScopeForAPI('FULL')).toBe('FULL');
    });
  });

  describe('scopeToPreference', () => {
    it('converts scopes to preferences correctly', () => {
      expect(scopeToPreference('NONE')).toBe('SAFE');
      expect(scopeToPreference('BOOK_ONLY')).toBe('BOOK_ALLOWED');
      expect(scopeToPreference('SCREEN_ONLY')).toBe('SCREEN_ALLOWED');
      expect(scopeToPreference('FULL')).toBe('FULL');
    });
  });

  describe('loadSpoilerPreference', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns SAFE as default when nothing in localStorage', () => {
      expect(loadSpoilerPreference()).toBe('SAFE');
    });

    it('loads saved preference from localStorage', () => {
      localStorage.setItem('spoilerPreference', 'BOOK_ALLOWED');
      expect(loadSpoilerPreference()).toBe('BOOK_ALLOWED');
    });

    it('returns SAFE for invalid values in localStorage', () => {
      localStorage.setItem('spoilerPreference', 'INVALID_VALUE');
      expect(loadSpoilerPreference()).toBe('SAFE');
    });
  });
});
