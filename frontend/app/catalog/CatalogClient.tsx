'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon, TvIcon } from '@/components/ui/Icons';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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

interface CatalogClientProps {
  initialData: CatalogResponse;
  initialSort: string;
  initialOrder: string;
  initialFilter: string;
}

export default function CatalogClient({
  initialData,
  initialSort,
  initialOrder,
  initialFilter,
}: CatalogClientProps) {
  const [sortBy, setSortBy] = useState(initialSort);
  const [order, setOrder] = useState(initialOrder);
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search client-side
  const filteredBooks = useMemo(() => {
    let books = initialData.results;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(search) ||
          book.author?.toLowerCase().includes(search)
      );
    }

    // Sort
    books = [...books].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'year') {
        comparison = a.year - b.year;
      } else if (sortBy === 'adaptations') {
        comparison = a.adaptation_count - b.adaptation_count;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return books;
  }, [initialData.results, searchTerm, sortBy, order]);

  // Group by first letter
  const groupedBooks = useMemo(() => {
    const groups: Record<string, CatalogBook[]> = {};

    filteredBooks.forEach((book) => {
      let firstChar = book.title[0].toUpperCase();
      // Handle "The" prefix
      if (book.title.toLowerCase().startsWith('the ')) {
        firstChar = book.title[4].toUpperCase();
      }
      // Numbers
      if (/\d/.test(firstChar)) {
        firstChar = '#';
      }

      if (!groups[firstChar]) {
        groups[firstChar] = [];
      }
      groups[firstChar].push(book);
    });

    return groups;
  }, [filteredBooks]);

  const sortedLetters = Object.keys(groupedBooks).sort((a, b) => {
    if (a === '#') return -1;
    if (b === '#') return 1;
    return a.localeCompare(b);
  });

  // Count books with/without covers
  const withCovers = initialData.results.filter((b) => b.cover_url).length;
  const withoutCovers = initialData.results.filter((b) => !b.cover_url).length;

  return (
    <div className="font-mono">
      {/* Filters and Search */}
      <div className={`border ${BORDERS.medium} p-6 mb-8 bg-white dark:bg-black`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className={`block ${TEXT.metadata} font-bold mb-2 ${monoUppercase}`}>Search</label>
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 ${TEXT.body} border ${BORDERS.medium} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
             
            />
          </div>

          {/* Sort By */}
          <div>
            <label className={`block ${TEXT.metadata} font-bold mb-2 ${monoUppercase}`}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full px-3 py-2 ${TEXT.body} border ${BORDERS.medium} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
             
            >
              <option value="title">Title</option>
              <option value="year">Year</option>
              <option value="adaptations">Adaptations</option>
            </select>
          </div>

          {/* Order */}
          <div>
            <label className={`block ${TEXT.metadata} font-bold mb-2 ${monoUppercase}`}>Order</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className={`w-full px-3 py-2 ${TEXT.body} border ${BORDERS.medium} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
             
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className={`block ${TEXT.metadata} font-bold mb-2 ${monoUppercase}`}>Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`w-full px-3 py-2 ${TEXT.body} border ${BORDERS.medium} bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black focus:dark:border-white`}
             
            >
              <option value="all">All ({initialData.count})</option>
              <option value="with-covers">With Covers ({withCovers})</option>
              <option value="without-covers">Without Covers ({withoutCovers})</option>
            </select>
          </div>
        </div>

        <div className={`mt-4 ${TEXT.secondary} ${TEXT.mutedMedium}`}>
          Showing {filteredBooks.length} of {initialData.count} books
        </div>
      </div>

      {/* Alphabetical Index */}
      <div className="mb-8 flex flex-wrap gap-2">
        {sortedLetters.map((letter) => (
          <a
            key={letter}
            href={`#${letter}`}
            className={`px-3 py-1.5 border ${BORDERS.medium} bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-colors ${TEXT.body} ${TEXT.primary} font-bold ${monoUppercase}`}
           
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Books grouped by letter */}
      {sortedLetters.map((letter) => (
        <div key={letter} id={letter} className="mb-16">
          <h2
            className={`text-4xl font-black mb-6 pb-3 border-b ${BORDERS.medium} tracking-tight ${TEXT.primary}`}
           
          >
            {letter}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedBooks[letter].map((book) => (
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
        </div>
      ))}

      {filteredBooks.length === 0 && (
        <div className={`text-center py-12 ${TEXT.mutedMedium}`}>
          <p>No books found matching your search.</p>
        </div>
      )}
    </div>
  );
}
