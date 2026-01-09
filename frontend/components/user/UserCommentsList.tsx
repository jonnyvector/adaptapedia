import Link from 'next/link';
import type { Comment } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase, RADIUS} from '@/lib/brutalist-design';

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
      <div className={`border ${BORDERS.medium} ${RADIUS.control} p-12 text-center bg-stone-50 dark:bg-stone-950`}>
        <p className={`${TEXT.body} ${TEXT.mutedMedium} font-bold`} style={{ fontFamily: FONTS.mono }}>No comments posted yet</p>
        <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-2`} style={{ fontFamily: FONTS.mono }}>
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
          className={`border ${BORDERS.medium} ${RADIUS.control} p-5 hover:border-black hover:dark:border-white transition-colors bg-white dark:bg-black`}
        >
          {/* Context - which diff this comment is on */}
          <div className={`mb-3 pb-3 border-b ${BORDERS.subtle}`}>
            <div className={`${TEXT.metadata} ${TEXT.mutedMedium} mb-1 font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Comment on</div>
            <Link
              href={`/compare/${comment.work_slug}/${comment.screen_work_slug}`}
              className={`${TEXT.secondary} font-bold text-black dark:text-white hover:opacity-70`}
              style={{ fontFamily: FONTS.mono }}
            >
              {comment.work_title} vs {comment.screen_work_title}
            </Link>
            <div className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-1`} style={{ fontFamily: FONTS.mono }}>
              Diff: {comment.diff_item_claim}
            </div>
          </div>

          {/* Comment body */}
          <div className="mb-3">
            <p className={`${TEXT.secondary} leading-relaxed`} style={{ fontFamily: FONTS.mono }}>{comment.body}</p>
          </div>

          {/* Footer with spoiler badge and timestamp */}
          <div className={`flex items-center justify-between ${TEXT.secondary}`}>
            <span
              className={`px-2 py-1 ${TEXT.metadata} font-bold ${RADIUS.control} ${getSpoilerBadgeColor(
                comment.spoiler_scope
              )}`}
              style={{ fontFamily: FONTS.mono }}
            >
              {getSpoilerLabel(comment.spoiler_scope)}
            </span>
            <span className={TEXT.mutedMedium} style={{ fontFamily: FONTS.mono }}>{formatDate(comment.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
