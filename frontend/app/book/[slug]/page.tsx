import { api, ApiError } from '@/lib/api';
import type {
  Work,
  ScreenWork,
  AdaptationEdge,
  DiffItem,
  ApiResponse,
  SimilarBook,
} from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WorkInfobox from '@/components/shared/WorkInfobox';
import AdaptationsList from '@/components/shared/AdaptationsList';
import DiffItemCard from '@/components/diff/DiffItemCard';
import SimilarBooks from '@/components/shared/SimilarBooks';

interface PageProps {
  params: {
    slug: string;
  };
}

interface WorkPageData {
  work: Work;
  adaptations: Array<ScreenWork & { adaptationEdge: AdaptationEdge; diffs?: DiffItem[] }>;
  topDiffs: DiffItem[];
  totalDiffCount: number;
  similarBooks: SimilarBook[];
}

async function getWorkData(slug: string): Promise<WorkPageData> {
  let work: Work;

  try {
    work = (await api.works.get(slug)) as Work;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // Get adaptations for this work
  const adaptationsResponse = (await api.adaptations.byWork(
    work.id
  )) as ApiResponse<AdaptationEdge>;

  // Extract screen works with their adaptation edge data and fetch diffs for each
  const adaptationsWithDiffs = await Promise.all(
    adaptationsResponse.results.map(async (edge) => {
      // Fetch top diffs for this specific adaptation
      let diffs: DiffItem[] = [];
      try {
        const diffsResponse = (await api.compare.get(
          work.id,
          edge.screen_work,
          'NONE',
          '-vote_counts__accurate'
        )) as ApiResponse<DiffItem>;
        diffs = diffsResponse.results;
      } catch (error) {
        console.error(`Failed to fetch diffs for adaptation ${edge.screen_work}:`, error);
      }

      return {
        ...edge.screen_work_detail,
        adaptationEdge: edge,
        diffs,
      };
    })
  );

  // Calculate total diff count across all adaptations
  const totalDiffCount = adaptationsWithDiffs.reduce(
    (sum, adaptation) => sum + (adaptation.diffs?.length || 0),
    0
  );

  // Get top diffs across all adaptations (sorted by total votes)
  let topDiffs: DiffItem[] = [];
  try {
    const diffsResponse = (await api.diffs.topByWork(
      work.id,
      10
    )) as ApiResponse<DiffItem>;
    topDiffs = diffsResponse.results;
  } catch (error) {
    console.error('Failed to fetch top diffs:', error);
  }

  // Get similar books
  let similarBooks: SimilarBook[] = [];
  try {
    const similarBooksResponse = await api.works.similar(work.slug, 6);
    similarBooks = similarBooksResponse.results;
  } catch (error) {
    console.error('Failed to fetch similar books:', error);
  }

  return {
    work,
    adaptations: adaptationsWithDiffs,
    topDiffs,
    totalDiffCount,
    similarBooks,
  };
}

export default async function WorkPage({ params }: PageProps): Promise<JSX.Element> {
  const { work, adaptations, topDiffs, totalDiffCount, similarBooks } = await getWorkData(params.slug);

  return (
    <main className="min-h-screen">
      <div className="container py-8 md:py-16">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">{work.title}</h1>
            {work.year && (
              <p className="text-xl text-muted">Published in {work.year}</p>
            )}
          </div>

          {/* Lead Summary */}
          {work.summary && (
            <div className="prose max-w-none mb-6">
              <p className="text-lg leading-relaxed">{work.summary}</p>
            </div>
          )}

          {/* Quick Stats */}
          {adaptations.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-muted bg-muted/5 rounded-lg px-4 py-3 border border-border/50">
              <span className="font-medium">
                {adaptations.length} {adaptations.length === 1 ? 'adaptation' : 'adaptations'}
              </span>
              <span>•</span>
              <span className="font-medium">
                {totalDiffCount} {totalDiffCount === 1 ? 'difference' : 'differences'} documented
              </span>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Adaptations Section */}
            <section>
              <h2 className="text-3xl font-bold mb-2">
                Choose an adaptation to compare
              </h2>
              <p className="text-muted mb-6">
                Select a screen adaptation to see a detailed comparison with the book
              </p>
              {adaptations.length > 0 ? (
                <AdaptationsList
                  adaptations={adaptations}
                  workSlug={work.slug}
                />
              ) : (
                <div className="border border-border rounded-lg p-8 text-center">
                  <p className="text-muted">
                    No screen adaptations have been added yet.
                  </p>
                </div>
              )}
            </section>

            {/* Top Diffs Section */}
            {topDiffs.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Top Differences Across Adaptations
                </h2>
                <p className="text-muted mb-4">
                  Most-voted differences from all screen adaptations
                </p>
                <div className="space-y-4">
                  {topDiffs.map((diff) => (
                    <DiffItemCard key={diff.id} diff={diff} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <WorkInfobox work={work} />
          </div>
        </div>

        {/* Similar Books Section */}
        <SimilarBooks books={similarBooks} />

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href="/"
            className="text-link hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
