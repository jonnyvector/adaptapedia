'use client';

import Link from 'next/link';
import { ModerationDiff } from '@/lib/types';
import { api } from '@/lib/api';
import ModerationActions from './ModerationActions';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

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
    <div className={`border ${BORDERS.medium} ${RADIUS.control} p-6 bg-stone-50 dark:bg-stone-950`}>
      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 ${RADIUS.control} border ${BORDERS.solid} ${TEXT.metadata} font-bold ${monoUppercase} ${
            diff.status === 'PENDING'
              ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-600 dark:border-amber-400'
              : 'bg-orange-100 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400 border-orange-600 dark:border-orange-400'
          }`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
        >
          {diff.status}
        </span>
      </div>

      {/* Work Context */}
      <div className={`mb-4 ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
        <Link
          href={`/book/${diff.work_slug}`}
          className="font-bold text-black dark:text-white hover:opacity-70"
        >
          {diff.work_title}
        </Link>
        {' → '}
        <Link
          href={`/screen/${diff.screen_work_slug}`}
          className="font-bold text-black dark:text-white hover:opacity-70"
        >
          {diff.screen_work_title}
        </Link>
      </div>

      {/* Diff Content */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border ${BORDERS.solid} border-blue-600 dark:border-blue-400 ${TEXT.metadata} font-bold ${RADIUS.control} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            {categoryLabels[diff.category] || diff.category}
          </span>
          <span className={`px-2 py-1 bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-400 border ${BORDERS.solid} border-purple-600 dark:border-purple-400 ${TEXT.metadata} font-bold ${RADIUS.control} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Spoilers: {spoilerLabels[diff.spoiler_scope] || diff.spoiler_scope}
          </span>
        </div>
        <h3 className={`${TEXT.body} font-bold mb-2 text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>{diff.claim}</h3>
        {diff.detail && (
          <p className={`${TEXT.secondary} text-black dark:text-white whitespace-pre-wrap`} style={{ fontFamily: FONTS.mono }}>{diff.detail}</p>
        )}
      </div>

      {/* Vote Counts */}
      {diff.vote_counts && (
        <div className={`mb-4 flex gap-4 ${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>
          <span className="text-green-700 dark:text-green-400">
            Accurate: {diff.vote_counts.accurate || 0}
          </span>
          <span className="text-amber-700 dark:text-amber-400">
            Needs Nuance: {diff.vote_counts.needs_nuance || 0}
          </span>
          <span className="text-red-700 dark:text-red-400">
            Disagree: {diff.vote_counts.disagree || 0}
          </span>
        </div>
      )}

      {/* Metadata */}
      <div className={`mb-4 ${TEXT.secondary} ${TEXT.mutedMedium} border-t ${BORDERS.subtle} pt-3`} style={{ fontFamily: FONTS.mono }}>
        <div className="flex justify-between">
          <div>
            Created by{' '}
            <Link
              href={`/u/${diff.created_by_username}`}
              className="font-bold text-black dark:text-white hover:opacity-70"
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
