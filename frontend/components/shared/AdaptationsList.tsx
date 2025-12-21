import type { ScreenWork, AdaptationEdge, DiffItem } from '@/lib/types';
import Link from 'next/link';
import DiffPreview from '@/components/diff/DiffPreview';

interface AdaptationsListProps {
  adaptations: Array<ScreenWork & { adaptationEdge: AdaptationEdge; diffs?: DiffItem[] }>;
  workSlug: string;
}

function getRelationTypeLabel(relationType: string): string {
  switch (relationType) {
    case 'BASED_ON':
      return 'Based on';
    case 'INSPIRED_BY':
      return 'Inspired by';
    case 'LOOSELY_BASED':
      return 'Loosely based on';
    default:
      return relationType;
  }
}

export default function AdaptationsList({
  adaptations,
  workSlug,
}: AdaptationsListProps): JSX.Element {
  return (
    <div className="space-y-6">
      {adaptations.map((adaptation) => {
        const diffCount = adaptation.diffs?.length || 0;
        const compareUrl = `/compare/${workSlug}/${adaptation.slug}`;

        return (
          <div
            key={adaptation.id}
            className="border-2 border-border rounded-lg p-6 hover:shadow-lg hover:border-link/30 transition-all bg-surface"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Poster Image - moved to left side */}
              {adaptation.poster_url && (
                <div className="flex-shrink-0 lg:w-32">
                  <img
                    src={adaptation.poster_url}
                    alt={`Poster for ${adaptation.title}`}
                    className="w-full h-auto rounded border border-border shadow-sm"
                  />
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Type */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-mono rounded bg-muted/20 text-muted">
                      {adaptation.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                    </span>
                    {adaptation.year && (
                      <span className="text-sm text-muted">{adaptation.year}</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {adaptation.title}
                  </h3>
                  <span className="text-xs text-muted">
                    {getRelationTypeLabel(adaptation.adaptationEdge.relation_type)}
                  </span>
                </div>

                {/* Summary */}
                {adaptation.summary && (
                  <p className="text-sm text-muted mb-4 leading-relaxed line-clamp-3">
                    {adaptation.summary}
                  </p>
                )}

                {/* Engagement Stats */}
                <div className="mb-4 text-sm text-muted">
                  {diffCount > 0 ? (
                    <span className="font-medium">
                      {diffCount} {diffCount === 1 ? 'difference' : 'differences'} documented
                    </span>
                  ) : (
                    <span className="italic">No differences documented yet</span>
                  )}
                </div>

                {/* Diff Preview */}
                {adaptation.diffs && adaptation.diffs.length > 0 && (
                  <div className="mb-5 bg-muted/5 rounded-lg p-4 border border-border/50">
                    <DiffPreview
                      diffs={adaptation.diffs}
                      compareUrl={compareUrl}
                      maxItems={3}
                    />
                  </div>
                )}

                {/* Primary CTA: Compare Button */}
                <div className="flex flex-wrap gap-3 items-center">
                  <Link
                    href={compareUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-link text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-base shadow-sm"
                  >
                    Compare →
                  </Link>

                  {/* Secondary Actions */}
                  <Link
                    href={`/screen/${adaptation.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-foreground rounded-lg hover:bg-muted/10 transition-colors text-sm"
                  >
                    View details
                  </Link>

                  <Link
                    href={`${compareUrl}#add-diff`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-foreground rounded-lg hover:bg-muted/10 transition-colors text-sm"
                  >
                    + Add difference
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
