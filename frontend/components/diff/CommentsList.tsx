'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Comment, SpoilerScope } from '@/lib/types';
import { api } from '@/lib/api';
import AddCommentForm from './AddCommentForm';
import { useAuth } from '@/lib/auth-context';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

interface CommentsListProps {
  diffItemId: number;
  userSpoilerScope: SpoilerScope;
  onCommentCountChange?: (count: number) => void;
}

// Helper to determine if a comment should be shown based on user's spoiler preference
function shouldShowComment(commentScope: SpoilerScope, userScope: SpoilerScope): boolean {
  const scopeHierarchy: Record<SpoilerScope, number> = {
    NONE: 0,
    BOOK_ONLY: 1,
    SCREEN_ONLY: 1,
    FULL: 2,
  };

  // Special handling: BOOK_ONLY and SCREEN_ONLY are separate branches
  if (userScope === 'BOOK_ONLY' && commentScope === 'SCREEN_ONLY') return false;
  if (userScope === 'SCREEN_ONLY' && commentScope === 'BOOK_ONLY') return false;

  return scopeHierarchy[commentScope] <= scopeHierarchy[userScope];
}

// Format timestamp as "X hours ago", "X days ago", etc.
function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return created.toLocaleDateString();
}

// Get badge color for spoiler scope
function getSpoilerBadgeColor(scope: SpoilerScope): string {
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
}

// Get label for spoiler scope
function getSpoilerLabel(scope: SpoilerScope): string {
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

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = comment.body.length > 300;
  const displayBody = shouldTruncate && !isExpanded
    ? comment.body.slice(0, 300) + '...'
    : comment.body;

  return (
    <div className="py-3 border-b border-border last:border-0">
      {/* Header with username and timestamp */}
      <div className="flex items-center gap-2 mb-2">
        <Link
          href={`/u/${comment.username}`}
          className="text-sm font-medium text-foreground hover:text-link hover:underline"
        >
          {comment.username}
        </Link>
        <span className="text-muted text-xs">•</span>
        <span className="text-muted text-xs">
          {formatTimestamp(comment.created_at)}
        </span>
        {/* Spoiler badge (only if not NONE) */}
        {comment.spoiler_scope !== 'NONE' && (
          <>
            <span className="text-muted text-xs">•</span>
            <span
              className={`px-2 py-0.5 text-xs font-mono rounded ${getSpoilerBadgeColor(
                comment.spoiler_scope
              )}`}
            >
              {getSpoilerLabel(comment.spoiler_scope)}
            </span>
          </>
        )}
      </div>

      {/* Comment body */}
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {displayBody}
      </p>

      {/* Expand/collapse button for long comments */}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-link hover:underline mt-1"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

export default function CommentsList({
  diffItemId,
  userSpoilerScope,
  onCommentCountChange,
}: CommentsListProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchComments = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.comments.list(diffItemId);
      const allComments = (response as { results: Comment[] }).results;

      // Sort by created_at (oldest first)
      const sortedComments = allComments.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setComments(sortedComments);
      // Notify parent of comment count change
      onCommentCountChange?.(sortedComments.length);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [diffItemId]);

  const handleAddCommentClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setShowAddForm(true);
  };

  const handleCommentAdded = () => {
    // Refresh comments list
    fetchComments();
    // Collapse the form
    setShowAddForm(false);
  };

  // Filter comments by user's spoiler scope
  const visibleComments = comments.filter((comment) =>
    shouldShowComment(comment.spoiler_scope, userSpoilerScope)
  );

  return (
    <div className="space-y-4">
      {/* Add comment section */}
      <div className="border-b border-border pb-4">
        {!showAddForm ? (
          <button
            onClick={handleAddCommentClick}
            className="text-link hover:underline text-sm font-medium"
          >
            + Add a comment
          </button>
        ) : (
          <div className="border border-border rounded-lg p-4 bg-surface">
            <AddCommentForm
              diffItemId={diffItemId}
              onCommentAdded={handleCommentAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
          <div className="py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <LoadingSkeleton width="w-24" height="h-4" />
              <LoadingSkeleton width="w-2" height="h-2" variant="circular" />
              <LoadingSkeleton width="w-20" height="h-3" />
            </div>
            <LoadingSkeleton width="w-full" height="h-16" />
          </div>
          <div className="py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <LoadingSkeleton width="w-28" height="h-4" />
              <LoadingSkeleton width="w-2" height="h-2" variant="circular" />
              <LoadingSkeleton width="w-24" height="h-3" />
            </div>
            <LoadingSkeleton width="w-full" height="h-12" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && visibleComments.length === 0 && (
        <div className="text-center py-6 text-sm text-muted">
          <p className="mb-1">No comments yet</p>
          <p className="text-xs">Be the first to share your thoughts!</p>
        </div>
      )}

      {/* Render comments */}
      {!loading && !error && visibleComments.length > 0 && (
        <div className="space-y-0">
          {visibleComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
