import { Metadata } from 'next';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';
import CatalogClient from './CatalogClient';
import { FONTS, TEXT, RADIUS} from '@/lib/brutalist-design';

export const metadata: Metadata = {
  title: 'Full Catalog | Adaptapedia',
  description: 'Browse our complete collection of books and their screen adaptations',
};

interface CatalogBook {
  id: number;
  title: string;
  author: string;
  year: number;
  slug: string;
  cover_url: string | null;
  adaptation_count: number;
  adaptations: {
    id: number;
    title: string;
    year: number;
    type: string;
    slug: string;
    poster_url: string | null;
  }[];
}

interface CatalogResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
  results: CatalogBook[];
  available_letters: string[];
  letter_counts: Record<string, number>;
}

async function getCatalogData(
  sort: string = 'title',
  order: string = 'asc',
  filter: string = 'all',
  letter?: string,
  page: number = 1
): Promise<CatalogResponse> {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:8000/api';
    const params: Record<string, string> = { sort, order, filter, page: page.toString() };
    if (letter) {
      params.letter = letter;
    }
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(
      `${API_URL}/works/catalog/?${queryString}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch catalog');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return {
      count: 0,
      total_pages: 0,
      current_page: 1,
      page_size: 50,
      has_next: false,
      has_prev: false,
      results: [],
      available_letters: [],
      letter_counts: {},
    };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { sort?: string; order?: string; filter?: string; letter?: string; page?: string };
}) {
  const sort = searchParams.sort || 'title';
  const order = searchParams.order || 'asc';
  const filter = searchParams.filter || 'all';
  const letter = searchParams.letter;
  const page = parseInt(searchParams.page || '1', 10);

  const data = await getCatalogData(sort, order, filter, letter, page);

  return (
    <div className="container py-8 md:py-16 font-mono">
      <div className="mb-6 md:mb-8">
        <h1
          className={`text-3xl sm:text-4xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight ${TEXT.primary}`}

        >
          Full Catalog
        </h1>
        <p
          className={`text-base sm:text-lg md:text-xl ${TEXT.mutedMedium}`}

        >
          {letter ? (
            <>Showing {data.count} book{data.count !== 1 ? 's' : ''} starting with "{letter}"</>
          ) : (
            <>Browse all books and their screen adaptations</>
          )}
        </p>
      </div>

      <CatalogClient
        data={data}
        currentSort={sort}
        currentOrder={order}
        currentFilter={filter}
        currentLetter={letter}
      />
    </div>
  );
}
