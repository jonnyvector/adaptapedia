import Link from 'next/link';
import type { BrowseComparison, TrendingComparison } from '@/lib/types';

interface ComparisonCardProps {
  comparison: BrowseComparison | TrendingComparison;
  showTrendingBadge?: boolean;
}

export default function ComparisonCard({ comparison, showTrendingBadge = false }: ComparisonCardProps): JSX.Element {
  const {
    work_title,
    work_slug,
    cover_url,
    screen_work_title,
    screen_work_slug,
    screen_work_type,
    screen_work_year,
    poster_url,
  } = comparison;

  // Handle different field names between BrowseComparison and TrendingComparison
  const work_author = 'work_author' in comparison ? comparison.work_author : undefined;
  const work_year = 'work_year' in comparison ? comparison.work_year : undefined;
  const diff_count = 'diff_count' in comparison ? comparison.diff_count : 'total_diffs' in comparison ? comparison.total_diffs : 0;
  const vote_count = 'vote_count' in comparison ? comparison.vote_count : 0;
  const last_updated = 'last_updated' in comparison ? comparison.last_updated : undefined;
  const recent_diffs = 'recent_diffs' in comparison ? comparison.recent_diffs : 0;
  const recent_votes = 'recent_votes' in comparison ? comparison.recent_votes : 0;

  const comparisonUrl = `/compare/${work_slug}/${screen_work_slug}`;

  return (
    <Link
      href={comparisonUrl}
      className="group block border border-border rounded-lg overflow-hidden hover:border-link/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-card"
    >
      {/* Visual: Book Cover ↔ Movie Poster */}
      <div className="relative flex h-48 bg-gradient-to-r from-surface2/50 to-surface/50">
        {/* Book Cover */}
        <div className="flex-1 relative overflow-hidden border-r-2 border-white/30">
          {cover_url ? (
            <img
              src={cover_url}
              alt={work_title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-surface2 text-muted text-xs">
              No Cover
            </div>
          )}
          {/* Subtle dark overlay for consistency */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
          {/* Year only - no BOOK chip */}
          {work_year && (
            <div className="absolute top-2 left-2 z-10">
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-black/60 text-white backdrop-blur-sm">
                {work_year}
              </span>
            </div>
          )}
        </div>

        {/* Subtle seam divider */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/40 dark:bg-black/40 z-10 group-hover:bg-link/60 transition-colors" />

        {/* VS Chip on seam */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-white dark:bg-gray-900 text-foreground px-2 py-0.5 rounded-md shadow-lg font-bold text-xs border border-border group-hover:border-link group-hover:text-link transition-colors">
            VS
          </div>
        </div>

        {/* Trending Badge - positioned at top */}
        {showTrendingBadge && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-link text-white backdrop-blur-md shadow-md">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Trending
            </span>
          </div>
        )}

        {/* Movie/TV Poster */}
        <div className="flex-1 relative overflow-hidden">
          {poster_url ? (
            <img
              src={poster_url}
              alt={screen_work_title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-surface2 text-muted text-xs">
              No Poster
            </div>
          )}
          {/* Subtle dark overlay for consistency */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20" />
          {/* Year only - no MOVIE/TV chip */}
          {screen_work_year && (
            <div className="absolute top-2 right-2 z-10">
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-black/60 text-white backdrop-blur-sm">
                {screen_work_year}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground group-hover:text-link transition-colors line-clamp-1 mb-1">
          {work_title}
        </h3>

        {/* Author */}
        {work_author && (
          <div className="text-sm text-muted mb-2">
            {work_author}
          </div>
        )}

        {/* Adaptation Info - Type only, years are on covers */}
        <div className="text-xs text-muted mb-3">
          Book vs {screen_work_type?.toUpperCase() === 'MOVIE' ? 'Movie' : screen_work_type?.toUpperCase() === 'TV' ? 'Series' : screen_work_type}
        </div>

        {/* Engagement Metrics - Improved signals */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Diffs + Votes combined for better engagement signal */}
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-muted/10 text-foreground border border-border">
            <svg className="w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold">{diff_count}</span>
            <span>{diff_count === 1 ? 'diff' : 'diffs'}</span>
            {vote_count > 0 && (
              <>
                <span className="text-muted">•</span>
                <span className="font-semibold">{vote_count}</span>
                <span>{vote_count === 1 ? 'vote' : 'votes'}</span>
              </>
            )}
          </span>

          {/* Activity indicator for trending */}
          {showTrendingBadge && (recent_diffs && recent_diffs > 0 || recent_votes && recent_votes > 0) && (
            <span className="inline-flex items-center gap-1 px-1.5 py-1 text-xs font-medium rounded-md bg-link/10 text-link border border-link/20">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-semibold">Active</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
