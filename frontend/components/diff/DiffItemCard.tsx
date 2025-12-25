'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DiffItem, VoteType, SpoilerScope, Comment } from '@/lib/types';
import type { SpoilerPreference } from './SpoilerControl';
import { useVoting } from '@/hooks/useVoting';
import CommentsList from './CommentsList';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

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

  const handleVote = async (voteType: VoteType) => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setShowError(false);
    await submitVote(voteType);
  };

  // Show error when it appears from voting hook
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getVotePercentage = (count: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round((count / totalVotes) * 100);
  };

  const getSpoilerBadgeColor = (scope: string): string => {
    switch (scope) {
      case 'NONE':
        return 'bg-success/10 text-success border border-success/30';
      case 'BOOK_ONLY':
        return 'bg-cyan/10 text-cyan border border-cyan/30';
      case 'SCREEN_ONLY':
        return 'bg-purple/10 text-purple border border-purple/30';
      case 'FULL':
        return 'bg-magenta/10 text-magenta border border-magenta/30';
      default:
        return 'bg-surface border border-border';
    }
  };

  const getSpoilerLabel = (scope: string): string => {
    switch (scope) {
      case 'NONE':
        return 'Safe';
      case 'BOOK_ONLY':
        return 'Book Spoilers';
      case 'SCREEN_ONLY':
        return 'Screen Spoilers';
      case 'FULL':
        return 'Full Spoilers';
      default:
        return scope;
    }
  };

  const getCategoryBadgeColor = (category: string): string => {
    switch (category) {
      case 'PLOT':
        return 'bg-info/10 text-info border border-info/30';
      case 'CHARACTER':
        return 'bg-purple/10 text-purple border border-purple/30';
      case 'ENDING':
        return 'bg-danger/10 text-danger border border-danger/30';
      case 'SETTING':
        return 'bg-cyan/10 text-cyan border border-cyan/30';
      case 'THEME':
        return 'bg-magenta/10 text-magenta border border-magenta/30';
      case 'TONE':
        return 'bg-warn/10 text-warn border border-warn/30';
      case 'TIMELINE':
        return 'bg-success/10 text-success border border-success/30';
      case 'WORLDBUILDING':
        return 'bg-purple/10 text-purple border border-purple/30';
      default:
        return 'bg-muted/10 text-muted border border-muted/30';
    }
  };

  const getCategoryLabel = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ');
  };

  const getConsensusLabel = (): string => {
    if (totalVotes === 0) return 'No votes yet';

    const accuratePct = getVotePercentage(voteCounts.accurate);
    const disagreePct = getVotePercentage(voteCounts.disagree);
    const nuancePct = getVotePercentage(voteCounts.needs_nuance);

    if (accuratePct >= 70) {
      return `Consensus: ${accuratePct}% Accurate`;
    } else if (disagreePct >= 50) {
      return `Disputed: ${disagreePct}% Disagree`;
    } else if (nuancePct >= 40) {
      return `Debated: ${nuancePct}% Need Nuance`;
    } else {
      return `Mixed: ${accuratePct}% Accurate, ${disagreePct}% Disagree`;
    }
  };

  const getTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    return date.toLocaleDateString();
  };

  const hasDetail = diff.detail && diff.detail.trim().length > 0;

  return (
    <div id={`diff-${diff.id}`} className="border border-border rounded bg-surface hover:shadow-sm transition-all duration-200 overflow-hidden">
      {/* Compact header row - always visible */}
      <div className="p-3 sm:p-4">
        {/* Title row with claim - clickable header */}
        <button
          onClick={() => hasDetail && setDetailExpanded(!detailExpanded)}
          className={`flex items-start gap-2 mb-2 w-full text-left ${hasDetail ? 'cursor-pointer group' : 'cursor-default'}`}
          disabled={!hasDetail}
          aria-label={hasDetail ? (detailExpanded ? 'Collapse details' : 'Expand details') : undefined}
        >
          <h3 className="text-base font-semibold flex-1 text-foreground leading-tight">
            {diff.claim}
          </h3>
          {/* Chevron indicator */}
          {hasDetail && (
            <span className="text-muted group-hover:text-foreground transition-colors text-lg leading-none mt-0.5">
              {detailExpanded ? '▾' : '▸'}
            </span>
          )}
        </button>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryBadgeColor(diff.category)}`}
          >
            {getCategoryLabel(diff.category)}
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-mono rounded ${getSpoilerBadgeColor(diff.spoiler_scope)}`}
          >
            {getSpoilerLabel(diff.spoiler_scope)}
          </span>
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
                className="text-xs text-link hover:underline mt-1"
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

        {/* Voting buttons - compact horizontal layout */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Total votes indicator */}
          {totalVotes > 0 && (
            <div className="text-xs text-muted self-start sm:self-center whitespace-nowrap">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </div>
          )}
          {/* Error message */}
          {showError && error && (
            <div className="text-xs text-danger bg-danger/10 px-3 py-2 rounded border border-danger/30">
              {error}
            </div>
          )}

          {!showError && (
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => handleVote('ACCURATE')}
                disabled={isVoting}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded border transition-all duration-200 flex-1 sm:flex-none ${
                  userVote === 'ACCURATE'
                    ? 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-500 font-medium'
                    : 'bg-surface border-border text-foreground hover:border-green-500 hover:bg-green-500/5'
                } ${isVoting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                title="This diff is accurate - well-stated and correct"
                aria-label="Vote accurate"
              >
                <span className="text-sm leading-none">↑</span>
                <span className="text-xs font-medium">Accurate</span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-500">
                  {voteCounts.accurate}
                </span>
              </button>

              <button
                onClick={() => handleVote('NEEDS_NUANCE')}
                disabled={isVoting}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded border transition-all duration-200 flex-1 sm:flex-none ${
                  userVote === 'NEEDS_NUANCE'
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600 font-medium'
                    : 'bg-surface border-border text-foreground hover:border-yellow-500 hover:bg-yellow-500/5'
                } ${isVoting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                title="Mostly correct but needs more context or clarification"
                aria-label="Vote needs nuance"
              >
                <span className="text-sm leading-none">~</span>
                <span className="text-xs font-medium">Nuance</span>
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-500">
                  {voteCounts.needs_nuance}
                </span>
              </button>

              <button
                onClick={() => handleVote('DISAGREE')}
                disabled={isVoting}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded border transition-all duration-200 flex-1 sm:flex-none ${
                  userVote === 'DISAGREE'
                    ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-500 font-medium'
                    : 'bg-surface border-border text-foreground hover:border-red-500 hover:bg-red-500/5'
                } ${isVoting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                title="This diff is inaccurate or misleading"
                aria-label="Vote disagree"
              >
                <span className="text-sm leading-none">↓</span>
                <span className="text-xs font-medium">Disagree</span>
                <span className="text-xs font-semibold text-red-600 dark:text-red-500">
                  {voteCounts.disagree}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Meta row - moved to bottom for quieter hierarchy */}
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>
            Added by{' '}
            <Link
              href={`/u/${diff.created_by_username}`}
              className="text-link hover:underline font-medium"
            >
              @{diff.created_by_username}
            </Link>
          </span>
          <span className="text-muted/50">·</span>
          <span>{getTimeSince(diff.created_at)}</span>
          {!loadingCommentCount && commentCount > 0 && (
            <>
              <span className="text-muted/50">·</span>
              <button
                onClick={() => setCommentsExpanded(!commentsExpanded)}
                className="text-link hover:underline"
              >
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </button>
            </>
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
          />
        </div>
      )}

      {/* Comments toggle when count is 0 or not expanded */}
      {!loadingCommentCount && commentCount === 0 && !commentsExpanded && (
        <div className="border-t border-border">
          <button
            onClick={() => setCommentsExpanded(true)}
            className="text-xs text-link hover:text-linkHover transition-colors w-full py-2 px-3 sm:px-4 text-left font-medium"
          >
            No comments yet — Add comment
          </button>
        </div>
      )}
    </div>
  );
}
