import type { DiffItem } from '@/lib/types';
import Link from 'next/link';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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
      <div className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>
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
      <div className={`${TEXT.secondary} font-bold ${TEXT.mutedMedium} mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
        See what changed...
      </div>

      {previewDiffs.map((diff) => (
        <div
          key={diff.id}
          className={`border ${BORDERS.medium} rounded-md p-3 bg-white dark:bg-black hover:border-black hover:dark:border-white transition-colors`}
        >
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg" title={diff.category}>
              {getCategoryIcon(diff.category)}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`${TEXT.secondary} font-bold text-black dark:text-white line-clamp-2`} style={{ fontFamily: FONTS.mono }}>
                {diff.claim}
              </p>
            </div>
            <span
              className={`px-2 py-0.5 ${TEXT.metadata} font-bold rounded-md flex-shrink-0 ${getSpoilerBadgeColor(
                diff.spoiler_scope
              )}`}
              style={{ fontFamily: FONTS.mono }}
            >
              {diff.spoiler_scope === 'NONE' ? 'Safe' : 'Spoiler'}
            </span>
          </div>

          {diff.vote_counts && (
            <div className={`flex items-center gap-2 ${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
              <span className="flex items-center gap-1">
                <span className="text-green-700 dark:text-green-400">↑</span>
                {diff.vote_counts.accurate}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-amber-700 dark:text-amber-400">~</span>
                {diff.vote_counts.needs_nuance}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-red-700 dark:text-red-400">↓</span>
                {diff.vote_counts.disagree}
              </span>
            </div>
          )}
        </div>
      ))}

      <Link
        href={compareUrl}
        className={`block text-center ${TEXT.secondary} text-black dark:text-white hover:opacity-70 py-2 font-bold ${monoUppercase}`}
        style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
      >
        {totalDiffs > maxItems
          ? `See all ${totalDiffs} differences →`
          : 'View full comparison →'}
      </Link>
    </div>
  );
}
