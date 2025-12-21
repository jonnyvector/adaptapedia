import Link from 'next/link';
import Image from 'next/image';
import { FilmIcon, TvIcon } from './icons';
import type { ScreenWork } from '@/lib/types';

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
      className="block border border-border rounded-lg p-4 hover:bg-muted/10 transition-colors"
    >
      <div className="flex gap-4">
        {/* Poster Image */}
        <div className="flex-shrink-0 w-16 h-24 bg-muted rounded flex items-center justify-center overflow-hidden">
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
                <FilmIcon className="w-8 h-8 text-muted-foreground" />
              ) : (
                <TvIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </>
          )}
        </div>

        {/* Screen Work Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2">
              {screenWork.title}
            </h3>
            {screenWork.year && (
              <span className="text-sm text-muted flex-shrink-0">
                {screenWork.year}
              </span>
            )}
          </div>

          {screenWork.summary && (
            <p className="text-sm text-muted mt-1 line-clamp-2">
              {screenWork.summary}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                isMovie
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {isMovie ? (
                <>
                  <FilmIcon className="w-3 h-3 mr-1" />
                  Movie
                </>
              ) : (
                <>
                  <TvIcon className="w-3 h-3 mr-1" />
                  TV Series
                </>
              )}
            </span>
            <span className="text-xs text-link hover:underline">
              View source books →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
