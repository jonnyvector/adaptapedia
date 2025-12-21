import type { DiffItem } from '@/lib/types';
import Link from 'next/link';

interface DiffPreviewProps {
  diffs: DiffItem[];
  compareUrl: string;
  maxItems?: number;
}

export default function DiffPreview({
  diffs,
  compareUrl,
  maxItems = 3
}: DiffPreviewProps): JSX.Element {
  const previewDiffs = diffs.slice(0, maxItems);
  const totalDiffs = diffs.length;

  if (previewDiffs.length === 0) {
    return (
      <div className="text-sm text-muted italic">
        No differences documented yet. Be the first to add one!
      </div>
    );
  }

  const getSpoilerBadgeColor = (scope: string): string => {
    switch (scope) {
      case 'NONE':
        return 'bg-success/10 text-success';
      case 'BOOK_ONLY':
        return 'bg-cyan/10 text-cyan';
      case 'SCREEN_ONLY':
        return 'bg-purple/10 text-purple';
      case 'FULL':
        return 'bg-magenta/10 text-magenta';
      default:
        return 'bg-surface';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'PLOT':
        return '📖';
      case 'CHARACTER':
        return '👤';
      case 'ENDING':
        return '🎬';
      case 'SETTING':
        return '🌍';
      case 'THEME':
        return '💭';
      case 'TONE':
        return '🎭';
      case 'TIMELINE':
        return '⏰';
      case 'WORLDBUILDING':
        return '🏰';
      default:
        return '✏️';
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted mb-2">
        See what changed...
      </div>

      {previewDiffs.map((diff) => (
        <div
          key={diff.id}
          className="border border-border rounded-lg p-3 bg-surface hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg" title={diff.category}>
              {getCategoryIcon(diff.category)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {diff.claim}
              </p>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-mono rounded flex-shrink-0 ${getSpoilerBadgeColor(
                diff.spoiler_scope
              )}`}
            >
              {diff.spoiler_scope === 'NONE' ? 'Safe' : 'Spoiler'}
            </span>
          </div>

          {diff.vote_counts && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="text-success">↑</span>
                {diff.vote_counts.accurate}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">~</span>
                {diff.vote_counts.needs_nuance}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-danger">↓</span>
                {diff.vote_counts.disagree}
              </span>
            </div>
          )}
        </div>
      ))}

      <Link
        href={compareUrl}
        className="block text-center text-sm text-link hover:underline py-2"
      >
        {totalDiffs > maxItems
          ? `See all ${totalDiffs} differences →`
          : 'View full comparison →'}
      </Link>
    </div>
  );
}
