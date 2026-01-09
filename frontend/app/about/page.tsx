import Link from 'next/link';

// Force dynamic rendering - page uses client components with useSearchParams
export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { ArrowTopRightOnSquareIcon } from '@/components/ui/Icons';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

export const metadata: Metadata = {
  title: 'About Adaptapedia',
  description: 'Learn about Adaptapedia, a community-driven database for comparing books and their film adaptations',
};

export default function AboutPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-white dark:bg-black font-mono">
      <div className="container py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-16 text-center">
            <h1
              className={`text-3xl sm:text-4xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight ${TEXT.primary}`}

            >
              About Adaptapedia
            </h1>
            <p
              className={`text-base sm:text-lg md:text-xl ${TEXT.mutedMedium} mb-8 md:mb-12 max-w-2xl mx-auto px-4`}

            >
              A community-driven database for comparing books and their film adaptations
            </p>

            {/* Stats */}
            <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-6 md:mb-10 ${TEXT.secondary} ${TEXT.mutedMedium}`}>
              <div className="flex items-center gap-1">
                <div className={`text-2xl sm:text-3xl font-black ${TEXT.primary}`}>2,185</div>
                <span className={`${monoUppercase} text-xs sm:text-sm`}>books</span>
              </div>
              <div className="w-1 h-1 bg-black/20 dark:bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-1">
                <div className={`text-2xl sm:text-3xl font-black ${TEXT.primary}`}>3,417</div>
                <span className={`${monoUppercase} text-xs sm:text-sm`}>adaptations</span>
              </div>
              <div className="w-1 h-1 bg-black/20 dark:bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-1">
                <div className={`text-2xl sm:text-3xl font-black ${TEXT.primary}`}>12.8K</div>
                <span className={`${monoUppercase} text-xs sm:text-sm`}>differences</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex justify-center items-center">
              <Link
                href="/search"
                className={`px-4 py-2 sm:px-6 sm:py-3 border ${BORDERS.solid} bg-black dark:bg-white text-white dark:text-black hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white font-bold transition-all ${TEXT.body} ${monoUppercase} rounded-md`}
               
              >
                Start exploring
              </Link>
            </div>
          </div>

          {/* Mission Statement */}
          <section className="mb-8 md:mb-16">
            <h2
              className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-8 tracking-tight ${TEXT.primary}`}
             
            >
              Our Mission
            </h2>
            <div className={`border ${BORDERS.medium} p-4 sm:p-6 md:p-10 bg-white dark:bg-black`}>
              <p className={`${TEXT.body} mb-4 leading-relaxed`}>
                Adaptapedia exists to document and explore how stories transform when they move from
                page to screen. We believe in the value of both books and their adaptations, and our
                goal is to help readers and viewers understand the creative choices, changes, and
                differences that occur in the adaptation process.
              </p>
              <p className={`${TEXT.body} ${TEXT.mutedMedium} leading-relaxed`}>
                Whether you&apos;re deciding what to read or watch next, or simply curious about how
                your favorite stories changed in translation, Adaptapedia is here to help.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-8 md:mb-16">
            <h2
              className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-8 tracking-tight ${TEXT.primary}`}
             
            >
              How It Works
            </h2>

            {/* Great Difference Example */}
            <div className={`mb-10 border ${BORDERS.medium} p-6 md:p-8`}>
              <h3
                className={`text-xl font-bold mb-4 ${TEXT.primary}`}
               
              >
                What makes a great difference?
              </h3>

              <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-6`}>
                <strong className={TEXT.primary}>Short, specific, and verifiable</strong> beats long essays. Here&apos;s a real example:
              </p>

              {/* Example Diff Card */}
              <div className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 overflow-hidden max-w-2xl`}>
                <div className="p-3 sm:p-4">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 ${TEXT.metadata} font-bold border ${BORDERS.subtle} bg-white dark:bg-black text-black dark:text-white ${monoUppercase}`}
                     
                    >
                      Character
                    </span>
                  </div>

                  {/* Claim */}
                  <div className="mb-2">
                    <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                      Jack Torrance&apos;s character arc begins differently
                    </h3>
                  </div>

                  {/* Detail */}
                  <div className="mb-3">
                    <p className={`${TEXT.secondary} ${TEXT.mutedMedium} leading-relaxed`}>
                      In the book, Jack is a recovering alcoholic trying to rebuild his life and becomes gradually corrupted by the hotel. In the film, Jack seems unstable from the opening scenes, making his descent feel more inevitable than tragic.
                    </p>
                  </div>

                  {/* Consensus bar */}
                  <div className="mb-2.5 max-w-xl">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`${TEXT.secondary} font-medium ${TEXT.mutedMedium}`}>Consensus:</span>
                      <span className={`${TEXT.secondary} font-semibold text-black dark:text-white`}>
                        Strong Agreement
                      </span>
                      <span className={`${TEXT.secondary} ${TEXT.mutedMedium}`}>
                        (247 votes)
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/10 dark:bg-white/10 overflow-hidden flex border border-black/20 dark:border-white/20">
                      <div
                        className="bg-black dark:bg-white"
                        style={{ width: '92%' }}
                        title="227 Accurate (92%)"
                      />
                      <div
                        className="bg-black/50 dark:bg-white/50"
                        style={{ width: '6%' }}
                        title="15 Needs Nuance (6%)"
                      />
                      <div
                        className="bg-black/20 dark:bg-white/20"
                        style={{ width: '2%' }}
                        title="5 Disagree (2%)"
                      />
                    </div>
                  </div>

                  {/* Voting buttons */}
                  <div className="inline-flex items-stretch gap-2 overflow-hidden" role="group">
                    <button
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 ${TEXT.metadata} font-bold border rounded-md transition-all bg-black dark:bg-white ${BORDERS.solid} text-white dark:text-black ${monoUppercase}`}
                     
                    >
                      <span className="leading-none">↑</span>
                      <span>Accurate</span>
                      <span>(227)</span>
                    </button>
                    <button
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 ${TEXT.metadata} font-bold border rounded-md transition-all bg-white dark:bg-black ${BORDERS.medium} ${TEXT.mutedStrong} hover:border-black dark:hover:border-white ${monoUppercase}`}
                     
                    >
                      <span className="leading-none">~</span>
                      <span>Nuance</span>
                      <span>(15)</span>
                    </button>
                    <button
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 ${TEXT.metadata} font-bold border rounded-md transition-all bg-white dark:bg-black ${BORDERS.medium} ${TEXT.mutedStrong} hover:border-black dark:hover:border-white ${monoUppercase}`}
                     
                    >
                      <span className="leading-none">↓</span>
                      <span>Disagree</span>
                      <span>(5)</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={`mt-6 flex items-start gap-2 ${TEXT.secondary} ${TEXT.mutedMedium}`}>
                <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${TEXT.primary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Notice how this is <strong className={TEXT.primary}>specific</strong> (names the character and describes exact changes),
                  <strong className={TEXT.primary}> verifiable</strong> (references both source materials), and
                  <strong className={TEXT.primary}> concise</strong> (gets to the point quickly).
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {/* Structured Comparisons */}
              <div className={`border ${BORDERS.medium} p-6 md:p-8`}>
                <h3
                  className={`text-xl font-bold mb-4 ${TEXT.primary}`}
                 
                >
                  Structured Comparisons
                </h3>
                <p className={`${TEXT.body} ${TEXT.mutedMedium}`}>
                  Our comparison pages organize differences into clear categories: Plot Changes,
                  Character Changes, Setting Changes, and Theme Changes. Each difference is documented
                  with context from both the book and the screen adaptation.
                </p>
              </div>

              {/* Spoiler Protection */}
              <div className={`border ${BORDERS.medium} p-6 md:p-8`}>
                <h3
                  className={`text-xl font-bold mb-4 ${TEXT.primary}`}
                 
                >
                  Spoiler Protection System
                </h3>
                <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-6`}>
                  We understand that spoilers matter. Our spoiler scope system lets you control
                  what you see:
                </p>

                {/* Spoiler Control UI */}
                <div className={`border ${BORDERS.subtle} bg-stone-50 dark:bg-stone-950 p-4 max-w-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`${TEXT.metadata} font-bold ${TEXT.mutedMedium} ${monoUppercase}`}>Spoiler Level</span>
                  </div>
                  <div className="inline-flex items-center gap-2 w-full">
                    <button className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 ${TEXT.label} font-bold rounded-md border ${BORDERS.solid} bg-green-600 dark:bg-green-500 text-white ${monoUppercase}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Safe
                    </button>
                    <button className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 ${TEXT.label} font-bold rounded-md border ${BORDERS.medium} bg-stone-100 dark:bg-stone-900 ${TEXT.mutedStrong} ${monoUppercase}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Book
                    </button>
                    <button className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 ${TEXT.label} font-bold rounded-md border ${BORDERS.medium} bg-stone-100 dark:bg-stone-900 ${TEXT.mutedStrong} ${monoUppercase}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                      Screen
                    </button>
                    <button className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 ${TEXT.label} font-bold rounded-md border ${BORDERS.medium} bg-stone-100 dark:bg-stone-900 ${TEXT.mutedStrong} ${monoUppercase}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      All
                    </button>
                  </div>
                  <p className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-3`}>
                    <span className="font-medium text-green-600 dark:text-green-500">Safe mode</span> hides all endings and major plot twists
                  </p>
                </div>
              </div>

              {/* Community-Driven */}
              <div className={`border ${BORDERS.medium} p-6 md:p-8`}>
                <h3
                  className={`text-xl font-bold mb-4 ${TEXT.primary}`}
                 
                >
                  Community-Driven
                </h3>
                <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-4`}>
                  Adaptapedia relies on contributions from readers and viewers like you. Our
                  community helps by:
                </p>
                <ul className={`space-y-2 ${TEXT.body} ${TEXT.mutedMedium} ml-6 list-disc`}>
                  <li>Documenting differences between books and adaptations</li>
                  <li>Voting on the accuracy of existing comparisons</li>
                  <li>Adding context and nuance through comments</li>
                  <li>Suggesting improvements and corrections</li>
                </ul>
                <p className={`${TEXT.body} ${TEXT.mutedMedium} mt-4`}>
                  All contributions are moderated to ensure quality and accuracy.{' '}
                  <Link href="/about/guidelines" className={`${TEXT.primary} hover:underline font-bold`}>
                    Read our community guidelines
                  </Link>
                  .
                </p>
              </div>

              {/* Comprehensive Data */}
              <div className={`border ${BORDERS.medium} p-6 md:p-8`}>
                <h3
                  className={`text-xl font-bold mb-4 ${TEXT.primary}`}
                 
                >
                  Comprehensive Data
                </h3>
                <p className={`${TEXT.body} ${TEXT.mutedMedium}`}>
                  Our database includes over 2,185 books and 3,417 screen adaptations, with
                  detailed metadata sourced from{' '}
                  <Link href="/about/sources" className={`${TEXT.primary} hover:underline font-bold`}>
                    trusted open data sources
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Open Source */}
          <section className="mb-8 md:mb-16">
            <h2
              className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-8 tracking-tight ${TEXT.primary}`}
             
            >
              Open Source
            </h2>
            <div className={`border ${BORDERS.medium} p-8 md:p-10`}>
              <p className={`${TEXT.body} ${TEXT.mutedMedium} mb-6`}>
                Adaptapedia is an open-source project. You can view our code, report issues,
                or contribute to the project on GitHub.
              </p>
              <a
                href="https://github.com/adaptapedia/adaptapedia"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid} font-bold hover:bg-white hover:dark:bg-black hover:text-black hover:dark:text-white transition-all ${TEXT.body} ${monoUppercase} rounded-md`}
               
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </section>

          {/* Footer Links */}
          <section>
            <div className={`border-t ${BORDERS.medium} pt-8`}>
              <h2
                className={`text-xl font-bold mb-6 ${TEXT.primary}`}
               
              >
                Learn More
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/about/sources"
                  className={`block p-6 border ${BORDERS.medium} hover:border-black hover:dark:border-white transition-colors group`}
                >
                  <h3 className={`font-bold ${TEXT.body} mb-2 ${TEXT.primary}`}>
                    Data Sources & Attribution
                  </h3>
                  <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`}>
                    Learn about the open data sources that power Adaptapedia
                  </p>
                </Link>
                <Link
                  href="/about/guidelines"
                  className={`block p-6 border ${BORDERS.medium} hover:border-black hover:dark:border-white transition-colors group`}
                >
                  <h3 className={`font-bold ${TEXT.body} mb-2 ${TEXT.primary}`}>
                    Community Guidelines
                  </h3>
                  <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`}>
                    Understand how to contribute effectively to Adaptapedia
                  </p>
                </Link>
              </div>
            </div>
          </section>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className={`${TEXT.body} ${TEXT.primary} hover:underline font-bold`}
             
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
