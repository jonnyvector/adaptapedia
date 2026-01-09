'use client';

import type { SearchWithAdaptationsResponse, WorkWithAdaptations, ScreenWork } from '@/lib/types';
import BookWithAdaptationsResult from './BookWithAdaptationsResult';
import ScreenWorkResult from './ScreenWorkResult';
import { FONTS, LETTER_SPACING, TEXT, monoUppercase, RADIUS} from '@/lib/brutalist-design';

interface SearchResultsProps {
  query: string;
  initialSearchData: SearchWithAdaptationsResponse | null;
}

export default function SearchResults({
  query,
  initialSearchData,
}: SearchResultsProps): JSX.Element {
  if (!initialSearchData) {
    return (
      <div className="text-center py-12">
        <p className={`${TEXT.body} font-bold mb-2 text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>No results found for &quot;{query}&quot;</p>
        <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          Try adjusting your search terms or browse our catalog
        </p>
      </div>
    );
  }

  const { search_type, results, detected_year } = initialSearchData;

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={`${TEXT.body} font-bold mb-2 text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>No results found for &quot;{query}&quot;</p>
        <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          Try adjusting your search terms or browse our catalog
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Results header */}
      <div className="flex items-baseline gap-2">
        <h2 className={`text-xl sm:text-2xl font-bold text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
          {search_type === 'screen' ? 'Screen Adaptations' : 'Books & Adaptations'}
        </h2>
        <span className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          ({results.length} {results.length === 1 ? 'result' : 'results'})
        </span>
      </div>

      {detected_year && (
        <div className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
          Showing results for year: <span className="font-bold text-black dark:text-white">{detected_year}</span>
        </div>
      )}

      {/* Results list */}
      <div className="space-y-4">
        {search_type === 'book' ? (
          // Book-first results with adaptations
          (results as WorkWithAdaptations[]).map((work) => (
            <BookWithAdaptationsResult key={work.id} work={work} />
          ))
        ) : (
          // Screen-first results
          (results as ScreenWork[]).map((screenWork) => (
            <ScreenWorkResult key={screenWork.id} screenWork={screenWork} />
          ))
        )}
      </div>
    </div>
  );
}
