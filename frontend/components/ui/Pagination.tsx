'use client';

import Link from 'next/link';
import { FONTS, TEXT, BORDERS, monoUppercase } from '@/lib/brutalist-design';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ ...searchParams, page: page.toString() });
    return `${basePath}?${params.toString()}`;
  };

  // Show max 5 page numbers
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      // Adjust if at edges
      if (currentPage <= 3) {
        end = maxVisible;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const showFirstLast = totalPages > 5;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className={`px-3 py-2 border ${BORDERS.medium} bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-colors ${TEXT.secondary} font-bold ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          ← Prev
        </Link>
      ) : (
        <span
          className={`px-3 py-2 border ${BORDERS.subtle} bg-stone-50 dark:bg-stone-950 ${TEXT.mutedMedium} ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          ← Prev
        </span>
      )}

      {/* First page if not visible */}
      {showFirstLast && pageNumbers[0] > 1 && (
        <>
          <Link
            href={buildUrl(1)}
            className={`px-3 py-2 border ${BORDERS.medium} bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-colors ${TEXT.secondary} font-bold`}
            style={{ fontFamily: FONTS.mono }}
          >
            1
          </Link>
          {pageNumbers[0] > 2 && (
            <span className={`${TEXT.mutedMedium}`}>...</span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page) => (
        page === currentPage ? (
          <span
            key={page}
            className={`px-3 py-2 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black ${TEXT.secondary} font-bold`}
            style={{ fontFamily: FONTS.mono }}
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`px-3 py-2 border ${BORDERS.medium} bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-colors ${TEXT.secondary} font-bold`}
            style={{ fontFamily: FONTS.mono }}
          >
            {page}
          </Link>
        )
      ))}

      {/* Last page if not visible */}
      {showFirstLast && pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className={`${TEXT.mutedMedium}`}>...</span>
          )}
          <Link
            href={buildUrl(totalPages)}
            className={`px-3 py-2 border ${BORDERS.medium} bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-colors ${TEXT.secondary} font-bold`}
            style={{ fontFamily: FONTS.mono }}
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className={`px-3 py-2 border ${BORDERS.medium} bg-white dark:bg-black hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black transition-colors ${TEXT.secondary} font-bold ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          Next →
        </Link>
      ) : (
        <span
          className={`px-3 py-2 border ${BORDERS.subtle} bg-stone-50 dark:bg-stone-950 ${TEXT.mutedMedium} ${monoUppercase}`}
          style={{ fontFamily: FONTS.mono }}
        >
          Next →
        </span>
      )}
    </div>
  );
}
