import Link from 'next/link';
import type { Comment } from '@/lib/types';

interface UserCommentsListProps {
  comments: Comment[];
}

function getSpoilerBadgeColor(scope: string): string {
  switch (scope) {
    case 'NONE':
      return 'bg-green-100 text-green-800';
    case 'BOOK_ONLY':
      return 'bg-blue-100 text-blue-800';
    case 'SCREEN_ONLY':
      return 'bg-purple-100 text-purple-800';
    case 'FULL':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getSpoilerLabel(scope: string): string {
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
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default function UserCommentsList({
  comments,
}: UserCommentsListProps): JSX.Element {
  if (comments.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted text-lg">No comments posted yet</p>
        <p className="text-muted text-sm mt-2">
          Join the discussion on diffs to share your insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border border-border rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
        >
          {/* Context - which diff this comment is on */}
          <div className="mb-3 pb-3 border-b border-border">
            <div className="text-xs text-muted mb-1">Comment on</div>
            <Link
              href={`/compare/${comment.work_slug}/${comment.screen_work_slug}`}
              className="text-sm font-medium text-link hover:underline"
            >
              {comment.work_title} vs {comment.screen_work_title}
            </Link>
            <div className="text-sm text-muted mt-1">
              Diff: {comment.diff_item_claim}
            </div>
          </div>

          {/* Comment body */}
          <div className="mb-3">
            <p className="text-sm leading-relaxed">{comment.body}</p>
          </div>

          {/* Footer with spoiler badge and timestamp */}
          <div className="flex items-center justify-between text-sm">
            <span
              className={`px-2 py-1 text-xs font-mono rounded ${getSpoilerBadgeColor(
                comment.spoiler_scope
              )}`}
            >
              {getSpoilerLabel(comment.spoiler_scope)}
            </span>
            <span className="text-muted">{formatDate(comment.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
