import type { SimilarBook } from '@/lib/types';
import Link from 'next/link';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface SimilarBooksProps {
  books: SimilarBook[];
}

export default function SimilarBooks({ books }: SimilarBooksProps): JSX.Element | null {
  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className={`mt-8 border-t ${BORDERS.subtle} pt-8`}>
      <h2 className={`text-2xl font-bold mb-4 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>Similar Books</h2>
      <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-6`} style={{ fontFamily: FONTS.mono }}>
        Other books you might be interested in exploring
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/book/${book.slug}`}
            className={`group flex flex-col border ${BORDERS.medium} rounded-md p-3 hover:border-black hover:dark:border-white transition-all bg-white dark:bg-black`}
          >
            {/* Book Cover */}
            <div className={`mb-3 aspect-[2/3] bg-stone-50 dark:bg-stone-950 rounded-md overflow-hidden border ${BORDERS.medium}`}>
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted/50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 flex flex-col min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-link transition-colors mb-1">
                {book.title}
              </h3>

              {book.author && (
                <p className="text-xs text-muted mb-2 line-clamp-1">{book.author}</p>
              )}

              {/* Metadata */}
              <div className="mt-auto flex flex-wrap gap-1 items-center text-xs text-muted">
                {book.year && <span>{book.year}</span>}
                {book.year && book.adaptation_count > 0 && <span>•</span>}
                {book.adaptation_count > 0 && (
                  <span className="font-medium text-link">
                    {book.adaptation_count} {book.adaptation_count === 1 ? 'adaptation' : 'adaptations'}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
