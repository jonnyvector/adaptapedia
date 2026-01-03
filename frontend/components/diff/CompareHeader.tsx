'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type {
  Work,
  ScreenWork,
  ComparisonVoteStats,
  RankedAdaptation,
  AdaptationEdge,
  ApiResponse,
} from '@/lib/types';
import { api } from '@/lib/api';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase, COLORS } from '@/lib/brutalist-design';

interface CompareHeaderProps {
  work: Work;
  screenWork: ScreenWork;
  diffCount: number;
}

export default function CompareHeader({
  work,
  screenWork,
  diffCount,
}: CompareHeaderProps): JSX.Element {
  const router = useRouter();
  const [stats, setStats] = useState<ComparisonVoteStats | null>(null);
  const [adaptations, setAdaptations] = useState<Array<ScreenWork & { adaptationEdge: AdaptationEdge }>>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAdaptations, setLoadingAdaptations] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.comparisonVotes.getStats(work.id, screenWork.id);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch voting stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchAdaptations = async () => {
      try {
        const response = (await api.adaptations.byWork(work.id)) as ApiResponse<AdaptationEdge>;
        const adaptationsList = response.results.map((edge) => ({
          ...edge.screen_work_detail,
          adaptationEdge: edge,
        }));
        setAdaptations(adaptationsList);
      } catch (err) {
        console.error('Failed to fetch adaptations:', err);
      } finally {
        setLoadingAdaptations(false);
      }
    };

    fetchStats();
    fetchAdaptations();
  }, [work.id, screenWork.id]);

  const handleAdaptationChange = (slug: string) => {
    if (slug !== screenWork.slug) {
      router.push(`/compare/${work.slug}/${slug}`);
    }
  };

  const getPreferencePercentage = (pref: 'BOOK' | 'SCREEN' | 'TIE'): number => {
    if (!stats || stats.total_votes === 0) return 0;
    return Math.round((stats.preference_breakdown[pref] / stats.total_votes) * 100);
  };

  const getPreferenceWinner = (): string => {
    if (!stats || stats.total_votes === 0) return 'No votes yet';

    const bookPct = getPreferencePercentage('BOOK');
    const screenPct = getPreferencePercentage('SCREEN');
    const tiePct = getPreferencePercentage('TIE');

    if (tiePct > bookPct && tiePct > screenPct) return 'Tied';
    if (bookPct > screenPct) return 'Book preferred';
    if (screenPct > bookPct) return 'Screen preferred';
    return 'Even split';
  };

  return (
    <div className={`sticky top-0 z-10 bg-white dark:bg-black border-b ${BORDERS.solid} mb-6`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Main Comparison Header */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 mb-4">
          {/* Book Side */}
          <div className="flex gap-4">
            {work.cover_url && (
              <div className="flex-shrink-0">
                <img
                  src={work.cover_url}
                  alt={`${work.title} cover`}
                  className={`w-20 h-28 sm:w-24 sm:h-36 object-cover border ${BORDERS.medium}`}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className={`${TEXT.metadata} font-bold mb-1 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider, color: COLORS.book }}>
                Book
              </div>
              <h1 className={`text-lg sm:text-xl font-bold mb-1 leading-tight text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                {work.title}
              </h1>
              {work.author && (
                <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-1`} style={{ fontFamily: FONTS.sans }}>by {work.author}</p>
              )}
              {work.year && (
                <p className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>{work.year}</p>
              )}
            </div>
          </div>

          {/* VS Separator */}
          <div className="flex items-center justify-center">
            <div className={`flex items-center gap-2 px-3 py-2 bg-black dark:bg-white rounded-md border ${BORDERS.solid}`}>
              <span className={`text-2xl sm:text-3xl font-bold text-white dark:text-black`} style={{ fontFamily: FONTS.mono }}>VS</span>
            </div>
          </div>

          {/* Screen Side */}
          <div className="flex gap-4 md:flex-row-reverse">
            {screenWork.poster_url && (
              <div className="flex-shrink-0">
                <img
                  src={screenWork.poster_url}
                  alt={`${screenWork.title} poster`}
                  className={`w-20 h-28 sm:w-24 sm:h-36 object-cover border ${BORDERS.medium}`}
                />
              </div>
            )}
            <div className="flex-1 min-w-0 md:text-right">
              <div className={`${TEXT.metadata} font-bold mb-1 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider, color: COLORS.screen }}>
                {screenWork.type === 'MOVIE' ? 'Movie' : 'TV Series'}
              </div>
              <h1 className={`text-lg sm:text-xl font-bold mb-1 leading-tight text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                {screenWork.title}
              </h1>
              {screenWork.year && (
                <p className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>{screenWork.year}</p>
              )}
            </div>
          </div>
        </div>

        {/* Adaptation Selector (if multiple adaptations exist) */}
        {!loadingAdaptations && adaptations.length > 1 && (
          <div className={`mb-4 p-3 bg-stone-50 dark:bg-stone-950 rounded-md border ${BORDERS.medium}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label htmlFor="adaptation-select" className={`${TEXT.metadata} font-bold ${monoUppercase} ${TEXT.mutedMedium} whitespace-nowrap`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
                Switch adaptation:
              </label>
              <select
                id="adaptation-select"
                value={screenWork.slug}
                onChange={(e) => handleAdaptationChange(e.target.value)}
                className={`flex-1 px-3 py-2 ${TEXT.secondary} bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} rounded-md focus:outline-none focus:border-black dark:focus:border-white`}
                style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
              >
                {adaptations.map((adaptation) => (
                  <option key={adaptation.id} value={adaptation.slug}>
                    {adaptation.title} ({adaptation.year || 'N/A'}) - {adaptation.type === 'MOVIE' ? 'Movie' : 'TV'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Diff Count */}
          <div className={`bg-stone-50 dark:bg-stone-950 rounded-md border ${BORDERS.medium} p-3`}>
            <div className={`${TEXT.metadata} font-bold ${monoUppercase} ${TEXT.mutedMedium} mb-1`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
              Differences
            </div>
            <div className={`text-2xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
              {diffCount}
            </div>
          </div>

          {/* Community Vote */}
          <div className={`bg-stone-50 dark:bg-stone-950 rounded-md border ${BORDERS.medium} p-3`}>
            <div className={`${TEXT.metadata} font-bold ${monoUppercase} ${TEXT.mutedMedium} mb-1`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
              Community
            </div>
            <div className={`${TEXT.secondary} font-bold text-black dark:text-white truncate`} style={{ fontFamily: FONTS.mono }}>
              {loadingStats ? '...' : getPreferenceWinner()}
            </div>
            {stats && stats.total_votes > 0 && (
              <div className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-0.5`} style={{ fontFamily: FONTS.mono }}>
                {stats.total_votes} {stats.total_votes === 1 ? 'vote' : 'votes'}
              </div>
            )}
          </div>

          {/* Book Preference */}
          {!loadingStats && stats && stats.total_votes > 0 && (
            <div className={`bg-stone-50 dark:bg-stone-950 rounded-md border ${BORDERS.medium} p-3`}>
              <div className={`${TEXT.metadata} font-bold ${monoUppercase} ${TEXT.mutedMedium} mb-1`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
                Book
              </div>
              <div className={`text-2xl font-bold`} style={{ fontFamily: FONTS.mono, color: COLORS.book }}>
                {getPreferencePercentage('BOOK')}%
              </div>
            </div>
          )}

          {/* Screen Preference */}
          {!loadingStats && stats && stats.total_votes > 0 && (
            <div className={`bg-stone-50 dark:bg-stone-950 rounded-md border ${BORDERS.medium} p-3`}>
              <div className={`${TEXT.metadata} font-bold ${monoUppercase} ${TEXT.mutedMedium} mb-1`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
                Screen
              </div>
              <div className={`text-2xl font-bold`} style={{ fontFamily: FONTS.mono, color: COLORS.screen }}>
                {getPreferencePercentage('SCREEN')}%
              </div>
            </div>
          )}

          {/* Faithfulness (if available) */}
          {!loadingStats && stats && stats.faithfulness.average !== null && (
            <div className={`bg-stone-50 dark:bg-stone-950 rounded-md border ${BORDERS.medium} p-3`}>
              <div className={`${TEXT.metadata} font-bold ${monoUppercase} ${TEXT.mutedMedium} mb-1`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
                Faithfulness
              </div>
              <div className={`text-2xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                {stats.faithfulness.average.toFixed(1)}
                <span className={`${TEXT.secondary} ${TEXT.mutedMedium}`}>/5</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
