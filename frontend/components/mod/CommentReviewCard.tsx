'use client';

import Link from 'next/link';
import { ModerationComment } from '@/lib/types';
import { api } from '@/lib/api';
import ModerationActions from './ModerationActions';

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
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            comment.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {comment.status}
        </span>
      </div>

      {/* Comment Context */}
      <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
        <div className="text-xs text-gray-600 mb-1">Comment on diff:</div>
        <div className="text-sm font-medium mb-2">{comment.diff_item_claim}</div>
        <div className="text-xs text-gray-600">
          <Link
            href={`/compare/${comment.work_slug}/${comment.screen_work_slug}`}
            className="text-blue-600 hover:underline"
          >
            {comment.work_title} → {comment.screen_work_title}
          </Link>
        </div>
      </div>

      {/* Comment Content */}
      <div className="mb-4">
        <div className="mb-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
            Spoilers: {spoilerLabels[comment.spoiler_scope] || comment.spoiler_scope}
          </span>
        </div>
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">{comment.body}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-4 text-sm text-gray-600 border-t border-gray-200 pt-3">
        <div className="flex justify-between">
          <div>
            Created by{' '}
            <Link
              href={`/u/${comment.username}`}
              className="font-medium text-blue-600 hover:underline"
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
    </div>
  );
}
