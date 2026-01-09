import { api, ApiError } from '@/lib/api';
import type {
  ScreenWork,
  Work,
  AdaptationEdge,
  DiffItem,
  ApiResponse,
} from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Infobox from '@/components/shared/Infobox';
import { ArrowTopRightOnSquareIcon } from '@/components/ui/Icons';
import DiffItemCard from '@/components/diff/DiffItemCard';
import DiffPreview from '@/components/diff/DiffPreview';

interface PageProps {
  params: {
    slug: string;
  };
}

interface ScreenWorkData {
  screenWork: ScreenWork;
  adaptations: Array<AdaptationEdge & { diffs?: DiffItem[] }>;
  topDiffs: DiffItem[];
  totalDiffCount: number;
}

async function getScreenWorkData(slug: string): Promise<ScreenWorkData> {
  let screenWork: ScreenWork;

  // Fetch screen work
  try {
    screenWork = (await api.screen.get(slug)) as ScreenWork;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // Fetch adaptations (includes nested work_detail) and their diffs
  const adaptationsResponse = (await api.adaptations.byScreenWork(
    screenWork.id
  )) as ApiResponse<AdaptationEdge>;

  const adaptationsWithDiffs = await Promise.all(
    adaptationsResponse.results.map(async (adaptation) => {
      // Fetch safe diffs for preview
      let diffs: DiffItem[] = [];
      try {
        const diffsResponse = (await api.compare.get(
          adaptation.work,
          screenWork.id,
          'NONE',
          '-vote_counts__accurate'
        )) as ApiResponse<DiffItem>;
        diffs = diffsResponse.results;
      } catch (error) {
        console.error(`Failed to fetch diffs for work ${adaptation.work}:`, error);
      }

      // Get total count including all spoiler levels
      let totalCount = diffs.length;
      try {
        const fullDiffsResponse = (await api.compare.get(
          adaptation.work,
          screenWork.id,
          'FULL',
          '-vote_counts__accurate'
        )) as ApiResponse<DiffItem>;
        totalCount = fullDiffsResponse.results.length;
      } catch (error) {
        console.error(`Failed to fetch full diff count for work ${adaptation.work}:`, error);
      }

      return {
        ...adaptation,
        diffs,
        totalDiffCount: totalCount,
      };
    })
  );

  // Calculate total diff count (including all spoiler levels)
  const totalDiffCount = adaptationsWithDiffs.reduce(
    (sum, adaptation) => sum + (adaptation.totalDiffCount || 0),
    0
  );

  // Fetch top diffs for this screen work
  let topDiffs: DiffItem[] = [];
  try {
    const diffsResponse = (await api.diffs.topByScreenWork(
      screenWork.id,
      5
    )) as ApiResponse<DiffItem>;
    topDiffs = diffsResponse.results;
  } catch (error) {
    console.error('Failed to fetch diffs:', error);
  }

  return {
    screenWork,
    adaptations: adaptationsWithDiffs,
    topDiffs,
    totalDiffCount,
  };
}

function getScreenWorkTypeLabel(type: string): string {
  switch (type) {
    case 'MOVIE':
      return 'Movie';
    case 'TV':
      return 'TV Series';
    default:
      return type;
  }
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

export default async function ScreenWorkPage({
  params,
}: PageProps): Promise<JSX.Element> {
  const { screenWork, adaptations, topDiffs, totalDiffCount } = await getScreenWorkData(
    params.slug
  );

  const infoboxItems = [
    {
      label: 'Type',
      value: getScreenWorkTypeLabel(screenWork.type),
    },
    ...(screenWork.year
      ? [{ label: 'Year', value: screenWork.year.toString() }]
      : []),
    ...(screenWork.tmdb_id
      ? [
          {
            label: 'TMDb',
            value: (
              <a
                href={`https://www.themoviedb.org/${
                  screenWork.type === 'MOVIE' ? 'movie' : 'tv'
                }/${screenWork.tmdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:underline inline-flex items-center gap-1"
              >
                View on TMDb
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              </a>
            ),
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2">
            <span className="text-sm text-muted">
              {getScreenWorkTypeLabel(screenWork.type)}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2">{screenWork.title}</h1>
          {screenWork.year && (
            <p className="text-lg text-muted">({screenWork.year})</p>
          )}

          {/* Quick Stats */}
          {adaptations.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-muted bg-muted/5 rounded-lg px-4 py-3 border border-border/50 mt-4">
              <span className="font-medium">
                Based on {adaptations.length} {adaptations.length === 1 ? 'book' : 'books'}
              </span>
              <span>•</span>
              <span className="font-medium">
                {totalDiffCount} {totalDiffCount === 1 ? 'difference' : 'differences'} documented
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* Summary */}
            {screenWork.summary && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Summary</h2>
                <p className="text-base leading-relaxed">{screenWork.summary}</p>
              </section>
            )}

            {/* Based on section - comparison focused */}
            <section>
              <h2 className="text-3xl font-bold mb-2">
                Compare with source material
              </h2>
              <p className="text-muted mb-6">
                See how this {screenWork.type === 'MOVIE' ? 'movie' : 'series'} compares to the {adaptations.length === 1 ? 'book it was based on' : 'books it was based on'}
              </p>
              {adaptations.length > 0 ? (
                <div className="space-y-6">
                  {adaptations.map((adaptation) => {
                    const book = adaptation.work_detail;
                    const diffCount = adaptation.diffs?.length || 0;
                    const compareUrl = `/compare/${book.slug}/${screenWork.slug}`;

                    return (
                      <div
                        key={adaptation.id}
                        className="border-2 border-border rounded-lg p-6 hover:shadow-lg hover:border-link/30 transition-all bg-surface"
                      >
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Book cover */}
                          {book.cover_url && (
                            <div className="flex-shrink-0 lg:w-32">
                              <Image
                                src={book.cover_url}
                                alt={book.title}
                                width={128}
                                height={192}
                                className="w-full h-auto rounded border border-border shadow-sm"
                              />
                            </div>
                          )}

                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-muted">
                                  {getRelationTypeLabel(adaptation.relation_type)}
                                </span>
                                {book.year && (
                                  <>
                                    <span className="text-xs text-muted">•</span>
                                    <span className="text-sm text-muted">Published {book.year}</span>
                                  </>
                                )}
                              </div>
                              <h3 className="text-2xl font-bold text-foreground mb-1">
                                {book.title}
                              </h3>
                              {book.author && (
                                <p className="text-sm text-muted">by {book.author}</p>
                              )}
                            </div>

                            {/* Summary */}
                            {book.summary && (
                              <p className="text-sm text-muted mb-4 leading-relaxed line-clamp-3">
                                {book.summary}
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
                                href={`/book/${book.slug}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-foreground rounded-lg hover:bg-muted/10 transition-colors text-sm"
                              >
                                View book
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
              ) : (
                <p className="text-muted italic">
                  No source material information available yet.
                </p>
              )}
            </section>

            {/* Top diffs section */}
            {topDiffs.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Top Differences</h2>
                <p className="text-muted mb-4">
                  Most voted differences across all source material
                </p>
                <div className="space-y-4">
                  {topDiffs.map((diff) => (
                    <DiffItemCard key={diff.id} diff={diff} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Infobox
              title="Information"
              items={infoboxItems}
              imageUrl={screenWork.poster_url}
              imageAlt={`${screenWork.title} poster`}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
