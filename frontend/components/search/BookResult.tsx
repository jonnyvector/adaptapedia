import Link from 'next/link';
import Image from 'next/image';
import { BookIcon } from './icons';
import type { Work } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase, COLORS, RADIUS} from '@/lib/brutalist-design';

interface BookResultProps {
  book: Work;
}

export default function BookResult({ book }: BookResultProps): JSX.Element {
  return (
    <Link
      href={`/book/${book.slug}`}
      className={`block border ${BORDERS.medium} ${RADIUS.control} p-4 hover:border-black hover:dark:border-white transition-colors bg-white dark:bg-black`}
    >
      <div className="flex gap-4">
        {/* Cover Image */}
        <div className={`flex-shrink-0 w-16 h-24 bg-stone-50 dark:bg-stone-950 ${RADIUS.control} border ${BORDERS.medium} flex items-center justify-center overflow-hidden`}>
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={`${book.title} cover`}
              width={64}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <BookIcon className="w-8 h-8 text-black/30 dark:text-white/30" />
          )}
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-bold ${TEXT.body} line-clamp-2 text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>{book.title}</h3>
            {book.year && (
              <span className={`${TEXT.secondary} ${TEXT.mutedMedium} flex-shrink-0`} style={{ fontFamily: FONTS.mono }}>
                {book.year}
              </span>
            )}
          </div>

          {book.summary && (
            <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-1 line-clamp-2`} style={{ fontFamily: FONTS.mono }}>
              {book.summary}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 ${RADIUS.control} border ${BORDERS.solid} ${TEXT.metadata} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide, backgroundColor: COLORS.book, color: 'white' }}>
              Book
            </span>
            <span className={`${TEXT.metadata} text-black dark:text-white hover:opacity-70`} style={{ fontFamily: FONTS.mono }}>
              View adaptations →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
