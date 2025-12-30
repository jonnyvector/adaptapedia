'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import type { PreferenceChoice } from '@/lib/types';

/**
 * Submit a comparison vote (book vs screen preference)
 */
export async function submitComparisonVote(
  workId: number,
  screenWorkId: number,
  preference: PreferenceChoice,
  faithfulnessRating?: number | null
) {
  try {
    const result = await api.comparisonVotes.submit({
      work: workId,
      screen_work: screenWorkId,
      preference,
      faithfulness_rating: faithfulnessRating || undefined,
    });

    // Revalidate the comparison page to show updated stats
    revalidatePath('/compare/[book]/[screen]', 'page');

    return { success: true, data: result };
  } catch (error) {
    console.error('Comparison vote submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit vote'
    };
  }
}

/**
 * Fetch comparison vote stats
 * This can be called server-side during page render
 */
export async function getComparisonVoteStats(workId: number, screenWorkId: number) {
  try {
    const data = await api.comparisonVotes.getStats(workId, screenWorkId);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch comparison vote stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
      data: null
    };
  }
}
