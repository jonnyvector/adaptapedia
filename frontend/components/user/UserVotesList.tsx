import Link from 'next/link';
import type { Vote } from '@/lib/types';

interface UserVotesListProps {
  votes: Vote[];
}

function getVoteBadgeColor(vote: string): string {
  switch (vote) {
    case 'ACCURATE':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'NEEDS_NUANCE':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'DISAGREE':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getVoteLabel(vote: string): string {
  switch (vote) {
    case 'ACCURATE':
      return 'Accurate';
    case 'NEEDS_NUANCE':
      return 'Needs Nuance';
    case 'DISAGREE':
      return 'Disagree';
    default:
      return vote;
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

export default function UserVotesList({
  votes,
}: UserVotesListProps): JSX.Element {
  if (votes.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <p className="text-muted text-lg">No votes cast yet</p>
        <p className="text-muted text-sm mt-2">
          Start voting on diffs to build your voting history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {votes.map((vote) => (
        <div
          key={vote.id}
          className="border border-border rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
        >
          {/* Header with comparison link */}
          <div className="mb-3">
            <Link
              href={`/compare/${vote.work_slug}/${vote.screen_work_slug}`}
              className="text-sm text-link hover:underline font-medium"
            >
              {vote.work_title} vs {vote.screen_work_title}
            </Link>
          </div>

          {/* Diff claim */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold flex-1">
              {vote.diff_item_claim}
            </h3>
            <div className="flex gap-2 ml-3">
              {vote.diff_item_category && (
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded border ${getCategoryBadgeColor(
                    vote.diff_item_category
                  )}`}
                >
                  {vote.diff_item_category}
                </span>
              )}
            </div>
          </div>

          {/* Vote and meta info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted">You voted:</span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded border ${getVoteBadgeColor(
                  vote.vote
                )}`}
              >
                {getVoteLabel(vote.vote)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted">
              {vote.created_by_username && (
                <>
                  <span>
                    by{' '}
                    <Link
                      href={`/u/${vote.created_by_username}`}
                      className="text-link hover:underline"
                    >
                      @{vote.created_by_username}
                    </Link>
                  </span>
                  <span>•</span>
                </>
              )}
              <span>{formatDate(vote.created_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
