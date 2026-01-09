import type { ScreenWork, AdaptationEdge, DiffItem } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import DiffPreview from '@/components/diff/DiffPreview';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase, RADIUS} from '@/lib/brutalist-design';

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
            className={`border ${BORDERS.medium} p-6 hover:border-black hover:dark:border-white transition-all bg-stone-50 dark:bg-stone-950`}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Poster Image - moved to left side */}
              {adaptation.poster_url && (
                <div className="flex-shrink-0 lg:w-32">
                  <Image
                    src={adaptation.poster_url}
                    alt={`Poster for ${adaptation.title}`}
                    width={200}
                    height={300}
                    className={`w-full h-auto border ${BORDERS.subtle}`}
                    sizes="(max-width: 1024px) 100vw, 128px"
                  />
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Type */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-1 ${TEXT.metadata} font-bold bg-white dark:bg-black border ${BORDERS.subtle} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                      {adaptation.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                    </span>
                    {adaptation.year && (
                      <span className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>{adaptation.year}</span>
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold text-black dark:text-white mb-1`} style={{ fontFamily: FONTS.mono }}>
                    {adaptation.title}
                  </h3>
                  <span className={`${TEXT.metadata} ${TEXT.mutedMedium} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                    {getRelationTypeLabel(adaptation.adaptationEdge.relation_type)}
                  </span>
                </div>

                {/* Summary */}
                {adaptation.summary && (
                  <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4 leading-relaxed line-clamp-3`} style={{ fontFamily: FONTS.mono }}>
                    {adaptation.summary}
                  </p>
                )}

                {/* Engagement Stats */}
                <div className={`mb-4 ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                  {diffCount > 0 ? (
                    <span className="font-bold">
                      {diffCount} {diffCount === 1 ? 'difference' : 'differences'} documented
                    </span>
                  ) : (
                    <span className="italic">No differences documented yet</span>
                  )}
                </div>

                {/* Diff Preview */}
                {adaptation.diffs && adaptation.diffs.length > 0 && (
                  <div className={`mb-5 bg-white dark:bg-black p-4 border ${BORDERS.subtle}`}>
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
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} hover:opacity-90 transition-opacity font-bold ${TEXT.body} border ${BORDERS.solid} ${monoUppercase}`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
                  >
                    Compare →
                  </Link>

                  {/* Secondary Actions */}
                  <Link
                    href={`/screen/${adaptation.slug}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white ${RADIUS.control} hover:border-black hover:dark:border-white transition-colors ${TEXT.secondary} font-bold ${monoUppercase}`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
                  >
                    View details
                  </Link>

                  <Link
                    href={`${compareUrl}#add-diff`}
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white ${RADIUS.control} hover:border-black hover:dark:border-white transition-colors ${TEXT.secondary} font-bold ${monoUppercase}`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
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
