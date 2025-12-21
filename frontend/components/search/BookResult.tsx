import Link from 'next/link';
import Image from 'next/image';
import { BookIcon } from './icons';
import type { Work } from '@/lib/types';

interface BookResultProps {
  book: Work;
}

export default function BookResult({ book }: BookResultProps): JSX.Element {
  return (
    <Link
      href={`/book/${book.slug}`}
      className="block border border-border rounded-lg p-4 hover:bg-muted/10 transition-colors"
    >
      <div className="flex gap-4">
        {/* Cover Image */}
        <div className="flex-shrink-0 w-16 h-24 bg-muted rounded flex items-center justify-center overflow-hidden">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={`${book.title} cover`}
              width={64}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <BookIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2">{book.title}</h3>
            {book.year && (
              <span className="text-sm text-muted flex-shrink-0">
                {book.year}
              </span>
            )}
          </div>

          {book.summary && (
            <p className="text-sm text-muted mt-1 line-clamp-2">
              {book.summary}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
              Book
            </span>
            <span className="text-xs text-link hover:underline">
              View adaptations →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
