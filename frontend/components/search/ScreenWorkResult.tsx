import Link from 'next/link';
import Image from 'next/image';
import { FilmIcon, TvIcon } from './icons';
import type { ScreenWork } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase, COLORS, RADIUS} from '@/lib/brutalist-design';

interface ScreenWorkResultProps {
  screenWork: ScreenWork;
}

export default function ScreenWorkResult({
  screenWork,
}: ScreenWorkResultProps): JSX.Element {
  const isMovie = screenWork.type === 'MOVIE';

  return (
    <Link
      href={`/screen/${screenWork.slug}`}
      className={`block border ${BORDERS.medium} ${RADIUS.control} p-4 hover:border-black hover:dark:border-white transition-colors bg-white dark:bg-black`}
    >
      <div className="flex gap-4">
        {/* Poster Image */}
        <div className={`flex-shrink-0 w-16 h-24 bg-stone-50 dark:bg-stone-950 ${RADIUS.control} border ${BORDERS.medium} flex items-center justify-center overflow-hidden`}>
          {screenWork.poster_url ? (
            <Image
              src={screenWork.poster_url}
              alt={`${screenWork.title} poster`}
              width={64}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <>
              {isMovie ? (
                <FilmIcon className="w-8 h-8 text-black/30 dark:text-white/30" />
              ) : (
                <TvIcon className="w-8 h-8 text-black/30 dark:text-white/30" />
              )}
            </>
          )}
        </div>

        {/* Screen Work Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-bold ${TEXT.body} line-clamp-2 text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
              {screenWork.title}
            </h3>
            {screenWork.year && (
              <span className={`${TEXT.secondary} ${TEXT.mutedMedium} flex-shrink-0`} style={{ fontFamily: FONTS.mono }}>
                {screenWork.year}
              </span>
            )}
          </div>

          {screenWork.summary && (
            <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mt-1 line-clamp-2`} style={{ fontFamily: FONTS.mono }}>
              {screenWork.summary}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 ${RADIUS.control} border ${BORDERS.solid} ${TEXT.metadata} font-bold ${monoUppercase}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide, backgroundColor: COLORS.screen, color: 'white' }}
            >
              {isMovie ? (
                <>
                  <FilmIcon className="w-3 h-3 mr-1" />
                  Movie
                </>
              ) : (
                <>
                  <TvIcon className="w-3 h-3 mr-1" />
                  TV
                </>
              )}
            </span>
            <span className={`${TEXT.metadata} text-black dark:text-white hover:opacity-70`} style={{ fontFamily: FONTS.mono }}>
              View source books →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
