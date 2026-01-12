/**
 * Analytics event tracking utilities
 * Centralized place for all custom PostHog event tracking
 */

import { posthog } from './posthog';

export const analytics = {
  // ============================================================================
  // USER EVENTS
  // ============================================================================

  // Track user signup
  trackSignup: (method: 'email' | 'google' | 'facebook', userId: string) => {
    posthog.capture('user_signed_up', {
      method,
      user_id: userId,
    });
  },

  // Track login
  trackLogin: (method: 'email' | 'google' | 'facebook') => {
    posthog.capture('user_logged_in', {
      method,
    });
  },

  // Track onboarding completion
  trackOnboardingComplete: (userId: string) => {
    posthog.capture('onboarding_completed', {
      user_id: userId,
    });
  },

  // Track onboarding step
  trackOnboardingStep: (step: number, stepName: string) => {
    posthog.capture('onboarding_step_completed', {
      step,
      step_name: stepName,
    });
  },

  // ============================================================================
  // DIFF EVENTS
  // ============================================================================

  // Track diff creation
  trackDiffCreated: (data: {
    diffId: string;
    category: string;
    spoilerScope: string;
    workId: string;
    screenWorkId: string;
  }) => {
    posthog.capture('diff_created', data);
  },

  // Track diff vote
  trackDiffVote: (data: {
    diffId: string;
    voteType: 'ACCURATE' | 'NEEDS_NUANCE' | 'DISAGREE';
    workId: string;
    screenWorkId: string;
  }) => {
    posthog.capture('diff_voted', data);
  },

  // Track diff edit
  trackDiffEdited: (diffId: string) => {
    posthog.capture('diff_edited', {
      diff_id: diffId,
    });
  },

  // ============================================================================
  // COMPARISON EVENTS
  // ============================================================================

  // Track comparison view
  trackComparisonView: (data: {
    workId: string;
    screenWorkId: string;
    workTitle: string;
    screenWorkTitle: string;
  }) => {
    posthog.capture('comparison_viewed', data);
  },

  // Track comparison vote (book vs screen preference)
  trackComparisonVote: (data: {
    workId: string;
    screenWorkId: string;
    preference: 'BOOK' | 'SCREEN' | 'BOTH';
    faithfulnessRating?: number;
  }) => {
    posthog.capture('comparison_voted', data);
  },

  // Track spoiler level change
  trackSpoilerLevelChange: (data: {
    from: string;
    to: string;
    workId: string;
    screenWorkId: string;
  }) => {
    posthog.capture('spoiler_level_changed', data);
  },

  // ============================================================================
  // SEARCH & DISCOVERY EVENTS
  // ============================================================================

  // Track search
  trackSearch: (data: {
    query: string;
    resultCount: number;
    type?: 'books' | 'adaptations' | 'all';
  }) => {
    posthog.capture('search_performed', data);
  },

  // Track search result click
  trackSearchResultClick: (data: {
    query: string;
    resultTitle: string;
    resultType: 'book' | 'adaptation';
    position: number;
  }) => {
    posthog.capture('search_result_clicked', data);
  },

  // Track random comparison
  trackRandomComparison: () => {
    posthog.capture('random_comparison_clicked');
  },

  // ============================================================================
  // ENGAGEMENT EVENTS
  // ============================================================================

  // Track comment posted
  trackCommentPosted: (data: {
    diffId: string;
    isReply: boolean;
    depth: number;
  }) => {
    posthog.capture('comment_posted', data);
  },

  // Track report submitted
  trackReportSubmitted: (data: {
    contentType: 'diff' | 'comment';
    reason: string;
  }) => {
    posthog.capture('report_submitted', data);
  },

  // ============================================================================
  // NAVIGATION EVENTS
  // ============================================================================

  // Track browse filters
  trackBrowseFilter: (data: {
    filterType: 'genre' | 'rating' | 'sort';
    filterValue: string;
  }) => {
    posthog.capture('browse_filter_applied', data);
  },

  // Track external link clicks
  trackExternalLink: (data: {
    destination: string;
    source: string; // Which page/component
  }) => {
    posthog.capture('external_link_clicked', data);
  },
};

// Helper to identify user
export const identifyUser = (userId: string, userProps?: Record<string, any>) => {
  posthog.identify(userId, {
    ...userProps,
    $set: userProps,
  });
};

// Helper to reset user (on logout)
export const resetUser = () => {
  posthog.reset();
};
