import { Metadata } from 'next';
import CatalogClient from './CatalogClient';

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
    const params = new URLSearchParams({ sort, order, filter });
    const res = await fetch(
      `http://backend:8000/api/works/catalog/?${params}`,
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
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Full Catalog</h1>
        <p className="text-lg text-muted">
          Browse all {data.count} books and their screen adaptations
        </p>
      </div>

      <CatalogClient initialData={data} initialSort={sort} initialOrder={order} initialFilter={filter} />
    </div>
  );
}
