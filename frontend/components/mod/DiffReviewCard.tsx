'use client';

import Link from 'next/link';
import { ModerationDiff } from '@/lib/types';
import { api } from '@/lib/api';
import ModerationActions from './ModerationActions';

interface DiffReviewCardProps {
  diff: ModerationDiff;
  onActionComplete: () => void;
}

const categoryLabels: Record<string, string> = {
  PLOT: 'Plot',
  CHARACTER: 'Character',
  ENDING: 'Ending',
  SETTING: 'Setting',
  THEME: 'Theme',
  TONE: 'Tone',
  TIMELINE: 'Timeline',
  WORLDBUILDING: 'Worldbuilding',
  OTHER: 'Other',
};

const spoilerLabels: Record<string, string> = {
  NONE: 'None (safe/high-level)',
  BOOK_ONLY: 'Book Only',
  SCREEN_ONLY: 'Screen Only',
  FULL: 'Full (both)',
};

export default function DiffReviewCard({
  diff,
  onActionComplete,
}: DiffReviewCardProps): JSX.Element {
  const handleApprove = async (): Promise<void> => {
    await api.moderation.diffs.approve(diff.id);
    onActionComplete();
  };

  const handleReject = async (reason: string): Promise<void> => {
    await api.moderation.diffs.reject(diff.id, reason);
    onActionComplete();
  };

  const handleFlag = async (): Promise<void> => {
    await api.moderation.diffs.flag(diff.id);
    onActionComplete();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            diff.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {diff.status}
        </span>
      </div>

      {/* Work Context */}
      <div className="mb-4 text-sm text-gray-600">
        <Link
          href={`/book/${diff.work_slug}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {diff.work_title}
        </Link>
        {' → '}
        <Link
          href={`/screen/${diff.screen_work_slug}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {diff.screen_work_title}
        </Link>
      </div>

      {/* Diff Content */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {categoryLabels[diff.category] || diff.category}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
            Spoilers: {spoilerLabels[diff.spoiler_scope] || diff.spoiler_scope}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{diff.claim}</h3>
        {diff.detail && (
          <p className="text-gray-700 whitespace-pre-wrap">{diff.detail}</p>
        )}
      </div>

      {/* Vote Counts */}
      {diff.vote_counts && (
        <div className="mb-4 flex gap-4 text-sm">
          <span className="text-green-700">
            Accurate: {diff.vote_counts.accurate || 0}
          </span>
          <span className="text-yellow-700">
            Needs Nuance: {diff.vote_counts.needs_nuance || 0}
          </span>
          <span className="text-red-700">
            Disagree: {diff.vote_counts.disagree || 0}
          </span>
        </div>
      )}

      {/* Metadata */}
      <div className="mb-4 text-sm text-gray-600 border-t border-gray-200 pt-3">
        <div className="flex justify-between">
          <div>
            Created by{' '}
            <Link
              href={`/u/${diff.created_by_username}`}
              className="font-medium text-blue-600 hover:underline"
            >
              {diff.created_by_username}
            </Link>
          </div>
          <div>{formatDate(diff.created_at)}</div>
        </div>
      </div>

      {/* Moderation Actions */}
      <ModerationActions
        type="diff"
        onApprove={handleApprove}
        onReject={handleReject}
        onFlag={handleFlag}
      />
    </div>
  );
}
