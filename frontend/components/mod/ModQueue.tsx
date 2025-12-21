'use client';

import { useState, useEffect } from 'react';
import { ModerationDiff, ModerationComment, ApiResponse } from '@/lib/types';
import { api } from '@/lib/api';
import DiffReviewCard from './DiffReviewCard';
import CommentReviewCard from './CommentReviewCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SkeletonCard from '@/components/ui/SkeletonCard';

type TabType = 'pending-diffs' | 'pending-comments' | 'flagged';
type StatusFilter = 'PENDING' | 'FLAGGED' | 'ALL';

export default function ModQueue(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('pending-diffs');
  const [diffs, setDiffs] = useState<ModerationDiff[]>([]);
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');

  useEffect(() => {
    loadItems();
  }, [activeTab, statusFilter]);

  const loadItems = async (): Promise<void> => {
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
  };

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Moderation Queue</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Review and moderate pending content submissions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300 mb-4 sm:mb-6 overflow-x-auto">
        <div className="flex gap-2 sm:gap-4 min-w-max sm:min-w-0">
          <button
            onClick={() => setActiveTab('pending-diffs')}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base min-h-[44px] ${
              activeTab === 'pending-diffs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Diffs
            {activeTab === 'pending-diffs' && counts.diffs > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {counts.diffs}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pending-comments')}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base min-h-[44px] ${
              activeTab === 'pending-comments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Comments
            {activeTab === 'pending-comments' && counts.comments > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {counts.comments}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base min-h-[44px] ${
              activeTab === 'flagged'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Flagged Items
          </button>
        </div>
      </div>

      {/* Filter */}
      {activeTab !== 'flagged' && (
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-3 text-base border border-gray-300 rounded-lg bg-white min-h-[44px]"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium text-sm sm:text-base">Error loading items</p>
          <p className="text-xs sm:text-sm mt-1">{error}</p>
          <button
            onClick={loadItems}
            className="mt-3 px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors min-h-[44px] text-sm sm:text-base"
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
                <div className="text-center py-8 sm:py-12 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-600 text-base sm:text-lg">
                    No {activeTab === 'flagged' ? 'flagged' : 'pending'} diffs to
                    review
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">
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
                <div className="text-center py-8 sm:py-12 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-600 text-base sm:text-lg">
                    No pending comments to review
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">
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
