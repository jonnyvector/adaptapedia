'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Work, ScreenWork, ComparisonVoteStats } from '@/lib/types';
import { api } from '@/lib/api';
import { calculateVotePercentage } from '@/lib/vote-utils';
import AdaptationSwitcher from './AdaptationSwitcher';
import BookmarkButton from './BookmarkButton';

// Inject Google Fonts for brutalist minimal + nerdy typography
if (typeof document !== 'undefined' && !document.querySelector('link[href*="Space+Grotesk"]')) {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

interface MatchupScoreboardProps {
  work: Work;
  screenWork: ScreenWork;
  onAddDiff: () => void;
  workId: number;
  screenWorkId: number;
}

type PreferenceChoice = 'BOOK' | 'SCREEN' | 'TIE';

export default function MatchupScoreboard({
  work,
  screenWork,
  onAddDiff,
  workId,
  screenWorkId,
}: MatchupScoreboardProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ComparisonVoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreference, setSelectedPreference] = useState<PreferenceChoice | null>(null);
  const [faithfulnessRating, setFaithfulnessRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditVote, setShowEditVote] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.comparisonVotes.getStats(work.id, screenWork.id);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch voting stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Restore faithfulness rating from URL params (after login redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const pendingRating = urlParams.get('faithfulness');
    if (pendingRating) {
      const rating = parseInt(pendingRating, 10);
      if (rating >= 1 && rating <= 5) {
        setFaithfulnessRating(rating);
      }
      // Clean up URL
      urlParams.delete('faithfulness');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [work.id, screenWork.id]);

  const handleVote = async (preference: PreferenceChoice) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setSelectedPreference(preference);
    setIsSubmitting(true);

    try {
      // Use API client instead of server action to access localStorage token
      await api.comparisonVotes.submit({
        work: work.id,
        screen_work: screenWork.id,
        has_read_book: true, // Default assumptions
        has_watched_adaptation: true,
        preference: preference,
        faithfulness_rating: faithfulnessRating,
      });

      // Refresh stats
      const data = await api.comparisonVotes.getStats(work.id, screenWork.id);
      setStats(data);
      setShowEditVote(false);
    } catch (error) {
      console.error('Vote submission failed:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaithfulnessRate = async (rating: number) => {
    setFaithfulnessRating(rating);

    if (isAuthenticated && stats?.user_vote) {
      setIsSubmitting(true);
      try {
        // Update existing vote with faithfulness rating
        await api.comparisonVotes.submit({
          work: work.id,
          screen_work: screenWork.id,
          has_read_book: true,
          has_watched_adaptation: true,
          preference: stats.user_vote.preference,
          faithfulness_rating: rating,
        });

        // Refresh stats
        const data = await api.comparisonVotes.getStats(work.id, screenWork.id);
        setStats(data);
      } catch (error) {
        console.error('Faithfulness submission failed:', error);
        alert('Failed to submit rating. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const totalVotes = stats?.total_votes || 0;
  const bookPct = stats ? calculateVotePercentage(stats.preference_breakdown.BOOK, totalVotes) : 0;
  const screenPct = stats ? calculateVotePercentage(stats.preference_breakdown.SCREEN, totalVotes) : 0;
  const avgFaithfulness = stats?.faithfulness.average || null;
  const faithfulnessCount = stats?.faithfulness.count || 0;
  const userVote = stats?.user_vote;
  const userFaithfulness = userVote?.faithfulness_rating || null;

  const hasVotes = totalVotes > 0;

  // Accent colors - Ink vs Ember palette (archival feel)
  const bookAccent = '#6F8FA8'; // Dusty steel blue (ink)
  const screenAccent = '#C98A3A'; // Burnt amber (ember)

  // Shared component: Vote buttons
  const renderVoteButtons = (size: 'large' | 'small' = 'large') => {
    const buttonClass = size === 'large'
      ? 'py-4 px-3 text-sm border'
      : 'py-3 px-2 text-sm';
    const borderWidth = size === 'large' ? '' : '';

    return (
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleVote('BOOK')}
          disabled={isSubmitting}
          className={`${buttonClass} font-bold transition-all disabled:opacity-50 rounded-md`}
          style={{
            border: `1px solid ${bookAccent}`,
            borderColor: bookAccent,
            color: bookAccent,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.05em',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = bookAccent;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = bookAccent;
          }}
        >
          BOOK
        </button>
        <button
          onClick={() => handleVote('TIE')}
          disabled={isSubmitting}
          className={`${buttonClass} font-bold transition-all disabled:opacity-50 border border-black/30 dark:border-white/30 text-black/70 dark:text-white/70 hover:border-black hover:dark:border-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black rounded-md`}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.05em'
          }}
        >
          TIE
        </button>
        <button
          onClick={() => handleVote('SCREEN')}
          disabled={isSubmitting}
          className={`${buttonClass} font-bold transition-all disabled:opacity-50 rounded-md`}
          style={{
            border: `1px solid ${screenAccent}`,
            borderColor: screenAccent,
            color: screenAccent,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.05em',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = screenAccent;
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = screenAccent;
          }}
        >
          SCREEN
        </button>
      </div>
    );
  };

  // Shared component: Faithfulness rating
  const renderFaithfulnessRating = (mode: 'initial' | 'existing' = 'existing', showHint: boolean = false) => {
    const currentRating = mode === 'initial' ? faithfulnessRating : userFaithfulness;

    const handleClick = (rating: number) => {
      // Always require authentication for faithfulness ratings
      if (!isAuthenticated) {
        // Preserve the rating selection in URL params for after login
        const returnUrl = `${window.location.pathname}?faithfulness=${rating}`;
        router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      if (mode === 'initial') {
        setFaithfulnessRating(rating);
      } else {
        handleFaithfulnessRate(rating);
      }
    };

    return (
      <div className="space-y-2">
        <div className="text-center text-[10px] text-black/60 dark:text-white/60 font-bold uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
          {currentRating ? 'Your faithfulness rating' : 'Rate faithfulness (optional)'}
        </div>
        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleClick(rating)}
              disabled={isSubmitting}
              className={`w-7 h-7 border font-bold text-xs transition-all disabled:opacity-50 rounded-md ${
                currentRating === rating
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-black dark:text-white border-black/20 dark:border-white/20'
              }`}
              style={{
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {rating}
            </button>
          ))}
        </div>
        <div className="text-center text-[9px] text-black/50 dark:text-white/50 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
          1 = LOOSE • 5 = FAITHFUL
        </div>
        {showHint && faithfulnessRating && (
          <div className="text-center text-[9px] text-black/50 dark:text-white/50 uppercase tracking-wider pt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
            ↑ Selected: {faithfulnessRating}/5 • Pick side above to submit
          </div>
        )}
      </div>
    );
  };

  // Shared component: CTA button
  const renderCTAButton = () => (
    <button
      onClick={onAddDiff}
      className="w-full py-2.5 px-3 border border-black dark:border-white bg-transparent text-black dark:text-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black font-bold transition-all text-xs rounded-md"
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.05em'
      }}
    >
      {hasVotes ? 'ADD DIFFERENCE' : 'LOG FIRST DIFFERENCE'}
    </button>
  );

  // Shared component: Other versions (secondary action)
  const renderOtherVersions = () => (
    <div className="relative w-full border-t border-black/10 dark:border-white/10 pt-2">
      <AdaptationSwitcher
        workId={work.id}
        workSlug={work.slug}
        currentScreenWorkId={screenWork.id}
        currentScreenWorkTitle={screenWork.title}
        currentScreenWorkYear={screenWork.year}
        currentScreenWorkType={screenWork.type}
        currentScreenWorkPosterUrl={screenWork.poster_url}
      />
    </div>
  );

  // Shared component: Archive card header
  const renderArchiveHeader = () => (
    <div className="relative border-b border-black/10 dark:border-white/10 pb-2 mb-1">
      <div className="text-[10px] uppercase tracking-widest text-black/60 dark:text-white/60 text-center" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>
        ARCHIVE CARD • {work.year} • {work.author.split(' ').pop()?.toUpperCase()}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-8 min-h-[420px] flex items-center justify-center">
        <div className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative bg-white dark:bg-black border border-black/30 dark:border-white/30 p-8 md:p-10 overflow-visible">
      {/* Bookmark button - top-right corner of hero */}
      <div className="absolute top-3 right-3 z-10">
        <BookmarkButton workId={workId} screenWorkId={screenWorkId} />
      </div>

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

      {/* Desktop layout */}
      <div className="hidden md:block space-y-6">
        {/* Title - above the grid */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {work.title}
          </h1>
          {/* Community flavor */}
          <div className="text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </div>
        </div>

        {/* 3-column grid - aligned tops */}
        <div className="grid gap-6" style={{ gridTemplateColumns: '260px minmax(400px, 1fr) 260px', alignItems: 'start' }}>
          {/* Left: Book Cover */}
          <div className="relative flex flex-col items-center gap-3">
            {work.cover_url && (
              <div className="relative w-[240px] h-[360px]">
                <Image
                  src={work.cover_url}
                  alt={`${work.title} cover`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Book stamp - stamped style */}
                <div className="absolute -top-2 -left-2 px-1.5 py-0.5 border border-black/40 dark:border-white/40 bg-white dark:bg-black" style={{ transform: 'translate(-1px, -1px)' }}>
                  <span className="text-[10px] font-bold uppercase text-black dark:text-white" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>BOOK</span>
                </div>
              </div>
            )}
            <div className="text-center space-y-1">
              <div className="text-xs text-gray-900 dark:text-gray-100 font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{work.author}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>({work.year})</div>
              {/* Archival metadata */}
              <div className="text-[10px] text-black/50 dark:text-white/50 uppercase tracking-wider pt-1" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
                {work.publisher && `${work.publisher}`}
              </div>
            </div>
          </div>

          {/* Center: Scoreboard */}
          <div className="flex flex-col gap-4">

          {/* Index card vote panel */}
          {!hasVotes && !showEditVote && (
            <div className="relative border border-black/20 dark:border-white/20 bg-stone-50 dark:bg-stone-950 p-5 space-y-4">
              {/* Paper grain overlay - subtle */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

              {/* Catalog header */}
              {renderArchiveHeader()}

              <div className="relative">
                <p className="text-center text-xs font-bold text-black/80 dark:text-white/80 uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                  Cast your vote
                </p>

                {/* Primary choice buttons */}
                {renderVoteButtons('large')}

                {/* Faithfulness */}
                <div className="pt-3">
                  {renderFaithfulnessRating('initial', true)}
                </div>

                {/* Footer metadata */}
                <div className="relative border-t border-black/10 dark:border-white/10 pt-3 mt-2">
                  <div className="text-[9px] uppercase tracking-widest text-black/50 dark:text-white/50 text-center" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>
                    No community data yet
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  {renderCTAButton()}
                </div>

                {/* Secondary action: Other versions */}
                <div className="pt-2">
                  {renderOtherVersions()}
                </div>
              </div>
            </div>
          )}

          {/* State B: Has votes - Index card */}
          {(hasVotes || showEditVote) && (
            <div className="relative border border-black/20 dark:border-white/20 bg-stone-50 dark:bg-stone-950 p-5 space-y-4">
              {/* Paper grain overlay - subtle */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

              {/* Catalog header */}
              {renderArchiveHeader()}

              <div className="relative">
                {/* Results - brutal bar */}
                {hasVotes && (
                  <div className="space-y-3">
                    {/* Brutal bar with hard split - no gradients */}
                    <div className="space-y-1">
                      <div className="relative h-8 overflow-hidden flex bg-stone-200 dark:bg-stone-800">
                        {/* Book segment */}
                        {bookPct > 0 && (
                          <div
                            className="transition-all duration-500"
                            style={{
                              width: `${bookPct}%`,
                              backgroundColor: bookAccent
                            }}
                          />
                        )}
                        {/* Screen segment */}
                        {screenPct > 0 && (
                          <div
                            className="transition-all duration-500"
                            style={{
                              width: `${screenPct}%`,
                              backgroundColor: screenAccent
                            }}
                          />
                        )}
                      </div>

                      {/* Bar labels */}
                      <div className="flex items-center justify-between text-[9px] text-black/50 dark:text-white/50 uppercase tracking-widest px-1" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                        <span>BOOK {bookPct}%</span>
                        <span>SAMPLE SIZE: {totalVotes}</span>
                        <span>SCREEN {screenPct}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* User's vote status or vote buttons */}
                {userVote && !showEditVote ? (
                  <div className="text-center py-2">
                    <span className="text-[10px] text-black/70 dark:text-white/70 uppercase tracking-wider font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
                      You voted: {userVote.preference === 'BOOK' ? 'BOOK' : userVote.preference === 'SCREEN' ? 'SCREEN' : 'TIE'} • <button onClick={() => setShowEditVote(true)} className="underline hover:no-underline text-black dark:text-white">EDIT</button>
                    </span>
                  </div>
                ) : !userVote && !showEditVote ? (
                  <div className="space-y-2 pt-2">
                    <p className="text-center text-xs font-bold text-black/80 dark:text-white/80 uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                      Cast your vote
                    </p>
                    {renderVoteButtons('large')}
                  </div>
                ) : showEditVote && (
                  <div className="space-y-3 pt-3 border-t border-black/20 dark:border-white/20">
                    {renderVoteButtons('small')}
                    <button
                      onClick={() => setShowEditVote(false)}
                      className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-wider underline hover:no-underline"
                      style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Faithfulness - reference display */}
                <div className="space-y-2 pt-3">
                  {avgFaithfulness !== null ? (
                    <div className="text-center text-sm p-2">
                      <span className="font-bold text-black dark:text-white uppercase text-xs tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
                        FAITHFULNESS AVG {avgFaithfulness.toFixed(1)} ({faithfulnessCount} {faithfulnessCount === 1 ? 'RATING' : 'RATINGS'})
                      </span>
                    </div>
                  ) : null}

                  {/* Rate faithfulness action */}
                  {renderFaithfulnessRating(userVote ? 'existing' : 'initial', !userVote)}
                </div>

                {/* Footer metadata */}
                <div className="relative border-t border-black/10 dark:border-white/10 pt-3 mt-3">
                  <div className="text-[9px] uppercase tracking-widest text-black/50 dark:text-white/50 text-center" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>
                    RATINGS: {faithfulnessCount} • UPDATED: —
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  {renderCTAButton()}
                </div>

                {/* Secondary action: Other versions */}
                <div className="pt-2">
                  {renderOtherVersions()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Screen Poster */}
        <div className="relative flex flex-col items-center gap-3">
          {screenWork.poster_url && (
            <div className="relative w-[240px] h-[360px]">
              <Image
                src={screenWork.poster_url}
                alt={`${screenWork.title} poster`}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Screen stamp - stamped style */}
              <div className="absolute -top-2 -right-2 px-1.5 py-0.5 border border-black/40 dark:border-white/40 bg-white dark:bg-black" style={{ transform: 'translate(1px, -1px)' }}>
                <span className="text-[10px] font-bold uppercase text-black dark:text-white" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>
                  {screenWork.type === 'MOVIE' ? 'MOVIE' : 'TV'}
                </span>
              </div>
            </div>
          )}
          <div className="text-center space-y-1">
            <div className="text-xs text-gray-900 dark:text-gray-100 font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{screenWork.director || screenWork.type}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>({screenWork.year})</div>
            {/* Archival metadata */}
            <div className="text-[10px] text-black/50 dark:text-white/50 uppercase tracking-wider pt-1" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
              {screenWork.runtime && `${screenWork.runtime}m`}
              {screenWork.studio && ` • ${screenWork.studio}`}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile: Compact layout - brutalist style */}
      <div className="md:hidden space-y-4">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-black dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {work.title}
          </h1>
          {/* Community flavor - hide diff count if unknown */}
          <div className="text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
            {totalVotes} {totalVotes === 1 ? 'VOTE' : 'VOTES'}
          </div>
        </div>

        {/* Two-up covers - fixed aspect ratio */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {work.cover_url && (
              <div className="relative w-full aspect-[2/3]">
                <Image
                  src={work.cover_url}
                  alt={`${work.title} cover`}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  unoptimized
                />
                {/* Book stamp */}
                <div className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 border border-black/40 dark:border-white/40 bg-white dark:bg-black" style={{ transform: 'translate(-1px, -1px)' }}>
                  <span className="text-[9px] font-bold uppercase text-black dark:text-white" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>BOOK</span>
                </div>
              </div>
            )}
            <div className="text-center text-[10px] text-black/50 dark:text-white/50 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {work.author} ({work.year})
            </div>
          </div>

          <div className="space-y-2">
            {screenWork.poster_url && (
              <div className="relative w-full aspect-[2/3]">
                <Image
                  src={screenWork.poster_url}
                  alt={`${screenWork.title} poster`}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  unoptimized
                />
                {/* Movie stamp */}
                <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 border border-black/40 dark:border-white/40 bg-white dark:bg-black" style={{ transform: 'translate(1px, -1px)' }}>
                  <span className="text-[9px] font-bold uppercase text-black dark:text-white" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>
                    {screenWork.type === 'MOVIE' ? 'MOVIE' : 'TV'}
                  </span>
                </div>
              </div>
            )}
            <div className="text-center text-[10px] text-black/50 dark:text-white/50 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {screenWork.director || screenWork.type} ({screenWork.year})
            </div>
          </div>
        </div>

        {/* MODULE 1: Community bar - shows if votes exist */}
        {hasVotes && (
          <div className="border border-black/20 dark:border-white/20 bg-stone-50 dark:bg-stone-950 p-3 space-y-2">
            {/* Community label */}
            <div className="text-[9px] uppercase tracking-widest text-black/60 dark:text-white/60" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
              COMMUNITY
            </div>
            {/* Brutal bar */}
            <div className="relative h-7 overflow-hidden flex bg-stone-200 dark:bg-stone-800">
              {bookPct > 0 && (
                <div
                  className="transition-all duration-500"
                  style={{
                    width: `${bookPct}%`,
                    backgroundColor: bookAccent
                  }}
                />
              )}
              {screenPct > 0 && (
                <div
                  className="transition-all duration-500"
                  style={{
                    width: `${screenPct}%`,
                    backgroundColor: screenAccent
                  }}
                />
              )}
            </div>
            {/* Single line: percentages + sample size */}
            <div className="flex items-center justify-between text-[9px] text-black/60 dark:text-white/60 uppercase tracking-wider pt-1.5" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
              <span>BOOK {bookPct}%</span>
              <span className="font-bold">SAMPLE SIZE: {totalVotes}</span>
              <span>SCREEN {screenPct}%</span>
            </div>
          </div>
        )}

        {/* MODULE 2: Action module - vote + faithfulness */}
        <div className="border border-black/20 dark:border-white/20 bg-stone-50 dark:bg-stone-950 p-3 space-y-3">
          {/* Vote section */}
          {!userVote && !showEditVote ? (
            <div className="space-y-1.5">
              <div className="text-[9px] uppercase tracking-widest text-black/60 dark:text-white/60 text-center" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
                CAST YOUR VOTE
              </div>
              {/* Main vote buttons - Book and Screen */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleVote('BOOK')}
                  disabled={isSubmitting}
                  className="py-3 font-bold border text-xs disabled:opacity-50 transition-all rounded-md"
                  style={{
                    borderColor: bookAccent,
                    backgroundColor: 'transparent',
                    color: bookAccent,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.05em'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.backgroundColor = bookAccent;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = bookAccent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = bookAccent;
                  }}
                >
                  BOOK
                </button>
                <button
                  onClick={() => handleVote('SCREEN')}
                  disabled={isSubmitting}
                  className="py-3 font-bold border text-xs disabled:opacity-50 transition-all rounded-md"
                  style={{
                    borderColor: screenAccent,
                    backgroundColor: 'transparent',
                    color: screenAccent,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.05em'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.backgroundColor = screenAccent;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = screenAccent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = screenAccent;
                  }}
                >
                  SCREEN
                </button>
              </div>
              {/* Tie button - secondary row */}
              <button
                onClick={() => handleVote('TIE')}
                disabled={isSubmitting}
                className="w-full py-2 font-bold border border-black/30 dark:border-white/30 text-black/70 dark:text-white/70 text-xs disabled:opacity-50 transition-all rounded-md hover:border-black hover:dark:border-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.05em',
                  backgroundColor: 'transparent'
                }}
              >
                TIE
              </button>
            </div>
          ) : userVote && !showEditVote ? (
            <div className="text-center py-1">
              <span className="text-[10px] text-black/70 dark:text-white/70 uppercase tracking-wider font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
                You voted: {userVote.preference} • <button onClick={() => setShowEditVote(true)} className="underline hover:no-underline text-black dark:text-white">EDIT</button>
              </span>
            </div>
          ) : showEditVote && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleVote('BOOK')}
                  disabled={isSubmitting}
                  className="py-3 font-bold border text-xs disabled:opacity-50 transition-all rounded-md"
                  style={{
                    borderColor: bookAccent,
                    backgroundColor: 'transparent',
                    color: bookAccent,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.05em'
                  }}
                >
                  BOOK
                </button>
                <button
                  onClick={() => handleVote('SCREEN')}
                  disabled={isSubmitting}
                  className="py-3 font-bold border text-xs disabled:opacity-50 transition-all rounded-md"
                  style={{
                    borderColor: screenAccent,
                    backgroundColor: 'transparent',
                    color: screenAccent,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.05em'
                  }}
                >
                  SCREEN
                </button>
              </div>
              <button
                onClick={() => handleVote('TIE')}
                disabled={isSubmitting}
                className="w-full py-2 font-bold border border-black/30 dark:border-white/30 text-black/70 dark:text-white/70 text-xs disabled:opacity-50 transition-all rounded-md hover:border-black hover:dark:border-white hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.05em'
                }}
              >
                TIE
              </button>
              <button
                onClick={() => setShowEditVote(false)}
                className="w-full text-[9px] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white uppercase tracking-wider underline hover:no-underline"
                style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Faithfulness - inline tight row */}
          <div className="border-t border-black/10 dark:border-white/10 pt-3 space-y-2">
            {avgFaithfulness !== null && (
              <div className="text-center text-[10px] font-bold text-black dark:text-white uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
                FAITHFULNESS {avgFaithfulness.toFixed(1)}/5 ({faithfulnessCount} {faithfulnessCount === 1 ? 'RATING' : 'RATINGS'})
              </div>
            )}
            {!userFaithfulness ? (
              <div className="space-y-1.5">
                <div className="text-[9px] uppercase tracking-widest text-black/60 dark:text-white/60 text-center" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
                  RATE (OPTIONAL)
                </div>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFaithfulnessRate(rating)}
                      disabled={isSubmitting}
                      className="w-8 h-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white font-bold text-xs transition-all disabled:opacity-50 hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black rounded-md"
                      style={{
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="text-center text-[8px] text-black/50 dark:text-white/50 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
                  1 LOOSE • 5 FAITHFUL
                </div>
              </div>
            ) : (
              <div className="text-center text-[9px] text-black/70 dark:text-white/70 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                You rated: {userFaithfulness} • <button onClick={() => setFaithfulnessRating(null)} className="underline hover:no-underline font-bold text-black dark:text-white">EDIT</button>
              </div>
            )}
          </div>
        </div>

        {/* MODULE 3: CTA module - primary + secondary */}
        <div className="space-y-2">
          {/* Primary CTA - big button */}
          <button
            onClick={onAddDiff}
            className="w-full py-3 px-3 font-bold border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-transparent hover:text-black dark:hover:bg-transparent dark:hover:text-white transition-all text-xs rounded-md"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.05em'
            }}
          >
            {hasVotes ? 'ADD DIFFERENCE' : 'LOG FIRST DIFFERENCE'}
          </button>

          {/* Secondary action - other versions */}
          <div className="relative">
            <AdaptationSwitcher
              workId={work.id}
              workSlug={work.slug}
              currentScreenWorkId={screenWork.id}
              currentScreenWorkTitle={screenWork.title}
              currentScreenWorkYear={screenWork.year}
              currentScreenWorkType={screenWork.type}
              currentScreenWorkPosterUrl={screenWork.poster_url}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
