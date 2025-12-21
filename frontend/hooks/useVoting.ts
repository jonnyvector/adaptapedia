import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { VoteType } from '@/lib/types';

interface VoteCounts {
  accurate: number;
  needs_nuance: number;
  disagree: number;
}

interface UseVotingReturn {
  voteCounts: VoteCounts;
  userVote: VoteType | null;
  isVoting: boolean;
  error: string | null;
  submitVote: (voteType: VoteType) => Promise<void>;
}

export function useVoting(
  diffId: number,
  initialVoteCounts: VoteCounts,
  initialUserVote: VoteType | null = null
): UseVotingReturn {
  const [voteCounts, setVoteCounts] = useState<VoteCounts>(initialVoteCounts);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVote = useCallback(
    async (voteType: VoteType) => {
      setIsVoting(true);
      setError(null);

      // Store previous state for rollback
      const previousVoteCounts = { ...voteCounts };
      const previousUserVote = userVote;

      // Helper to convert VoteType to VoteCounts key
      const voteTypeToKey = (type: VoteType): keyof VoteCounts => {
        switch (type) {
          case 'ACCURATE':
            return 'accurate';
          case 'NEEDS_NUANCE':
            return 'needs_nuance';
          case 'DISAGREE':
            return 'disagree';
        }
      };

      // Optimistic update
      const newVoteCounts = { ...voteCounts };
      let newUserVote: VoteType | null = voteType;

      // If clicking the same vote, toggle it off (remove vote)
      if (userVote === voteType) {
        const key = voteTypeToKey(voteType);
        newVoteCounts[key] = Math.max(0, newVoteCounts[key] - 1);
        newUserVote = null;
      } else {
        // Remove previous vote if exists
        if (previousUserVote) {
          const prevKey = voteTypeToKey(previousUserVote);
          newVoteCounts[prevKey] = Math.max(0, newVoteCounts[prevKey] - 1);
        }

        // Add new vote
        const newKey = voteTypeToKey(voteType);
        newVoteCounts[newKey] = newVoteCounts[newKey] + 1;
      }

      setVoteCounts(newVoteCounts);
      setUserVote(newUserVote);

      try {
        await api.diffs.vote(diffId, voteType);
      } catch (err) {
        // Rollback on error
        setVoteCounts(previousVoteCounts);
        setUserVote(previousUserVote);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to submit vote. Please try again.');
        }
      } finally {
        setIsVoting(false);
      }
    },
    [diffId, voteCounts, userVote]
  );

  return {
    voteCounts,
    userVote,
    isVoting,
    error,
    submitVote,
  };
}
