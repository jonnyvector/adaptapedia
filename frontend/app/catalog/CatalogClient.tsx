'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FilmIcon, TvIcon } from '@/components/ui/Icons';
import Pagination from '@/components/ui/Pagination';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

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

interface CatalogData {
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

interface CatalogClientProps {
  data: CatalogData;
  currentSort: string;
  currentOrder: string;
  currentFilter: string;
  currentLetter?: string;
}

export default function CatalogClient({
  data,
  currentSort,
  currentOrder,
  currentFilter,
  currentLetter,
}: CatalogClientProps) {
  const router = useRouter();

  // Defensive: ensure data has required properties
  const safeData = {
    count: data?.count || 0,
    total_pages: data?.total_pages || 0,
    current_page: data?.current_page || 1,
    page_size: data?.page_size || 50,
    has_next: data?.has_next || false,
    has_prev: data?.has_prev || false,
    results: data?.results || [],
    available_letters: data?.available_letters || [],
    letter_counts: data?.letter_counts || {},
  };

  const buildQueryString = (params: Record<string, string>) => {
    const query = new URLSearchParams(params);
    return `?${query.toString()}`;
  };

  const buildLetterUrl = (letter: string) => {
    return `/catalog${buildQueryString({
      letter,
      sort: currentSort,
      order: currentOrder,
      filter: currentFilter,
    })}`;
  };

  // Calculate "with covers" and "without covers" counts
  // Note: These counts are approximate since we're only looking at current page
  const withCovers = safeData.results.filter((b) => b.cover_url).length;
  const withoutCovers = safeData.results.filter((b) => !b.cover_url).length;

  return (
    <div className="font-mono">
      {/* Alphabet Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {/* Letter navigation */}
          {safeData.available_letters.map((letter) => (
            <Link
              key={letter}
              href={buildLetterUrl(letter)}
              className={`px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center border ${BORDERS.medium} ${
                currentLetter === letter
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black'
              } transition-colors ${TEXT.body} font-bold ${monoUppercase}`}
              title={`${safeData.letter_counts[letter]} books`}
            >
              {letter}
            </Link>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className={`border ${BORDERS.medium} p-6 mb-8 bg-white dark:bg-black`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sort By */}
          <div>
            <label className={`block ${TEXT.metadata} font-bold mb-2 ${monoUppercase}`}>Sort By</label>
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => {
                  const params: Record<string, string> = {
                    sort: e.target.value,
                    order: currentOrder,
                    filter: currentFilter,
                  };
                  if (currentLetter) params.letter = currentLetter;
                  router.push(`/catalog${buildQueryString(params)}`);
                }}
                className={`w-full appearance-none pl-3 pr-8 py-2 min-h-[44px] ${TEXT.body} border ${BORDERS.medium} ${RADIUS.input} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
              >
                <option value="title">Title</option>
                <option value="year">Year</option>
                <option value="adaptations">Adaptations</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Order */}
          <div>
            <label className={`block ${TEXT.metadata} font-bold mb-2 ${monoUppercase}`}>Order</label>
            <div className="relative">
              <select
                value={currentOrder}
                onChange={(e) => {
                  const params: Record<string, string> = {
                    sort: currentSort,
                    order: e.target.value,
                    filter: currentFilter,
                  };
                  if (currentLetter) params.letter = currentLetter;
                  router.push(`/catalog${buildQueryString(params)}`);
                }}
                className={`w-full appearance-none pl-3 pr-8 py-2 min-h-[44px] ${TEXT.body} border ${BORDERS.medium} ${RADIUS.input} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div>
            <label className={`block ${TEXT.metadata} font-bold mb-2 ${monoUppercase}`}>Filter</label>
            <div className="relative">
              <select
                value={currentFilter}
                onChange={(e) => {
                  const params: Record<string, string> = {
                    sort: currentSort,
                    order: currentOrder,
                    filter: e.target.value,
                  };
                  if (currentLetter) params.letter = currentLetter;
                  router.push(`/catalog${buildQueryString(params)}`);
                }}
                className={`w-full appearance-none pl-3 pr-8 py-2 min-h-[44px] ${TEXT.body} border ${BORDERS.medium} ${RADIUS.input} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
              >
                <option value="all">All</option>
                <option value="with-covers">With Covers</option>
                <option value="without-covers">Without Covers</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-4 ${TEXT.secondary} ${TEXT.mutedMedium}`}>
          Showing {safeData.results.length} of {safeData.count} books
          {currentLetter && ` (Letter: ${currentLetter})`}
          {safeData.total_pages > 1 && ` • Page ${safeData.current_page} of ${safeData.total_pages}`}
        </div>
      </div>

      {/* Books Grid */}
      {safeData.results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {safeData.results.map((book) => (
              <div key={book.id} className={`border ${BORDERS.medium} p-4 hover:border-black hover:dark:border-white transition-colors bg-white dark:bg-black`}>
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <div className={`flex-shrink-0 w-24 h-36 bg-stone-50 dark:bg-stone-950 border ${BORDERS.subtle} overflow-hidden relative`}>
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${TEXT.metadata} ${TEXT.mutedMedium} text-center p-2 ${monoUppercase}`}>
                        No Cover
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold mb-1 leading-tight ${TEXT.body}`}>
                      <Link
                        href={`/book/${book.slug}`}
                        className={`${TEXT.primary} hover:underline transition-colors`}
                      >
                        {book.title}
                      </Link>
                    </h3>
                    {book.author && (
                      <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-1`}>{book.author}</p>
                    )}
                    <p className={`${TEXT.metadata} ${TEXT.mutedMedium} mb-3 ${monoUppercase}`}>{book.year}</p>

                    {/* Adaptations */}
                    {book.adaptation_count > 0 ? (
                      <div className="space-y-1.5">
                        <p className={`${TEXT.metadata} font-bold ${TEXT.mutedMedium} ${monoUppercase}`}>
                          {book.adaptation_count} Adaptation
                          {book.adaptation_count > 1 ? 's' : ''}
                        </p>
                        <div className="space-y-1">
                          {book.adaptations.slice(0, 3).map((adaptation) => (
                            <Link
                              key={adaptation.id}
                              href={`/compare/${book.slug}/${adaptation.slug}`}
                              className={`flex items-center gap-1.5 ${TEXT.secondary} ${TEXT.primary} hover:underline`}
                            >
                              {adaptation.type === 'MOVIE' ? (
                                <FilmIcon className="w-3.5 h-3.5 flex-shrink-0" />
                              ) : (
                                <TvIcon className="w-3.5 h-3.5 flex-shrink-0" />
                              )}
                              <span>{adaptation.title} ({adaptation.year})</span>
                            </Link>
                          ))}
                          {book.adaptations.length > 3 && (
                            <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`}>
                              +{book.adaptations.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`}>No adaptations yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={safeData.current_page}
            totalPages={safeData.total_pages}
            basePath="/catalog"
            searchParams={{
              sort: currentSort,
              order: currentOrder,
              filter: currentFilter,
              ...(currentLetter && { letter: currentLetter }),
            }}
          />
        </>
      ) : (
        <div className={`text-center py-12 ${TEXT.mutedMedium}`}>
          <p>No books found.</p>
        </div>
      )}
    </div>
  );
}
