'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { Work, ScreenWork, WatchProvider } from '@/lib/types';
import { BookOpenIcon, FilmIcon, ArrowTopRightOnSquareIcon } from '@/components/ui/Icons';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

interface GetItNowModuleProps {
  work: Work;
  screenWork: ScreenWork;
}

export default function GetItNowModule({ work, screenWork }: GetItNowModuleProps) {
  // Default to US, could be made dynamic based on user location
  const [country] = useState('US');

  // Get watch providers for the selected country
  const providers = useMemo(() => {
    if (!screenWork.watch_providers || !screenWork.watch_providers[country]) {
      return null;
    }
    return screenWork.watch_providers[country];
  }, [screenWork.watch_providers, country]);

  // Determine best streaming option (highest priority flatrate provider)
  const bestStreamingProvider = useMemo(() => {
    if (!providers?.flatrate || providers.flatrate.length === 0) {
      return null;
    }
    // TMDb provides display_priority, lower number = higher priority
    return providers.flatrate.sort((a, b) => a.display_priority - b.display_priority)[0];
  }, [providers]);

  // Get base provider name (strip channel/tier suffixes for deduplication)
  const getBaseProviderName = (name: string): string => {
    return name
      // Normalize "Plus" to "+"
      .replace(/\sPlus\b/gi, '+')
      // Remove channel variants (Amazon Channel, Roku Premium Channel, etc)
      .replace(/\s+(Amazon|Roku|Apple\s*TV)(\s+Premium)?\s+Channel/gi, '')
      // Remove tier/quality variants
      .replace(/\s+(Essential|Premium|Showtime|with\s+Ads)/gi, '')
      // Remove trailing single letters (e.g., "Peacock I" -> "Peacock")
      .replace(/\s+[A-Z]$/g, '')
      .trim();
  };

  // Get other streaming options (excluding the best one and deduplicating similar providers)
  const otherStreamingProviders = useMemo(() => {
    if (!providers?.flatrate || providers.flatrate.length <= 1) {
      return [];
    }

    const bestBaseName = bestStreamingProvider ? getBaseProviderName(bestStreamingProvider.provider_name) : '';
    const seen = new Set<string>([bestBaseName]);

    return providers.flatrate
      .filter(p => {
        if (p.provider_id === bestStreamingProvider?.provider_id) return false;
        const baseName = getBaseProviderName(p.provider_name);
        if (seen.has(baseName)) return false;
        seen.add(baseName);
        return true;
      })
      .sort((a, b) => a.display_priority - b.display_priority)
      .slice(0, 3); // Max 3 additional unique options
  }, [providers, bestStreamingProvider]);

  // Get rent/buy options
  const rentProviders = useMemo(() => {
    if (!providers?.rent) return [];
    return providers.rent.sort((a, b) => a.display_priority - b.display_priority).slice(0, 3);
  }, [providers]);

  const buyProviders = useMemo(() => {
    if (!providers?.buy) return [];
    return providers.buy.sort((a, b) => a.display_priority - b.display_priority).slice(0, 3);
  }, [providers]);

  // Book affiliate link generator (TODO: Replace with actual affiliate IDs)
  const getBookLink = (provider: string) => {
    // TODO: Use ISBN from work.openlibrary_work_id for better targeting
    switch (provider) {
      case 'bookshop':
        return `https://bookshop.org/search?keywords=${encodeURIComponent(work.title)}`;
      case 'amazon-print':
        return `https://www.amazon.com/s?k=${encodeURIComponent(work.title)}&tag=adaptapedia-20`;
      case 'kindle':
        return `https://www.amazon.com/s?k=${encodeURIComponent(work.title)}&i=digital-text&tag=adaptapedia-20`;
      case 'audible':
        return `https://www.audible.com/search?keywords=${encodeURIComponent(work.title)}`;
      default:
        return '#';
    }
  };

  // Watch provider link (uses TMDb's JustWatch link)
  const getWatchLink = () => {
    return providers?.link || '#';
  };

  const adaptationType = screenWork.type === 'MOVIE' ? 'movie' : 'show';

  return (
    <div className={`p-5 sm:p-6 sticky top-40 mt-12 bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium}`}>
      <h3 className={`${TEXT.body} font-bold mb-5 text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
        Where to get it
      </h3>

      {/* Read the Book */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 border-b border-black/10 dark:border-white/10 pb-2">
          <BookOpenIcon className={`w-4 h-4 ${TEXT.mutedMedium}`} />
          <h4 className={`${TEXT.label} font-bold ${TEXT.mutedStrong} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>Read the book</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={getBookLink('bookshop')}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className={`group px-3 py-2.5 ${TEXT.secondary} font-bold border ${BORDERS.medium} bg-white dark:bg-black hover:border-black hover:dark:border-white transition-all text-left flex flex-col ${RADIUS.control}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            <span className={`font-bold text-black dark:text-white flex items-center gap-1 ${monoUppercase}`}>
              Bookshop
              <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-50" />
            </span>
            <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`}>Local stores</span>
          </a>
          <a
            href={getBookLink('amazon-print')}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className={`group px-3 py-2.5 ${TEXT.secondary} font-bold border ${BORDERS.medium} bg-white dark:bg-black hover:border-black hover:dark:border-white transition-all text-left flex flex-col ${RADIUS.control}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            <span className={`font-bold text-black dark:text-white flex items-center gap-1 ${monoUppercase}`}>
              Amazon
              <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-50" />
            </span>
            <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`}>Print book</span>
          </a>
          <a
            href={getBookLink('kindle')}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className={`group px-3 py-2.5 ${TEXT.secondary} font-bold border ${BORDERS.medium} bg-white dark:bg-black hover:border-black hover:dark:border-white transition-all text-left flex flex-col ${RADIUS.control}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            <span className={`font-bold text-black dark:text-white flex items-center gap-1 ${monoUppercase}`}>
              Kindle
              <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-50" />
            </span>
            <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`}>E-book</span>
          </a>
          <a
            href={getBookLink('audible')}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className={`group px-3 py-2.5 ${TEXT.secondary} font-bold border ${BORDERS.medium} bg-white dark:bg-black hover:border-black hover:dark:border-white transition-all text-left flex flex-col ${RADIUS.control}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
          >
            <span className={`font-bold text-black dark:text-white flex items-center gap-1 ${monoUppercase}`}>
              Audible
              <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-50" />
            </span>
            <span className={`${TEXT.metadata} ${TEXT.mutedMedium}`}>Audiobook</span>
          </a>
        </div>
      </div>

      {/* Watch the Movie/Show */}
      <div>
        <div className="flex items-center gap-2 mb-3 border-b border-black/10 dark:border-white/10 pb-2">
          <FilmIcon className={`w-4 h-4 ${TEXT.mutedMedium}`} />
          <h4 className={`${TEXT.label} font-bold ${TEXT.mutedStrong} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
            Watch the {adaptationType}
          </h4>
        </div>

        {bestStreamingProvider ? (
          <div className="space-y-2">
            {/* Best Streaming Option */}
            <a
              href={getWatchLink()}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className={`group w-full px-4 py-3 ${TEXT.secondary} font-bold border ${BORDERS.solid} bg-black dark:bg-white hover:bg-white hover:dark:bg-black transition-all text-left flex items-center justify-between ${RADIUS.control}`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
            >
              <div className="flex items-center gap-3">
                {bestStreamingProvider.logo_path && (
                  <Image
                    src={`https://image.tmdb.org/t/p/original${bestStreamingProvider.logo_path}`}
                    alt={bestStreamingProvider.provider_name}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                )}
                <div>
                  <div className={`font-bold text-white dark:text-black group-hover:text-black group-hover:dark:text-white flex items-center gap-1.5 ${monoUppercase}`}>
                    {bestStreamingProvider.provider_name}
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-50" />
                  </div>
                  <div className={`${TEXT.metadata} text-white/70 dark:text-black/70 group-hover:text-black/70 group-hover:dark:text-white/70`}>Stream now</div>
                </div>
              </div>
              <span className={`${TEXT.metadata} px-2 py-1 border ${BORDERS.medium} bg-stone-100 dark:bg-stone-900 text-black dark:text-white font-bold ${monoUppercase} ${RADIUS.control}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                Best
              </span>
            </a>

            {/* Other Streaming Options */}
            {otherStreamingProviders.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {otherStreamingProviders.map((provider) => (
                  <a
                    key={provider.provider_id}
                    href={getWatchLink()}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className={`group px-3 py-2 ${TEXT.secondary} border ${BORDERS.medium} bg-white dark:bg-black hover:border-black hover:dark:border-white transition-all flex items-center gap-2 ${RADIUS.control}`}
                    style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
                  >
                    {provider.logo_path && (
                      <Image
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        width={24}
                        height={24}
                        className="w-6 h-6 flex-shrink-0"
                      />
                    )}
                    <span className={`${TEXT.metadata} font-bold text-black dark:text-white truncate flex items-center gap-1 ${monoUppercase}`}>
                      {provider.provider_name}
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-50 flex-shrink-0" />
                    </span>
                  </a>
                ))}
              </div>
            )}

            {/* Rent/Buy Options */}
            {(rentProviders.length > 0 || buyProviders.length > 0) && (
              <details className="mt-3">
                <summary className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                  More options
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {rentProviders.slice(0, 2).map((provider) => (
                    <a
                      key={`rent-${provider.provider_id}`}
                      href={getWatchLink()}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="px-2 py-1.5 text-xs border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-surface2 transition-colors flex items-center gap-2"
                      style={{ borderRadius: 'var(--button-radius)' }}
                    >
                      {provider.logo_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                          alt={provider.provider_name}
                          width={20}
                          height={20}
                          className="w-5 h-5 flex-shrink-0"
                          style={{ borderRadius: 'var(--button-radius)' }}
                        />
                      )}
                      <span className="text-gray-700 dark:text-gray-300 truncate">Rent</span>
                    </a>
                  ))}
                  {buyProviders.slice(0, 2).map((provider) => (
                    <a
                      key={`buy-${provider.provider_id}`}
                      href={getWatchLink()}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="px-2 py-1.5 text-xs border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-surface2 transition-colors flex items-center gap-2"
                      style={{ borderRadius: 'var(--button-radius)' }}
                    >
                      {provider.logo_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                          alt={provider.provider_name}
                          width={20}
                          height={20}
                          className="w-5 h-5 flex-shrink-0"
                          style={{ borderRadius: 'var(--button-radius)' }}
                        />
                      )}
                      <span className="text-gray-700 dark:text-gray-300 truncate">Buy</span>
                    </a>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className={`${TEXT.secondary} ${TEXT.mutedMedium} py-4 text-center border border-dashed ${BORDERS.subtle} ${RADIUS.control} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
            Check local streaming services
          </div>
        )}

        {/* Country indicator */}
        {providers && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Available in: United States
          </div>
        )}
      </div>

      {/* Affiliate Disclosure */}
      <div className={`mt-6 pt-4 border-t ${BORDERS.subtle}`}>
        <p className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          Links may earn us a commission.{' '}
          <a href="/about#affiliate" className={`${TEXT.primary} hover:underline font-bold transition-colors`} style={{ fontFamily: FONTS.mono }}>
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
}
