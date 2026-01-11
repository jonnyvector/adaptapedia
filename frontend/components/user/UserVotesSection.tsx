'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { ComparisonVote, ApiResponse } from '@/lib/types';
import UserVotesList from './UserVotesList';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase, RADIUS} from '@/lib/brutalist-design';

interface UserVotesSectionProps {
  username: string;
  votesCount: number;
}

export default function UserVotesSection({
  username,
  votesCount,
}: UserVotesSectionProps): JSX.Element | null {
  const { isAuthenticated, user } = useAuth();
  const [votes, setVotes] = useState<ComparisonVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Only show votes if viewing own profile
  const isOwnProfile = isAuthenticated && user && user.username === username;

  useEffect(() => {
    if (!isOwnProfile) {
      setLoading(false);
      return;
    }

    const fetchVotes = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await api.users.getVotes(username, {
          ordering: 'newest',
          page_size: '20',
        });

        setVotes(response.results);
        setHasMore(response.next !== null);
      } catch (err) {
        console.error('Failed to fetch votes:', err);
        setError('Failed to load voting history');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [username, isOwnProfile]);

  // Don't render anything if not viewing own profile
  if (!isOwnProfile) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className={`text-xl sm:text-2xl font-bold text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>
          Your Voting History
          {votesCount > 0 && (
            <span className={`${TEXT.secondary} ${TEXT.mutedMedium} ml-2`} style={{ fontFamily: FONTS.mono }}>
              ({votesCount})
            </span>
          )}
        </h2>
      </div>

      {loading && (
        <div className="space-y-4">
          <LoadingSkeleton width="w-full" height="h-32" />
          <LoadingSkeleton width="w-full" height="h-32" />
          <LoadingSkeleton width="w-full" height="h-32" />
        </div>
      )}

      {error && !loading && (
        <div className={`border ${BORDERS.solid} border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-950/20 ${RADIUS.control} p-6 text-center`}>
          <p className={`text-red-700 dark:text-red-400`} style={{ fontFamily: FONTS.mono }}>{error}</p>
        </div>
      )}

      {!loading && !error && <UserVotesList votes={votes} />}

      {hasMore && (
        <div className="mt-4 text-center">
          <p className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
            Showing first 20 votes. Pagination coming soon.
          </p>
        </div>
      )}
    </section>
  );
}
