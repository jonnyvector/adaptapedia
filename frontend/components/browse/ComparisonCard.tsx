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
      className="group block border border-border rounded-lg overflow-hidden hover:border-link/50 hover:shadow-lg transition-all bg-card"
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
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
        </div>

        {/* Arrow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-link text-white px-3 py-2 rounded-full shadow-lg font-bold text-sm">
            →
          </div>
        </div>

        {/* Trending Badge */}
        {showTrendingBadge && (
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-primary text-white shadow-lg">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              Trending
            </span>
            {diff_count < 3 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-amber-500 text-white shadow-lg mt-1.5 block">
                Needs differences
              </span>
            )}
          </div>
        )}

        {/* Year Badge */}
        {screen_work_year && (
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-black/60 text-white backdrop-blur-sm">
              {screen_work_year}
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
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground group-hover:text-link transition-colors line-clamp-1 mb-1">
          {work_title}
        </h3>

        {/* Author & Year */}
        <div className="text-sm text-muted mb-3">
          {work_author && <span>{work_author}</span>}
          {work_author && work_year && <span> · </span>}
          {work_year && <span>{work_year}</span>}
        </div>

        {/* Adaptation Info */}
        <div className="text-xs text-muted mb-3">
          {screen_work_type} • {screen_work_year}
        </div>

        {/* Engagement Metrics */}
        <div className="flex items-center gap-3 text-xs text-muted">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-link">{diff_count}</span>
            <span>{diff_count === 1 ? 'difference' : 'differences'}</span>
          </div>
          {vote_count > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{vote_count}</span>
                <span>{vote_count === 1 ? 'vote' : 'votes'}</span>
              </div>
            </>
          )}
          {last_updated && (
            <>
              <span>•</span>
              <span className="text-tertiary">
                Updated {new Date(last_updated).toLocaleDateString()}
              </span>
            </>
          )}
          {showTrendingBadge && (recent_diffs > 0 || recent_votes > 0) && (
            <>
              <span>•</span>
              <span className="text-tertiary">
                {recent_diffs > 0 && `${recent_diffs} new ${recent_diffs === 1 ? 'diff' : 'diffs'}`}
                {recent_diffs > 0 && recent_votes > 0 && ' · '}
                {recent_votes > 0 && `${recent_votes} ${recent_votes === 1 ? 'vote' : 'votes'}`}
                {' this week'}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
