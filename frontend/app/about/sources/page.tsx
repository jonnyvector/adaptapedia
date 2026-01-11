import Link from 'next/link';
import Image from 'next/image';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { ArrowTopRightOnSquareIcon } from '@/components/ui/Icons';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

export const metadata: Metadata = {
  title: 'Data Sources & Attribution - Adaptapedia',
  description: 'Learn about the open data sources that power Adaptapedia, including TMDb, Wikidata, and Open Library',
};

export default function DataSourcesPage(): JSX.Element {
  return (
    <main className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 tracking-tight ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>
            Data Sources & Attribution
          </h1>
          <p className={`text-base sm:text-lg md:text-xl ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
            Adaptapedia aggregates data from multiple open sources to provide comprehensive
            information about book adaptations.
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8 sm:mb-12">
          <div className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-5 sm:p-6`}>
            <p className={`text-base sm:text-lg ${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>
              We believe in open data and attribution. All of our data comes from publicly
              available sources with open licenses. This page documents those sources and
              provides the required legal attributions.
            </p>
          </div>
        </section>

        {/* The Movie Database (TMDb) */}
        <section className="mb-6 sm:mb-8">
          <div className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-5 sm:p-6`}>
            <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl sm:text-2xl font-bold text-black dark:text-white uppercase mb-2`} style={{ fontFamily: FONTS.mono, letterSpacing: '-0.02em' }}>
                  The Movie Database (TMDb)
                </h2>
                <a
                  href="https://www.themoviedb.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors text-sm inline-flex items-center gap-1`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  themoviedb.org
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </a>
              </div>
              {/* TMDb logo */}
              <div className={`w-24 sm:w-32 h-18 sm:h-24 flex items-center justify-center p-2 sm:p-3 bg-white dark:bg-stone-100 border ${BORDERS.medium}`}>
                <Image
                  src="/tmdb-logo.svg"
                  alt="The Movie Database (TMDb)"
                  width={120}
                  height={90}
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>What We Use</h3>
                <p className={`${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>
                  TMDb provides comprehensive movie and TV show metadata, including posters,
                  release dates, cast information, plot summaries, and production details.
                  This data powers the screen adaptation side of our comparisons.
                </p>
              </div>

              <div className={`bg-stone-100 dark:bg-stone-900 border ${BORDERS.medium} p-3 sm:p-4`}>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>Required Attribution</h3>
                <p className={`${TEXT.secondary} text-sm`} style={{ fontFamily: FONTS.mono }}>
                  This product uses the TMDb API but is not endorsed or certified by TMDb.
                </p>
              </div>

              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>License & Terms</h3>
                <p className={`${TEXT.secondary} mb-2`} style={{ fontFamily: FONTS.mono }}>
                  TMDb data is provided via their API under specific terms of use.
                </p>
                <a
                  href="https://www.themoviedb.org/terms-of-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors text-sm inline-flex items-center gap-1`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  View TMDb Terms of Use
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Wikidata */}
        <section className="mb-6 sm:mb-8">
          <div className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-5 sm:p-6`}>
            <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl sm:text-2xl font-bold text-black dark:text-white uppercase mb-2`} style={{ fontFamily: FONTS.mono, letterSpacing: '-0.02em' }}>
                  Wikidata
                </h2>
                <a
                  href="https://www.wikidata.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors text-sm inline-flex items-center gap-1`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  wikidata.org
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </a>
              </div>
              {/* Wikidata logo */}
              <div className={`w-24 sm:w-32 h-18 sm:h-24 flex items-center justify-center p-2 sm:p-3 bg-white dark:bg-stone-100 border ${BORDERS.medium}`}>
                <Image
                  src="/wikidata-logo.svg"
                  alt="Wikidata"
                  width={120}
                  height={90}
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>What We Use</h3>
                <p className={`${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>
                  Wikidata provides the core relationship data that links books to their screen
                  adaptations. It&apos;s a free, collaborative knowledge base that serves as central
                  storage for structured data across Wikimedia projects and beyond.
                </p>
              </div>

              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>License</h3>
                <p className={`${TEXT.secondary} mb-2`} style={{ fontFamily: FONTS.mono }}>
                  All Wikidata content is available under the Creative Commons CC0 license,
                  which places the data in the public domain.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                  <a
                    href="https://www.wikidata.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1`}
                    style={{ fontFamily: FONTS.mono }}
                  >
                    Visit Wikidata
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                  <a
                    href="https://creativecommons.org/publicdomain/zero/1.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1`}
                    style={{ fontFamily: FONTS.mono }}
                  >
                    CC0 License Details
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Open Library */}
        <section className="mb-6 sm:mb-8">
          <div className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-5 sm:p-6`}>
            <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl sm:text-2xl font-bold text-black dark:text-white uppercase mb-2`} style={{ fontFamily: FONTS.mono, letterSpacing: '-0.02em' }}>
                  Open Library
                </h2>
                <a
                  href="https://openlibrary.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors text-sm inline-flex items-center gap-1`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  openlibrary.org
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </a>
              </div>
              {/* Open Library logo */}
              <div className={`w-24 sm:w-32 h-18 sm:h-24 flex items-center justify-center p-2 sm:p-3 bg-white dark:bg-stone-100 border ${BORDERS.medium}`}>
                <Image
                  src="/openlibrary-logo.svg"
                  alt="Open Library"
                  width={120}
                  height={90}
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>What We Use</h3>
                <p className={`${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>
                  Open Library provides extensive book metadata including cover images, publication
                  dates, author information, editions, and ISBN data. As an Internet Archive project,
                  it aims to create &quot;one web page for every book ever published.&quot;
                </p>
              </div>

              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>License</h3>
                <p className={`${TEXT.secondary} mb-2`} style={{ fontFamily: FONTS.mono }}>
                  Open Library data is available under the Creative Commons CC0 license,
                  placing it in the public domain for free use.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                  <a
                    href="https://openlibrary.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1`}
                    style={{ fontFamily: FONTS.mono }}
                  >
                    Visit Open Library
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                  <a
                    href="https://creativecommons.org/publicdomain/zero/1.0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1`}
                    style={{ fontFamily: FONTS.mono }}
                  >
                    CC0 License Details
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Contributions */}
        <section className="mb-8 sm:mb-12">
          <div className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-5 sm:p-6`}>
            <h2 className={`text-xl sm:text-2xl font-bold text-black dark:text-white uppercase mb-4`} style={{ fontFamily: FONTS.mono, letterSpacing: '-0.02em' }}>
              Community Contributions
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>User-Generated Content</h3>
                <p className={`${TEXT.secondary} mb-2`} style={{ fontFamily: FONTS.mono }}>
                  Beyond third-party data sources, Adaptapedia relies on contributions from our
                  community of readers and viewers. This includes:
                </p>
                <ul className={`space-y-1 ${TEXT.secondary} ml-0 pl-0 list-none`}>
                  <li className="flex items-start gap-3" style={{ fontFamily: FONTS.mono }}>
                    <span className="text-black dark:text-white font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>Documented differences between books and adaptations</span>
                  </li>
                  <li className="flex items-start gap-3" style={{ fontFamily: FONTS.mono }}>
                    <span className="text-black dark:text-white font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>Accuracy votes and ratings</span>
                  </li>
                  <li className="flex items-start gap-3" style={{ fontFamily: FONTS.mono }}>
                    <span className="text-black dark:text-white font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>Comments providing context and nuance</span>
                  </li>
                  <li className="flex items-start gap-3" style={{ fontFamily: FONTS.mono }}>
                    <span className="text-black dark:text-white font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>Suggested corrections and improvements</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>Moderation</h3>
                <p className={`${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>
                  All user-generated content is moderated to ensure quality, accuracy, and
                  adherence to our community standards.
                </p>
              </div>

              <div>
                <h3 className={`font-bold mb-2 text-black dark:text-white uppercase ${TEXT.body}`} style={{ fontFamily: FONTS.mono }}>Contributing</h3>
                <p className={`${TEXT.secondary} mb-2`} style={{ fontFamily: FONTS.mono }}>
                  Interested in contributing? Learn more about how to participate effectively:
                </p>
                <Link
                  href="/about/guidelines"
                  className={`${TEXT.secondary} hover:text-black dark:hover:text-white transition-colors text-sm`}
                  style={{ fontFamily: FONTS.mono }}
                >
                  Read Community Guidelines
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-8 sm:mb-12">
          <div className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-5 sm:p-6`}>
            <h2 className={`text-xl sm:text-2xl font-bold text-black dark:text-white uppercase mb-4`} style={{ fontFamily: FONTS.mono, letterSpacing: '-0.02em' }}>
              Our Commitment
            </h2>
            <p className={`text-base sm:text-lg ${TEXT.secondary} mb-3 sm:mb-4`} style={{ fontFamily: FONTS.mono }}>
              We are committed to transparency in our data sources and proper attribution
              for all content. If you have questions about our data sources or notice any
              attribution issues, please contact us.
            </p>
            <p className={`${TEXT.secondary}`} style={{ fontFamily: FONTS.mono }}>
              All external data is used in accordance with the respective terms of service
              and licenses. We regularly review and update our attributions to ensure compliance.
            </p>
          </div>
        </section>

        {/* Footer Note */}
        <div className={`border-t ${BORDERS.medium} pt-8`}>
          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <Link
              href="/about"
              className={`${TEXT.secondary} font-bold hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono }}
            >
              ← Back to About
            </Link>
            <Link
              href="/"
              className={`${TEXT.secondary} font-bold hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono }}
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
