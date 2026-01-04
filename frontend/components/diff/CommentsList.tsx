'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Comment, SpoilerScope } from '@/lib/types';
import type { SpoilerPreference } from './SpoilerControl';
import { api } from '@/lib/api';
import AddCommentForm from './AddCommentForm';
import { useAuth } from '@/lib/auth-context';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import UserBadge from '@/components/user/UserBadge';
import { getSpoilerBadgeColor, getSpoilerLabel } from '@/lib/badge-utils';
import { getTimeSince } from '@/lib/date-utils';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface CommentsListProps {
  diffItemId: number;
  userSpoilerScope: SpoilerScope;
  onCommentCountChange?: (count: number) => void;
  onSpoilerPreferenceChange?: (pref: SpoilerPreference) => void;
  currentSpoilerPreference?: SpoilerPreference;
  autoOpenForm?: boolean;
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

// Avatar colors for different nesting levels
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-cyan-500',
];

interface CommentNode extends Comment {
  children: CommentNode[];
}

interface CommentItemProps {
  comment: CommentNode;
  depth?: number;
  isLast?: boolean;
}

interface CommentItemInternalProps extends CommentItemProps {
  onReplyAdded: () => void;
}

function CommentItem({ comment, depth = 0, isLast = false, onReplyAdded }: CommentItemInternalProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const shouldTruncate = comment.body.length > 300;
  const displayBody = shouldTruncate && !isExpanded
    ? comment.body.slice(0, 300) + '...'
    : comment.body;

  const avatarColor = depth > 0 ? AVATAR_COLORS[(depth - 1) % AVATAR_COLORS.length] : 'bg-blue-500';
  const hasReplies = comment.children && comment.children.length > 0;

  // Handle pending reply after login - only open form if authenticated
  useEffect(() => {
    if (isLoading) {
      return; // Wait for auth to finish loading
    }

    const pendingReplyId = sessionStorage.getItem('pendingReply');

    if (pendingReplyId === comment.id.toString() && isAuthenticated) {
      setShowReplyForm(true);
      // DON'T remove pendingReply here - let CommentsList handle scrolling
    }
    // DON'T clear pendingReply if not authenticated - auth state might not be updated yet after redirect
  }, [isAuthenticated, isLoading, comment.id]);

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      // Store the intent in sessionStorage to survive page reload
      sessionStorage.setItem('pendingReply', comment.id.toString());
      // CommentsList will handle scrolling via useEffect
      const redirectUrl = window.location.pathname;
      router.push('/auth/login?redirect=' + encodeURIComponent(redirectUrl));
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    onReplyAdded();
  };

  return (
    <li className="comment-item" id={`comment-${comment.id}`}>
      <div className="comment-row">
        {/* Avatar */}
        <Link
          href={`/u/${comment.username}`}
          className={`comment-avatar ${avatarColor}`}
        >
          {comment.username.charAt(0).toUpperCase()}
        </Link>

        {/* Comment content */}
        <div className="comment-body">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link
              href={`/u/${comment.username}`}
              className={`${TEXT.secondary} font-bold text-black dark:text-white hover:underline uppercase tracking-wide`}
              style={{ fontFamily: FONTS.mono }}
            >
              {comment.username}
            </Link>
            {comment.top_badge && (
              <UserBadge badgeType={comment.top_badge.badge_type} size="sm" />
            )}
            <span className={`${TEXT.mutedMedium} ${TEXT.label}`} style={{ fontFamily: FONTS.mono }}>•</span>
            <span className={`${TEXT.mutedMedium} ${TEXT.label} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
              {getTimeSince(comment.created_at)}
            </span>
            {/* Spoiler badge (only if not NONE) */}
            {comment.spoiler_scope !== 'NONE' && (
              <>
                <span className={`${TEXT.mutedMedium} ${TEXT.label}`} style={{ fontFamily: FONTS.mono }}>•</span>
                <span
                  className={`px-2 py-0.5 ${TEXT.label} ${RADIUS.control} ${getSpoilerBadgeColor(
                    comment.spoiler_scope
                  )} uppercase tracking-widest font-bold`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  {getSpoilerLabel(comment.spoiler_scope)}
                </span>
              </>
            )}
          </div>

          {/* Comment body */}
          <p className={`${TEXT.body} text-black dark:text-white leading-relaxed whitespace-pre-wrap`} style={{ fontFamily: FONTS.mono }}>
            {displayBody}
          </p>

          {/* Expand/collapse button for long comments */}
          <div className="flex items-center gap-3 mt-2">
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${TEXT.label} text-black dark:text-white hover:underline uppercase tracking-wide`}
                style={{ fontFamily: FONTS.mono }}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
            <button
              onClick={handleReplyClick}
              className={`${TEXT.label} ${TEXT.mutedMedium} hover:text-black hover:dark:text-white transition-colors uppercase tracking-wide`}
              style={{ fontFamily: FONTS.mono }}
            >
              Reply
            </button>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className={`mt-3 p-3 border ${BORDERS.medium} ${RADIUS.control} bg-white dark:bg-black`}>
              <AddCommentForm
                diffItemId={comment.diff_item}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Render nested replies */}
      {hasReplies && (
        <ul className="comment-thread comment-thread--nested">
          {comment.children.map((child, index) => (
            <CommentItem
              key={child.id}
              comment={child}
              depth={depth + 1}
              isLast={index === comment.children.length - 1}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// Build tree structure from flat comments
function buildCommentTree(comments: Comment[]): CommentNode[] {
  const commentMap = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  // First pass: create all nodes
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  // Second pass: build tree
  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)!;
    if (comment.parent && commentMap.has(comment.parent)) {
      const parent = commentMap.get(comment.parent)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function CommentsList({
  diffItemId,
  userSpoilerScope,
  onCommentCountChange,
  onSpoilerPreferenceChange,
  currentSpoilerPreference,
  autoOpenForm = false,
}: CommentsListProps): JSX.Element {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(autoOpenForm);

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

  // Auto-scroll to comments section if there's a pending action
  useEffect(() => {
    if (typeof window !== 'undefined' && !authLoading && !loading && isAuthenticated) {
      const pendingReply = sessionStorage.getItem('pendingReply');
      const pendingAddComment = sessionStorage.getItem('pendingAddComment');

      if (pendingReply) {
        // Scroll to the specific comment - give it extra time for layout to stabilize
        setTimeout(() => {
          const commentElement = document.getElementById(`comment-${pendingReply}`);
          if (commentElement) {
            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            sessionStorage.removeItem('pendingReply');
          }
        }, 500);
      } else if (pendingAddComment) {
        setTimeout(() => {
          const commentsSection = document.getElementById('comments');
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            sessionStorage.removeItem('pendingAddComment');
          }
        }, 500);
      }
    }
  }, [authLoading, loading, isAuthenticated]);

  // Auto-open add comment form if user was redirected to comments section
  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (typeof window !== 'undefined' && !authLoading && isAuthenticated) {
      const pendingAddComment = sessionStorage.getItem('pendingAddComment');

      if (pendingAddComment === 'true') {
        setShowAddForm(true);
        // DON'T remove pendingAddComment here - let scroll effect handle it
      }
    }
  }, [isAuthenticated, authLoading]);

  const handleAddCommentClick = () => {
    if (!isAuthenticated) {
      // Store the intent in sessionStorage to survive page reload
      sessionStorage.setItem('pendingAddComment', 'true');
      const redirectUrl = window.location.pathname;
      router.push('/auth/login?redirect=' + encodeURIComponent(redirectUrl));
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

  // Count hidden comments
  const hiddenCount = comments.length - visibleComments.length;

  // Build comment tree from visible comments
  const commentTree = buildCommentTree(visibleComments);

  return (
    <div className="space-y-4" id="comments">
      {/* Spoiler filter notice */}
      {hiddenCount > 0 && (
        <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-3 transition-all duration-300`}>
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className={`${TEXT.secondary} font-bold text-black dark:text-white uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                {hiddenCount} {hiddenCount === 1 ? 'comment is' : 'comments are'} hidden due to spoiler settings
              </p>
              <p className={`${TEXT.label} ${TEXT.mutedMedium} mt-1 uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>
                Currently showing: <span className="font-bold text-black dark:text-white">{getSpoilerLabel(userSpoilerScope)}</span> comments.
              </p>
              {onSpoilerPreferenceChange && currentSpoilerPreference && (
                <div className="mt-2 flex gap-2">
                  {currentSpoilerPreference === 'SAFE' && (
                    <>
                      <button
                        onClick={() => onSpoilerPreferenceChange('BOOK_ALLOWED')}
                        className={`${TEXT.label} px-2 py-1 border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black text-black dark:text-white ${RADIUS.control} transition-colors uppercase tracking-widest font-bold`}
                        style={{ fontFamily: FONTS.mono }}
                      >
                        Show Book Spoilers
                      </button>
                      <button
                        onClick={() => onSpoilerPreferenceChange('SCREEN_ALLOWED')}
                        className={`${TEXT.label} px-2 py-1 border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black text-black dark:text-white ${RADIUS.control} transition-colors uppercase tracking-widest font-bold`}
                        style={{ fontFamily: FONTS.mono }}
                      >
                        Show Screen Spoilers
                      </button>
                      <button
                        onClick={() => onSpoilerPreferenceChange('FULL')}
                        className={`${TEXT.label} px-2 py-1 border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black text-black dark:text-white ${RADIUS.control} transition-colors uppercase tracking-widest font-bold`}
                        style={{ fontFamily: FONTS.mono }}
                      >
                        Show All
                      </button>
                    </>
                  )}
                  {(currentSpoilerPreference === 'BOOK_ALLOWED' || currentSpoilerPreference === 'SCREEN_ALLOWED') && (
                    <button
                      onClick={() => onSpoilerPreferenceChange('FULL')}
                      className={`${TEXT.label} px-2 py-1 border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black text-black dark:text-white ${RADIUS.control} transition-colors uppercase tracking-widest font-bold`}
                      style={{ fontFamily: FONTS.mono }}
                    >
                      Show All Spoilers
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add comment section */}
      <div className={`border-b ${BORDERS.medium} pb-4`}>
        {!showAddForm ? (
          <button
            onClick={handleAddCommentClick}
            className={`text-black dark:text-white hover:underline ${TEXT.secondary} font-bold uppercase tracking-wide`}
            style={{ fontFamily: FONTS.mono }}
          >
            + Add a comment
          </button>
        ) : (
          <div className={`border ${BORDERS.medium} ${RADIUS.control} p-4 bg-stone-50 dark:bg-stone-950`}>
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
          <div className={`py-3 border-b ${BORDERS.medium}`}>
            <div className="flex items-center gap-2 mb-2">
              <LoadingSkeleton width="w-24" height="h-4" />
              <LoadingSkeleton width="w-2" height="h-2" variant="circular" />
              <LoadingSkeleton width="w-20" height="h-3" />
            </div>
            <LoadingSkeleton width="w-full" height="h-16" />
          </div>
          <div className={`py-3 border-b ${BORDERS.medium}`}>
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
        <div className={`text-center py-4 ${TEXT.secondary} text-black dark:text-white uppercase tracking-wide font-bold`} style={{ fontFamily: FONTS.mono }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && visibleComments.length === 0 && (
        <div className="text-center py-6">
          <p className={`mb-1 ${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>No comments yet</p>
          <p className={`${TEXT.label} ${TEXT.mutedLight} uppercase tracking-wide`} style={{ fontFamily: FONTS.mono }}>Be the first to share your thoughts!</p>
        </div>
      )}

      {/* Render threaded comments */}
      {!loading && !error && commentTree.length > 0 && (
        <ul className="comment-thread">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              onReplyAdded={fetchComments}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
