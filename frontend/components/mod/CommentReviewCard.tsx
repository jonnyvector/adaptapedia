'use client';

import Link from 'next/link';
import { ModerationComment } from '@/lib/types';
import { api } from '@/lib/api';
import ModerationActions from './ModerationActions';
import { Card } from '@/components/ui/Card';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

interface CommentReviewCardProps {
  comment: ModerationComment;
  onActionComplete: () => void;
}

const spoilerLabels: Record<string, string> = {
  NONE: 'None (safe/high-level)',
  BOOK_ONLY: 'Book Only',
  SCREEN_ONLY: 'Screen Only',
  FULL: 'Full (both)',
};

export default function CommentReviewCard({
  comment,
  onActionComplete,
}: CommentReviewCardProps): JSX.Element {
  const handleApprove = async (): Promise<void> => {
    await api.moderation.comments.approve(comment.id);
    onActionComplete();
  };

  const handleHide = async (): Promise<void> => {
    await api.moderation.comments.hide(comment.id);
    onActionComplete();
  };

  const handleDelete = async (): Promise<void> => {
    await api.moderation.comments.delete(comment.id);
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
    <Card variant="subtle" padding="lg" rounded>
      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 ${RADIUS.control} border ${BORDERS.solid} ${TEXT.metadata} font-bold ${monoUppercase} ${
            comment.status === 'PENDING'
              ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-600 dark:border-amber-400'
              : 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border-blue-600 dark:border-blue-400'
          }`}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
        >
          {comment.status}
        </span>
      </div>

      {/* Comment Context */}
      <div className={`mb-4 p-3 bg-stone-50 dark:bg-stone-950 ${RADIUS.control} border ${BORDERS.medium}`}>
        <div className={`${TEXT.metadata} ${TEXT.mutedMedium} mb-1 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Comment on diff:</div>
        <div className={`${TEXT.secondary} font-bold mb-2 text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>{comment.diff_item_claim}</div>
        <div className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          <Link
            href={`/compare/${comment.work_slug}/${comment.screen_work_slug}`}
            className="text-black dark:text-white hover:opacity-70"
          >
            {comment.work_title} → {comment.screen_work_title}
          </Link>
        </div>
      </div>

      {/* Comment Content */}
      <div className="mb-4">
        <div className="mb-2">
          <span className={`px-2 py-1 bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-400 border ${BORDERS.solid} border-purple-600 dark:border-purple-400 ${TEXT.metadata} font-bold ${RADIUS.control} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Spoilers: {spoilerLabels[comment.spoiler_scope] || comment.spoiler_scope}
          </span>
        </div>
        <div className={`p-4 bg-stone-50 dark:bg-stone-950 ${RADIUS.control} border ${BORDERS.medium}`}>
          <p className={`${TEXT.secondary} text-black dark:text-white whitespace-pre-wrap`} style={{ fontFamily: FONTS.mono }}>{comment.body}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className={`mb-4 ${TEXT.secondary} ${TEXT.mutedMedium} border-t ${BORDERS.subtle} pt-3`} style={{ fontFamily: FONTS.mono }}>
        <div className="flex justify-between">
          <div>
            Created by{' '}
            <Link
              href={`/u/${comment.username}`}
              className="font-bold text-black dark:text-white hover:opacity-70"
            >
              {comment.username}
            </Link>
          </div>
          <div>{formatDate(comment.created_at)}</div>
        </div>
      </div>

      {/* Moderation Actions */}
      <ModerationActions
        type="comment"
        onApprove={handleApprove}
        onHide={handleHide}
        onDelete={handleDelete}
      />
    </Card>
  );
}
