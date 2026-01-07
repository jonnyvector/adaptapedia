import { Metadata } from 'next';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';
import CatalogClient from './CatalogClient';
import { FONTS, TEXT } from '@/lib/brutalist-design';

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
  results: CatalogBook[];
}

async function getCatalogData(
  sort: string = 'title',
  order: string = 'asc',
  filter: string = 'all'
): Promise<CatalogResponse> {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:8000/api';
    const params = new URLSearchParams({ sort, order, filter });
    const res = await fetch(
      `${API_URL}/works/catalog/?${params}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch catalog');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return { count: 0, results: [] };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { sort?: string; order?: string; filter?: string };
}) {
  const sort = searchParams.sort || 'title';
  const order = searchParams.order || 'asc';
  const filter = searchParams.filter || 'all';

  const data = await getCatalogData(sort, order, filter);

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
          Browse all {data.count} books and their screen adaptations
        </p>
      </div>

      <CatalogClient initialData={data} initialSort={sort} initialOrder={order} initialFilter={filter} />
    </div>
  );
}
