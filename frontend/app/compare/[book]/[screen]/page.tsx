import { api, ApiError } from '@/lib/api';
import type { Work, ScreenWork, DiffItem, ApiResponse } from '@/lib/types';
import { notFound } from 'next/navigation';
import ComparisonView from '@/components/diff/ComparisonView';

interface PageProps {
  params: {
    book: string;
    screen: string;
  };
}

async function getComparisonData(
  bookSlug: string,
  screenSlug: string
): Promise<{
  work: Work;
  screenWork: ScreenWork;
  diffs: DiffItem[];
}> {
  let work: Work;
  let screenWork: ScreenWork;

  try {
    work = (await api.works.get(bookSlug)) as Work;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  try {
    screenWork = (await api.screen.get(screenSlug)) as ScreenWork;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // Get ALL diffs with FULL scope server-side (will be filtered client-side by preference)
  // This prevents unnecessary client-side refetching when spoiler preferences change
  const diffsResponse = (await api.compare.get(
    work.id,
    screenWork.id,
    'FULL'
  )) as ApiResponse<DiffItem>;

  return {
    work,
    screenWork,
    diffs: diffsResponse.results,
  };
}

export default async function ComparePage({ params }: PageProps): Promise<JSX.Element> {
  const { work, screenWork, diffs } = await getComparisonData(params.book, params.screen);

  return (
    <main className="min-h-screen">
      <ComparisonView
        work={work}
        screenWork={screenWork}
        initialDiffs={diffs}
      />
    </main>
  );
}
