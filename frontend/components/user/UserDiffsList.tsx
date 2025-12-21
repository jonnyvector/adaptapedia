import Link from 'next/link';
import type { DiffItem } from '@/lib/types';

interface UserDiffsListProps {
  diffs: DiffItem[];
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

function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    PLOT: 'bg-blue-50 text-blue-700 border-blue-200',
    CHARACTER: 'bg-purple-50 text-purple-700 border-purple-200',
    ENDING: 'bg-red-50 text-red-700 border-red-200',
    SETTING: 'bg-green-50 text-green-700 border-green-200',
    THEME: 'bg-amber-50 text-amber-700 border-amber-200',
    TONE: 'bg-pink-50 text-pink-700 border-pink-200',
    TIMELINE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    WORLDBUILDING: 'bg-teal-50 text-teal-700 border-teal-200',
    OTHER: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return colors[category] || colors.OTHER;
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

export default function UserDiffsList({
  diffs,
}: UserDiffsListProps): JSX.Element {
  if (diffs.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted text-lg">No diffs created yet</p>
        <p className="text-muted text-sm mt-2">
          Start comparing books and screen adaptations to add your first diff
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {diffs.map((diff) => (
        <div
          key={diff.id}
          className="border border-border rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
        >
          {/* Header with comparison link */}
          <div className="mb-3">
            <Link
              href={`/compare/${diff.work_slug}/${diff.screen_work_slug}`}
              className="text-sm text-link hover:underline font-medium"
            >
              {diff.work_title} vs {diff.screen_work_title}
            </Link>
          </div>

          {/* Main claim */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold flex-1">{diff.claim}</h3>
            <div className="flex gap-2 ml-3">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded border ${getCategoryBadgeColor(
                  diff.category
                )}`}
              >
                {diff.category}
              </span>
              <span
                className={`px-2 py-1 text-xs font-mono rounded ${getSpoilerBadgeColor(
                  diff.spoiler_scope
                )}`}
              >
                {getSpoilerLabel(diff.spoiler_scope)}
              </span>
            </div>
          </div>

          {/* Detail */}
          {diff.detail && (
            <p className="text-sm text-muted mb-4 leading-relaxed">
              {diff.detail}
            </p>
          )}

          {/* Vote counts and timestamp */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <span className="text-green-700 font-medium">
                {diff.vote_counts.accurate} accurate
              </span>
              <span className="text-yellow-700 font-medium">
                {diff.vote_counts.needs_nuance} needs nuance
              </span>
              <span className="text-red-700 font-medium">
                {diff.vote_counts.disagree} disagree
              </span>
            </div>
            <span className="text-muted">{formatDate(diff.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
