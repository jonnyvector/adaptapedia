'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { DiffItem, VoteType, SpoilerScope, Comment } from '@/lib/types';
import type { SpoilerPreference } from './SpoilerControl';
import { useVoting } from '@/hooks/useVoting';
import CommentsList from './CommentsList';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { calculateVotePercentage, getConsensusLabel } from '@/lib/vote-utils';
import { getTimeSince } from '@/lib/date-utils';
import { getSpoilerBadgeColor, getSpoilerLabel, getCategoryBadgeColor, getCategoryLabel } from '@/lib/badge-utils';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface DiffItemCardProps {
  diff: DiffItem;
  userSpoilerScope?: SpoilerScope;
  defaultExpanded?: boolean;
  onSpoilerPreferenceChange?: (pref: SpoilerPreference) => void;
  currentSpoilerPreference?: SpoilerPreference;
  commentsExpanded?: boolean;
  onCommentsExpandedChange?: (expanded: boolean) => void;
}

export default function DiffItemCard({
  diff,
  userSpoilerScope = 'NONE',
  defaultExpanded = false,
  onSpoilerPreferenceChange,
  currentSpoilerPreference,
  commentsExpanded: externalCommentsExpanded,
  onCommentsExpandedChange
}: DiffItemCardProps): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { voteCounts, userVote, isVoting, error, submitVote } = useVoting(
    diff.id,
    diff.vote_counts,
    diff.user_vote || null
  );
  const [showError, setShowError] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(defaultExpanded);
  const [localCommentsExpanded, setLocalCommentsExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [loadingCommentCount, setLoadingCommentCount] = useState(true);
  const [isTextClamped, setIsTextClamped] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [autoOpenCommentForm, setAutoOpenCommentForm] = useState(false);
  const detailRef = useRef<HTMLParagraphElement>(null);

  // Use external state if provided, otherwise use local state
  const commentsExpanded = externalCommentsExpanded ?? localCommentsExpanded;
  const setCommentsExpanded = (expanded: boolean) => {
    if (onCommentsExpandedChange) {
      onCommentsExpandedChange(expanded);
    } else {
      setLocalCommentsExpanded(expanded);
    }
  };

  // Check if text is actually clamped
  useEffect(() => {
    if (detailRef.current && !detailExpanded) {
      const isClamped = detailRef.current.scrollHeight > detailRef.current.clientHeight;
      setIsTextClamped(isClamped);
    }
  }, [diff.detail, detailExpanded]);

  const totalVotes =
    voteCounts.accurate +
    voteCounts.needs_nuance +
    voteCounts.disagree;

  // Auto-expand comments if there's a pending action
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingReply = sessionStorage.getItem('pendingReply');
      const pendingAddComment = sessionStorage.getItem('pendingAddComment');

      if (pendingReply || pendingAddComment) {
        setCommentsExpanded(true);
      }
    }
  }, []);

  // Auto-vote after login if pending
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated && !isVoting) {
      const pendingVote = sessionStorage.getItem(`pendingVote_${diff.id}`);

      if (pendingVote) {
        sessionStorage.removeItem(`pendingVote_${diff.id}`);
        submitVote(pendingVote as VoteType);
      }
    }
  }, [isAuthenticated, isVoting, diff.id, submitVote]);

  // Fetch comment count on mount
  useEffect(() => {
    const fetchCommentCount = async (): Promise<void> => {
      try {
        const response = await api.comments.list(diff.id);
        const comments = (response as { results: Comment[] }).results;
        setCommentCount(comments.length);
      } catch (err) {
        console.error('Failed to fetch comment count:', err);
      } finally {
        setLoadingCommentCount(false);
      }
    };

    fetchCommentCount();
  }, [diff.id]);

  const handleVote = useCallback(async (voteType: VoteType) => {
    if (!isAuthenticated) {
      // Store the vote intent in sessionStorage
      sessionStorage.setItem(`pendingVote_${diff.id}`, voteType);
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setShowError(false);
    await submitVote(voteType);
  }, [isAuthenticated, diff.id, router, submitVote]);

  // Show error when it appears from voting hook
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getVotePercentage = (count: number): number => {
    return calculateVotePercentage(count, totalVotes);
  };

  const consensusLabel = getConsensusLabel(
    voteCounts.accurate,
    voteCounts.disagree,
    voteCounts.needs_nuance,
    totalVotes
  );

  const hasDetail = diff.detail && diff.detail.trim().length > 0;

  return (
    <div id={`diff-${diff.id}`} className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 hover:border-black hover:dark:border-white transition-all overflow-hidden`}>
      {/* Compact header row - always visible */}
      <div className="p-3 sm:p-4">
        {/* Badges row - smaller, tag-like */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`px-2 py-0.5 ${TEXT.metadata} font-bold border ${BORDERS.subtle} bg-white dark:bg-black text-black dark:text-white ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
          >
            {getCategoryLabel(diff.category)}
          </span>
          {/* Only show spoiler badge if NOT safe */}
          {diff.spoiler_scope !== 'NONE' && (
            <span
              className={`px-2 py-0.5 ${TEXT.metadata} font-bold border ${BORDERS.subtle} bg-white dark:bg-black ${TEXT.mutedStrong} ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            >
              {getSpoilerLabel(diff.spoiler_scope)}
            </span>
          )}
        </div>

        {/* Title row with claim */}
        <div className="mb-2">
          <h3 className="text-base font-bold text-black dark:text-white leading-tight" style={{ fontFamily: FONTS.mono }}>
            {diff.claim}
          </h3>
        </div>

        {/* Detail preview/full (when not expanded, show 2 lines max) */}
        {hasDetail && !detailExpanded && (
          <div className="mb-3">
            <p ref={detailRef} className="text-sm text-muted leading-relaxed line-clamp-2">
              {diff.detail}
            </p>
            {isTextClamped && (
              <button
                onClick={() => setDetailExpanded(true)}
                className={`${TEXT.metadata} ${TEXT.primary} hover:underline mt-1 font-bold uppercase tracking-wider`}
                style={{ fontFamily: FONTS.mono }}
              >
                Read more
              </button>
            )}
          </div>
        )}

        {/* Detail full (when expanded) */}
        {hasDetail && detailExpanded && (
          <div className="mb-3">
            <p className="text-sm text-muted leading-relaxed">
              {diff.detail}
            </p>
          </div>
        )}

        {/* Image display */}
        {diff.image && (
          <div className="mb-3">
            <Image
              src={diff.image}
              alt="Difference illustration"
              width={800}
              height={400}
              className="max-w-full rounded-md border border-border cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: '400px' }}
              onClick={() => setLightboxOpen(true)}
            />
          </div>
        )}

        {/* Consensus bar - show vote distribution */}
        {totalVotes > 0 && (
          <div className="mb-2.5 max-w-xl">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-medium text-muted">Consensus:</span>
              <span className="text-xs font-semibold text-foreground">
                {consensusLabel}
              </span>
              <span className="text-xs text-muted">
                ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
              </span>
              {(consensusLabel === 'Mixed' || consensusLabel === 'Disputed') && (
                <button
                  onClick={() => {
                    setCommentsExpanded(true);
                    if (commentCount === 0) {
                      setAutoOpenCommentForm(true);
                    }
                  }}
                  className="px-1.5 py-0.5 text-xs font-medium rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                  title={commentCount > 0 ? "High disagreement — view discussion" : "High disagreement — be first to comment"}
                >
                  {commentCount > 0 ? 'Needs discussion' : 'Needs discussion — be first'}
                </button>
              )}
            </div>
            {/* Compact stacked bar */}
            <div className="h-1.5 bg-black/10 dark:bg-white/10 overflow-hidden flex border border-black/20 dark:border-white/20">
              {voteCounts.accurate > 0 && (
                <div
                  className="bg-black dark:bg-white"
                  style={{ width: `${getVotePercentage(voteCounts.accurate)}%` }}
                  title={`${voteCounts.accurate} Accurate (${getVotePercentage(voteCounts.accurate)}%)`}
                />
              )}
              {voteCounts.needs_nuance > 0 && (
                <div
                  className="bg-black/50 dark:bg-white/50"
                  style={{ width: `${getVotePercentage(voteCounts.needs_nuance)}%` }}
                  title={`${voteCounts.needs_nuance} Needs Nuance (${getVotePercentage(voteCounts.needs_nuance)}%)`}
                />
              )}
              {voteCounts.disagree > 0 && (
                <div
                  className="bg-black/20 dark:bg-white/20"
                  style={{ width: `${getVotePercentage(voteCounts.disagree)}%` }}
                  title={`${voteCounts.disagree} Disagree (${getVotePercentage(voteCounts.disagree)}%)`}
                />
              )}
            </div>
          </div>
        )}

        {/* Voting buttons - segmented control */}
        {showError && error && (
          <div className="text-xs text-danger bg-danger/10 px-3 py-1.5 rounded border border-danger/30 mb-3">
            {error}
          </div>
        )}

        {!showError && (
          <div
            className="inline-flex items-stretch gap-2 rounded-md overflow-hidden"
            role="group"
            aria-label="Vote on this difference"
            title="Choose one: Accurate / Nuance / Disagree"
          >
            <button
              onClick={() => handleVote('ACCURATE')}
              disabled={isVoting}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 ${TEXT.metadata} font-bold border rounded-md transition-all ${
                userVote === 'ACCURATE'
                  ? `bg-black dark:bg-white ${BORDERS.solid} text-white dark:text-black`
                  : `bg-white dark:bg-black ${BORDERS.medium} ${TEXT.mutedStrong} hover:${BORDERS.solid}`
              } ${isVoting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
              title="This diff is accurate - well-stated and correct"
              aria-label="Vote accurate"
              aria-pressed={userVote === 'ACCURATE'}
            >
              <span className="leading-none">↑</span>
              <span className="uppercase">Accurate</span>
              <span>({voteCounts.accurate})</span>
            </button>

            <button
              onClick={() => handleVote('NEEDS_NUANCE')}
              disabled={isVoting}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 ${TEXT.metadata} font-bold border rounded-md transition-all ${
                userVote === 'NEEDS_NUANCE'
                  ? `bg-black dark:bg-white ${BORDERS.solid} text-white dark:text-black`
                  : `bg-white dark:bg-black ${BORDERS.medium} ${TEXT.mutedStrong} hover:${BORDERS.solid}`
              } ${isVoting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
              title="Mostly correct but needs more context or clarification"
              aria-label="Vote needs nuance"
              aria-pressed={userVote === 'NEEDS_NUANCE'}
            >
              <span className="leading-none">~</span>
              <span className="uppercase">Nuance</span>
              <span>({voteCounts.needs_nuance})</span>
            </button>

            <button
              onClick={() => handleVote('DISAGREE')}
              disabled={isVoting}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 ${TEXT.metadata} font-bold border rounded-md transition-all ${
                userVote === 'DISAGREE'
                  ? `bg-black dark:bg-white ${BORDERS.solid} text-white dark:text-black`
                  : `bg-white dark:bg-black ${BORDERS.medium} ${TEXT.mutedStrong} hover:${BORDERS.solid}`
              } ${isVoting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
              title="This diff is inaccurate or misleading"
              aria-label="Vote disagree"
              aria-pressed={userVote === 'DISAGREE'}
            >
              <span className="leading-none">↓</span>
              <span className="uppercase">Disagree</span>
              <span>({voteCounts.disagree})</span>
            </button>
          </div>
        )}

        {/* Meta row - moved to bottom for quieter hierarchy */}
        <div className="mt-4 pt-3 border-t border-border/[0.02] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
            <span style={{ fontFamily: FONTS.mono }}>
              Added by{' '}
              <Link
                href={`/u/${diff.created_by_username}`}
                className={`${TEXT.primary} hover:underline font-bold`}
                style={{ fontFamily: FONTS.mono }}
              >
                @{diff.created_by_username}
              </Link>
            </span>
            <span className="text-muted/50">·</span>
            <span>{getTimeSince(diff.created_at)}</span>
          </div>
          {/* Comment CTA - styled as button with icon */}
          {!loadingCommentCount && (
            <button
              onClick={() => {
                if (!commentsExpanded) {
                  // Check authentication only when trying to add a comment (no existing comments)
                  if (commentCount === 0 && !isAuthenticated) {
                    sessionStorage.setItem('pendingAddComment', 'true');
                    router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
                    return;
                  }
                  // Open comments and auto-open the form if no comments exist
                  setCommentsExpanded(true);
                  if (commentCount === 0) {
                    setAutoOpenCommentForm(true);
                  }
                } else {
                  // If comments already open, toggle them closed
                  setCommentsExpanded(false);
                  setAutoOpenCommentForm(false);
                }
              }}
              className={`flex items-center gap-1.5 ${TEXT.primary} hover:underline font-bold transition-colors`}
              style={{ fontFamily: FONTS.mono }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>
                {commentCount > 0
                  ? `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`
                  : 'Add comment'
              }
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Comments section - collapsible */}
      {commentsExpanded && (
        <div className="border-t border-border bg-surface2 p-3 sm:p-4">
          <CommentsList
            diffItemId={diff.id}
            userSpoilerScope={userSpoilerScope}
            onCommentCountChange={(count) => setCommentCount(count)}
            onSpoilerPreferenceChange={onSpoilerPreferenceChange}
            currentSpoilerPreference={currentSpoilerPreference}
            autoOpenForm={autoOpenCommentForm}
          />
        </div>
      )}


      {/* Image Lightbox Modal */}
      {lightboxOpen && diff.image && (
        <ImageLightbox
          src={diff.image}
          alt="Difference illustration"
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
