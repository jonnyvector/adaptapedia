'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon, TvIcon } from '@/components/ui/Icons';

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
    <div>
      {/* Filters and Search */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-full"
            >
              <option value="title">Title</option>
              <option value="year">Year</option>
              <option value="adaptations">Adaptations</option>
            </select>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium mb-2">Order</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="input w-full"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input w-full"
            >
              <option value="all">All ({initialData.count})</option>
              <option value="with-covers">With Covers ({withCovers})</option>
              <option value="without-covers">Without Covers ({withoutCovers})</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted">
          Showing {filteredBooks.length} of {initialData.count} books
        </div>
      </div>

      {/* Alphabetical Index */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sortedLetters.map((letter) => (
          <a
            key={letter}
            href={`#${letter}`}
            className="px-3 py-1 rounded bg-surface2 hover:bg-primary hover:text-white transition-colors text-sm font-medium"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Books grouped by letter */}
      {sortedLetters.map((letter) => (
        <div key={letter} id={letter} className="mb-12">
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b border-border">
            {letter}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedBooks[letter].map((book) => (
              <div key={book.id} className="card p-4 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <div className="flex-shrink-0 w-24 h-36 bg-surface2 rounded overflow-hidden relative">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted text-center p-2">
                        No Cover
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold mb-1 leading-tight">
                      <Link
                        href={`/book/${book.slug}`}
                        className="hover:text-link transition-colors"
                      >
                        {book.title}
                      </Link>
                    </h3>
                    {book.author && (
                      <p className="text-sm text-muted mb-1">{book.author}</p>
                    )}
                    <p className="text-xs text-muted mb-3">{book.year}</p>

                    {/* Adaptations */}
                    {book.adaptation_count > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                          {book.adaptation_count} Adaptation
                          {book.adaptation_count > 1 ? 's' : ''}
                        </p>
                        <div className="space-y-1">
                          {book.adaptations.slice(0, 3).map((adaptation) => (
                            <Link
                              key={adaptation.id}
                              href={`/compare/${book.slug}/${adaptation.slug}`}
                              className="flex items-center gap-1.5 text-xs text-link hover:underline"
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
                            <p className="text-xs text-muted">
                              +{book.adaptations.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">No adaptations yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filteredBooks.length === 0 && (
        <div className="text-center py-12 text-muted">
          <p>No books found matching your search.</p>
        </div>
      )}
    </div>
  );
}
