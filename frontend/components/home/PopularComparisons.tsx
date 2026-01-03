'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpenIcon, FilmIcon } from '@/components/ui/Icons';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface PopularComparison {
  book: {
    id: number;
    title: string;
    author: string;
    cover_url?: string;
    slug: string;
  };
  screen: {
    id: number;
    title: string;
    year: number;
    poster_url?: string;
    slug: string;
  };
  comparison_url: string;
}

// Hardcoded popular comparisons - in the future this could come from API
const POPULAR_COMPARISONS: PopularComparison[] = [
  {
    book: {
      id: 3108,
      title: "Harry Potter and the Philosopher's Stone",
      author: 'J.K. Rowling',
      cover_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Harry_Potter_and_the_Philosopher%27s_Stone_Book_Cover.jpg/250px-Harry_Potter_and_the_Philosopher%27s_Stone_Book_Cover.jpg',
      slug: 'harry-potter-and-the-philosophers-stone',
    },
    screen: {
      id: 6749,
      title: "Harry Potter and the Sorcerer's Stone",
      year: 2001,
      poster_url: 'https://image.tmdb.org/t/p/w780/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
      slug: 'harry-potter-and-the-sorcerers-stone',
    },
    comparison_url: '/compare/harry-potter-and-the-philosophers-stone/harry-potter-and-the-sorcerers-stone',
  },
  {
    book: {
      id: 3116,
      title: 'The Hunger Games',
      author: 'Suzanne Collins',
      cover_url: 'https://books.google.com/books/content?id=Yz8Fnw0PlEQC&printsec=frontcover&img=1&source=gbs_api&zoom=3',
      slug: 'the-hunger-games',
    },
    screen: {
      id: 6759,
      title: 'The Hunger Games',
      year: 2012,
      poster_url: 'https://image.tmdb.org/t/p/w780/yXCbOiVDCxO71zI7cuwBRXdftq8.jpg',
      slug: 'the-hunger-games',
    },
    comparison_url: '/compare/the-hunger-games/the-hunger-games',
  },
  {
    book: {
      id: 3194,
      title: 'The Fellowship of the Ring',
      author: 'J.R.R. Tolkien',
      cover_url: 'https://upload.wikimedia.org/wikipedia/en/8/8e/The_Fellowship_of_the_Ring_cover.gif',
      slug: 'the-fellowship-of-the-ring',
    },
    screen: {
      id: 6743,
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      year: 2001,
      poster_url: 'https://image.tmdb.org/t/p/w780/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
      slug: 'the-lord-of-the-rings-the-fellowship-of-the-ring',
    },
    comparison_url: '/compare/the-fellowship-of-the-ring/the-lord-of-the-rings-the-fellowship-of-the-ring',
  },
  {
    book: {
      id: 3129,
      title: 'Twilight',
      author: 'Stephenie Meyer',
      cover_url: 'https://books.google.com/books/content?id=ZfjzX7M8zt0C&printsec=frontcover&img=1&source=gbs_api&zoom=3',
      slug: 'twilight',
    },
    screen: {
      id: 6780,
      title: 'Twilight',
      year: 2008,
      poster_url: 'https://image.tmdb.org/t/p/w780/3Gkb6jm6962ADUPaCBqzz9CTbn9.jpg',
      slug: 'twilight',
    },
    comparison_url: '/compare/twilight/twilight',
  },
  {
    book: {
      id: 3131,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      cover_url: 'https://books.google.com/books/content?id=ooj9DwAAQBAJ&printsec=frontcover&img=1&source=gbs_api&zoom=3',
      slug: 'the-great-gatsby',
    },
    screen: {
      id: 6786,
      title: 'The Great Gatsby',
      year: 2013,
      poster_url: 'https://image.tmdb.org/t/p/w780/tyxfCBQv6Ap74jcu3xd7aBiaa29.jpg',
      slug: 'the-great-gatsby',
    },
    comparison_url: '/compare/the-great-gatsby/the-great-gatsby',
  },
  {
    book: {
      id: 3130,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      cover_url: 'https://books.google.com/books/content?id=ayJpGQeyxgkC&printsec=frontcover&img=1&source=gbs_api&zoom=3',
      slug: 'to-kill-a-mockingbird',
    },
    screen: {
      id: 6785,
      title: 'To Kill a Mockingbird',
      year: 1962,
      poster_url: 'https://image.tmdb.org/t/p/w780/gZycFUMLx2110dzK3nBNai7gfpM.jpg',
      slug: 'to-kill-a-mockingbird',
    },
    comparison_url: '/compare/to-kill-a-mockingbird/to-kill-a-mockingbird',
  },
];

export default function PopularComparisons() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {POPULAR_COMPARISONS.map((comparison, index) => (
        <Link
          key={index}
          href={comparison.comparison_url}
          className="group block"
        >
          <div className="relative aspect-[2/3] overflow-hidden bg-stone-100 dark:bg-stone-900 mb-2 transition-transform group-hover:scale-105">
            {/* Book Cover and Movie Poster side by side */}
            <div className="flex h-full">
              {/* Book Cover - Left Half */}
              <div className="flex-1 relative overflow-hidden border-r-2 border-black/20 dark:border-white/20">
                {comparison.book.cover_url ? (
                  <Image
                    src={comparison.book.cover_url}
                    alt={comparison.book.title}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 25vw, (max-width: 1024px) 16vw, 8vw"
                  />
                ) : (
                  <div className={`absolute inset-0 flex items-center justify-center bg-stone-200 dark:bg-stone-800 ${TEXT.mutedMedium} ${TEXT.metadata}`} style={{ fontFamily: FONTS.mono }}>
                    No Cover
                  </div>
                )}
                {/* Book label */}
                <div className="absolute top-1 left-1">
                  <span className={`${TEXT.metadata} font-bold px-1.5 py-0.5 bg-black/80 text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                    BOOK
                  </span>
                </div>
              </div>

              {/* VS Divider */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className={`bg-black dark:bg-white text-white dark:text-black px-2.5 py-1 font-bold ${TEXT.metadata} border ${BORDERS.solid} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                  VS
                </div>
              </div>

              {/* Movie Poster - Right Half */}
              <div className="flex-1 relative overflow-hidden">
                {comparison.screen.poster_url ? (
                  <Image
                    src={comparison.screen.poster_url}
                    alt={comparison.screen.title}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 25vw, (max-width: 1024px) 16vw, 8vw"
                  />
                ) : (
                  <div className={`absolute inset-0 flex items-center justify-center bg-stone-200 dark:bg-stone-800 ${TEXT.mutedMedium} ${TEXT.metadata}`} style={{ fontFamily: FONTS.mono }}>
                    No Poster
                  </div>
                )}
                {/* Screen label */}
                <div className="absolute top-1 right-1">
                  <span className={`${TEXT.metadata} font-bold px-1.5 py-0.5 bg-black/80 text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                    SCREEN
                  </span>
                </div>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 dark:bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className={`text-white dark:text-black font-bold ${TEXT.secondary} px-2 text-center ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}>
                Compare
              </span>
            </div>
          </div>

          {/* Title */}
          <div className={`${TEXT.secondary} font-bold line-clamp-2 mb-1 text-black dark:text-white group-hover:opacity-70 transition-opacity`} style={{ fontFamily: FONTS.sans }}>
            {comparison.book.title}
          </div>
          <div className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.sans }}>
            {comparison.book.author}
          </div>
        </Link>
      ))}
    </div>
  );
}
