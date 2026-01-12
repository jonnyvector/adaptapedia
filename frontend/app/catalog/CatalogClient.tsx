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
  available_genres: string[];
  genre_counts: Record<string, number>;
}

interface CatalogClientProps {
  data: CatalogData;
  currentSort: string;
  currentOrder: string;
  currentGenre?: string;
  currentLetter?: string;
}

export default function CatalogClient({
  data,
  currentSort,
  currentOrder,
  currentGenre,
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
    available_genres: data?.available_genres || [],
    genre_counts: data?.genre_counts || {},
  };

  const buildQueryString = (params: Record<string, string>) => {
    const query = new URLSearchParams(params);
    return `?${query.toString()}`;
  };

  const buildLetterUrl = (letter: string) => {
    const params: Record<string, string> = {
      sort: currentSort,
      order: currentOrder,
    };
    if (letter) params.letter = letter;
    if (currentGenre) params.genre = currentGenre;
    return `/catalog${buildQueryString(params)}`;
  };

  return (
    <div className="font-mono">
      {/* Alphabet Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {/* "All" button */}
          <Link
            href={buildLetterUrl('')}
            className={`px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center border ${BORDERS.medium} ${
              !currentLetter
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black'
            } transition-colors ${TEXT.body} font-bold ${monoUppercase}`}
          >
            All
          </Link>

          {/* Letter navigation */}
          {safeData.available_letters.map((letter) => {
            const count = safeData.letter_counts[letter] || 0;
            const hasBooks = count > 0;

            return (
              <Link
                key={letter}
                href={buildLetterUrl(letter)}
                className={`px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center border ${BORDERS.medium} ${
                  currentLetter === letter
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : hasBooks
                    ? 'bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black'
                    : 'bg-stone-50 dark:bg-stone-950 text-stone-300 dark:text-stone-700 cursor-not-allowed'
                } transition-colors ${TEXT.body} font-bold ${monoUppercase}`}
                title={`${count} book${count !== 1 ? 's' : ''}`}
                onClick={(e) => {
                  if (!hasBooks) {
                    e.preventDefault();
                  }
                }}
              >
                {currentGenre ? `${letter} (${count})` : letter}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Compact Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Genre */}
        <div className="flex items-center gap-2">
          <label className={`${TEXT.metadata} ${TEXT.mutedMedium} ${monoUppercase}`}>Genre:</label>
          <div className="relative">
            <select
              value={currentGenre || ''}
              onChange={(e) => {
                const params: Record<string, string> = {
                  sort: currentSort,
                  order: currentOrder,
                };
                if (e.target.value) {
                  params.genre = e.target.value;
                }
                if (currentLetter) {
                  params.letter = currentLetter;
                }
                router.push(`/catalog${buildQueryString(params)}`);
              }}
              className={`appearance-none pl-3 pr-8 py-1.5 ${TEXT.secondary} border ${BORDERS.subtle} ${RADIUS.input} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
            >
              <option value="">All</option>
              {safeData.available_genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre} ({safeData.genre_counts[genre]})
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className={`${TEXT.metadata} ${TEXT.mutedMedium} ${monoUppercase}`}>Sort:</label>
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => {
                const params: Record<string, string> = {
                  sort: e.target.value,
                  order: currentOrder,
                };
                if (currentGenre) params.genre = currentGenre;
                if (currentLetter) params.letter = currentLetter;
                router.push(`/catalog${buildQueryString(params)}`);
              }}
              className={`appearance-none pl-3 pr-8 py-1.5 ${TEXT.secondary} border ${BORDERS.subtle} ${RADIUS.input} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
            >
              <option value="title">Title</option>
              <option value="year">Year</option>
              <option value="adaptations">Adaptations</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Order */}
        <div className="flex items-center gap-2">
          <label className={`${TEXT.metadata} ${TEXT.mutedMedium} ${monoUppercase}`}>Order:</label>
          <div className="relative">
            <select
              value={currentOrder}
              onChange={(e) => {
                const params: Record<string, string> = {
                  sort: currentSort,
                  order: e.target.value,
                };
                if (currentGenre) params.genre = currentGenre;
                if (currentLetter) params.letter = currentLetter;
                router.push(`/catalog${buildQueryString(params)}`);
              }}
              className={`appearance-none pl-3 pr-8 py-1.5 ${TEXT.secondary} border ${BORDERS.subtle} ${RADIUS.input} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className={`ml-auto ${TEXT.metadata} ${TEXT.mutedMedium}`}>
          {safeData.count} book{safeData.count !== 1 ? 's' : ''}
          {safeData.total_pages > 1 && ` • Page ${safeData.current_page} of ${safeData.total_pages}`}
        </div>
      </div>

      {/* Active Filter Chips */}
      {(currentGenre || currentLetter) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentGenre && (
            <div className={`inline-flex items-center gap-2 px-2 py-0.5 border ${BORDERS.subtle} bg-stone-100 dark:bg-stone-900 ${TEXT.metadata} ${TEXT.mutedMedium}`}>
              <span>Genre: {currentGenre}</span>
              <button
                onClick={() => {
                  const params: Record<string, string> = {
                    sort: currentSort,
                    order: currentOrder,
                  };
                  if (currentLetter) params.letter = currentLetter;
                  router.push(`/catalog${buildQueryString(params)}`);
                }}
                className="hover:opacity-70 transition-opacity text-sm"
                aria-label="Remove genre filter"
              >
                ×
              </button>
            </div>
          )}
          {currentLetter && (
            <div className={`inline-flex items-center gap-2 px-2 py-0.5 border ${BORDERS.subtle} bg-stone-100 dark:bg-stone-900 ${TEXT.metadata} ${TEXT.mutedMedium}`}>
              <span>Letter: {currentLetter}</span>
              <button
                onClick={() => {
                  const params: Record<string, string> = {
                    sort: currentSort,
                    order: currentOrder,
                  };
                  if (currentGenre) params.genre = currentGenre;
                  router.push(`/catalog${buildQueryString(params)}`);
                }}
                className="hover:opacity-70 transition-opacity text-sm"
                aria-label="Remove letter filter"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

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
              ...(currentGenre && { genre: currentGenre }),
              ...(currentLetter && { letter: currentLetter }),
            }}
          />
        </>
      ) : (
        <div className={`text-center py-12`}>
          {currentGenre && currentLetter ? (
            <div className="space-y-4">
              <p className={`${TEXT.body} ${TEXT.mutedMedium}`}>
                No {currentGenre} titles starting with &quot;{currentLetter}&quot;
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    const params: Record<string, string> = {
                      sort: currentSort,
                      order: currentOrder,
                      genre: currentGenre,
                    };
                    router.push(`/catalog${buildQueryString(params)}`);
                  }}
                  className={`px-4 py-2 min-h-[44px] border ${BORDERS.medium} bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-colors ${TEXT.body} font-bold`}
                >
                  Show all {currentGenre}
                </button>
                <button
                  onClick={() => {
                    const params: Record<string, string> = {
                      sort: currentSort,
                      order: currentOrder,
                      letter: currentLetter,
                    };
                    router.push(`/catalog${buildQueryString(params)}`);
                  }}
                  className={`px-4 py-2 min-h-[44px] border ${BORDERS.medium} bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-colors ${TEXT.body} font-bold`}
                >
                  Show all &quot;{currentLetter}&quot;
                </button>
              </div>
            </div>
          ) : (
            <p className={`${TEXT.mutedMedium}`}>No books found.</p>
          )}
        </div>
      )}
    </div>
  );
}
