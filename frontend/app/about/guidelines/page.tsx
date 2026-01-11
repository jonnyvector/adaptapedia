import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

export const metadata: Metadata = {
  title: 'Community Guidelines - Adaptapedia',
  description: 'Guidelines for contributing to Adaptapedia - Be factual, respectful, and help build the best book-to-screen comparison resource',
};

const guidelines = [
  {
    icon: '/icon-accurate.svg',
    title: 'Be Factual & Accurate',
    points: [
      'Document verifiable differences between book and screen adaptations',
      'Cite sources when possible (page numbers, timestamps, etc.)',
      'Avoid subjective opinions like "the book was better" - focus on what changed',
      'Be specific: "In the book, Harry\'s eyes are green; in the film, they\'re blue"',
    ],
  },
  {
    icon: '/icon-spoiler.svg',
    title: 'Respect Spoiler Scopes',
    points: [
      'Tag diffs correctly: NONE (safe), BOOK_ONLY, SCREEN_ONLY, or FULL (endings)',
      'Don\'t reveal major plot twists in non-FULL categories',
      'Help newcomers avoid unwanted spoilers',
      'When in doubt, use a higher spoiler scope',
    ],
  },
  {
    icon: '/icon-civil.svg',
    title: 'Be Civil & Constructive',
    points: [
      'Disagree respectfully when voting or commenting',
      'Use comments to add context, not to argue about preferences',
      'Assume good faith from other contributors',
      'No personal attacks, harassment, or toxicity',
    ],
  },
  {
    icon: '/icon-thoughtful.svg',
    title: 'Contribute Thoughtfully',
    points: [
      'One clear difference per submission',
      'Write concise claims with optional detail for context',
      'Don\'t duplicate existing diffs - upvote or add nuance via comments',
      'Check your facts before submitting',
    ],
  },
  {
    icon: '/icon-vote.svg',
    title: 'Vote Honestly',
    points: [
      'ACCURATE = the difference is factually correct',
      'NEEDS NUANCE = correct but incomplete or potentially misleading',
      'DISAGREE = factually incorrect',
      'Don\'t downvote accurate diffs just because you dislike the change itself',
    ],
  },
  {
    icon: '/icon-reputation.svg',
    title: 'Build Reputation Through Quality',
    points: [
      'Earn reputation by contributing accurate, well-sourced diffs',
      'Community consensus on accuracy determines reputation gains',
      'Focus on helping others understand adaptations, not gaming the system',
      'Higher reputation unlocks moderation privileges',
    ],
  },
  {
    icon: '/icon-nospam.svg',
    title: 'No Spam or Self-Promotion',
    points: [
      'Don\'t promote your own products, videos, or content',
      'No affiliate links or advertisements',
      'Keep discussions focused on book-to-screen differences',
    ],
  },
  {
    icon: '/icon-copyright.svg',
    title: 'Respect Copyright',
    points: [
      'Don\'t copy large passages of text verbatim from books',
      'Summarize differences in your own words',
      'We\'re documenting changes, not reproducing copyrighted material',
    ],
  },
];

export default function GuidelinesPage(): JSX.Element {
  return (
    <main className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 tracking-tight ${TEXT.primary}`} style={{ fontFamily: FONTS.mono }}>
            Community Guidelines
          </h1>
          <p className={`text-base sm:text-lg md:text-xl ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
            Help us build the best book-to-screen comparison resource by following these principles
          </p>
        </div>

        {/* Guidelines Grid */}
        <div className="space-y-6 sm:space-y-8 mb-12">
          {guidelines.map(({ icon, title, points }, index) => (
            <div
              key={index}
              className={`border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-5 sm:p-6`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-10 h-10`}>
                  <Image src={icon} alt="" width={40} height={40} className="dark:invert" />
                </div>
                <h2
                  className={`text-xl sm:text-2xl font-bold text-black dark:text-white uppercase mb-0`}
                  style={{ fontFamily: FONTS.mono, letterSpacing: '-0.02em' }}
                >
                  {title}
                </h2>
              </div>
              <ul className="space-y-2 sm:space-y-3 ml-0 pl-0 list-none">
                {points.map((point, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 ${TEXT.secondary}`}
                    style={{ fontFamily: FONTS.mono }}
                  >
                    <span className="text-black dark:text-white font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className={`border-t ${BORDERS.medium} pt-8`}>
          <p className={`${TEXT.secondary} mb-6`} style={{ fontFamily: FONTS.mono }}>
            These guidelines help maintain a constructive, factual community. Violations may result in warnings, content removal, or account restrictions depending on severity.
          </p>

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
