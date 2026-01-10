'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModerationDiff, ModerationComment, ApiResponse } from '@/lib/types';
import { api } from '@/lib/api';
import DiffReviewCard from './DiffReviewCard';
import CommentReviewCard from './CommentReviewCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, HEIGHT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

type TabType = 'pending-diffs' | 'pending-comments' | 'flagged';
type StatusFilter = 'PENDING' | 'FLAGGED' | 'ALL';

export default function ModQueue(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('pending-diffs');
  const [diffs, setDiffs] = useState<ModerationDiff[]>([]);
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');

  const loadItems = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'pending-diffs' || activeTab === 'flagged') {
        const params: Record<string, string> = {};
        if (activeTab === 'flagged') {
          params.status = 'FLAGGED';
        } else if (statusFilter !== 'ALL') {
          params.status = statusFilter;
        }
        const response = await api.moderation.diffs.list(params);
        const data = response as ApiResponse<ModerationDiff>;
        setDiffs(data.results || []);
      } else if (activeTab === 'pending-comments') {
        const params: Record<string, string> = {};
        if (statusFilter !== 'ALL') {
          params.status = statusFilter;
        }
        const response = await api.moderation.comments.list(params);
        const data = response as ApiResponse<ModerationComment>;
        setComments(data.results || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleActionComplete = (): void => {
    loadItems();
  };

  const getPendingCounts = (): { diffs: number; comments: number } => {
    return {
      diffs: activeTab === 'pending-diffs' ? diffs.length : 0,
      comments: activeTab === 'pending-comments' ? comments.length : 0,
    };
  };

  const counts = getPendingCounts();

  return (
    <div className="container">
      <div className="mb-4 sm:mb-6">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>Moderation Queue</h1>
        <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          Review and moderate pending content submissions
        </p>
      </div>

      {/* Tabs */}
      <div className={`border-b ${BORDERS.medium} mb-4 sm:mb-6 overflow-x-auto`}>
        <div className="flex gap-2 sm:gap-4 min-w-max sm:min-w-0">
          <button
            onClick={() => setActiveTab('pending-diffs')}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${TEXT.secondary} ${HEIGHT.touchTarget} ${monoUppercase} ${
              activeTab === 'pending-diffs'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-black/50 dark:text-white/50 hover:text-black hover:dark:text-white'
            }`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Pending Diffs
            {activeTab === 'pending-diffs' && counts.diffs > 0 && (
              <span className={`ml-2 px-2 py-1 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} ${TEXT.metadata} font-bold border ${BORDERS.solid}`} style={{ fontFamily: FONTS.mono }}>
                {counts.diffs}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pending-comments')}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${TEXT.secondary} ${HEIGHT.touchTarget} ${monoUppercase} ${
              activeTab === 'pending-comments'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-black/50 dark:text-white/50 hover:text-black hover:dark:text-white'
            }`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Pending Comments
            {activeTab === 'pending-comments' && counts.comments > 0 && (
              <span className={`ml-2 px-2 py-1 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} ${TEXT.metadata} font-bold border ${BORDERS.solid}`} style={{ fontFamily: FONTS.mono }}>
                {counts.comments}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${TEXT.secondary} ${HEIGHT.touchTarget} ${monoUppercase} ${
              activeTab === 'flagged'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-black/50 dark:text-white/50 hover:text-black hover:dark:text-white'
            }`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Flagged Items
          </button>
        </div>
      </div>

      {/* Filter */}
      {activeTab !== 'flagged' && (
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={`${TEXT.secondary} font-bold ${TEXT.mutedMedium} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={`px-3 py-3 ${TEXT.secondary} border ${BORDERS.medium} ${RADIUS.input} bg-white dark:bg-black text-black dark:text-white ${HEIGHT.touchTarget} focus:outline-none focus:border-black focus:dark:border-white`}
            style={{ fontFamily: FONTS.mono }}
          >
            <option value="PENDING">Pending</option>
            <option value="FLAGGED">Flagged</option>
            <option value="ALL">All</option>
          </select>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6" aria-live="polite" aria-busy="true">
          <SkeletonCard variant="detailed" />
          <SkeletonCard variant="detailed" />
          <SkeletonCard variant="detailed" />
        </div>
      ) : error ? (
        <div className={`bg-red-50 dark:bg-red-950/20 border ${BORDERS.medium} border-red-600 dark:border-red-400 ${RADIUS.control} p-4 text-red-800 dark:text-red-400`}>
          <p className={`font-bold ${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>Error loading items</p>
          <p className={`${TEXT.metadata} mt-1`} style={{ fontFamily: FONTS.mono }}>{error}</p>
          <button
            onClick={loadItems}
            className={`mt-3 px-4 py-3 bg-red-600 dark:bg-red-700 text-white ${RADIUS.control} border ${BORDERS.solid} hover:opacity-90 transition-opacity ${HEIGHT.touchTarget} ${TEXT.secondary} font-bold ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Diff Items */}
          {(activeTab === 'pending-diffs' || activeTab === 'flagged') && (
            <div className="space-y-4 sm:space-y-6">
              {diffs.length === 0 ? (
                <div className={`text-center py-8 sm:py-12 border ${BORDERS.medium} ${RADIUS.control} bg-stone-50 dark:bg-stone-950`}>
                  <p className={`${TEXT.body} font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                    No {activeTab === 'flagged' ? 'flagged' : 'pending'} diffs to
                    review
                  </p>
                  <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-2`} style={{ fontFamily: FONTS.mono }}>
                    The queue is empty. Great work!
                  </p>
                </div>
              ) : (
                diffs.map((diff) => (
                  <DiffReviewCard
                    key={diff.id}
                    diff={diff}
                    onActionComplete={handleActionComplete}
                  />
                ))
              )}
            </div>
          )}

          {/* Comment Items */}
          {activeTab === 'pending-comments' && (
            <div className="space-y-4 sm:space-y-6">
              {comments.length === 0 ? (
                <div className={`text-center py-8 sm:py-12 border ${BORDERS.medium} ${RADIUS.control} bg-stone-50 dark:bg-stone-950`}>
                  <p className={`${TEXT.body} font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                    No pending comments to review
                  </p>
                  <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-2`} style={{ fontFamily: FONTS.mono }}>
                    The queue is empty. Great work!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <CommentReviewCard
                    key={comment.id}
                    comment={comment}
                    onActionComplete={handleActionComplete}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
