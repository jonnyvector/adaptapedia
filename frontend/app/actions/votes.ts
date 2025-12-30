'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import type { VoteType } from '@/lib/types';

/**
 * Submit a vote on a diff item
 * Server action for voting - handles API call and cache revalidation
 */
export async function submitVote(diffId: number, voteType: VoteType) {
  try {
    const result = await api.votes.submit(diffId, { vote_type: voteType });

    // Revalidate the comparison page to show updated vote counts
    // This will trigger a re-fetch of the page data
    revalidatePath('/compare/[book]/[screen]', 'page');

    return { success: true, data: result };
  } catch (error) {
    console.error('Vote submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit vote'
    };
  }
}

/**
 * Delete a vote on a diff item
 */
export async function deleteVote(diffId: number) {
  try {
    await api.votes.delete(diffId);

    // Revalidate to show vote removed
    revalidatePath('/compare/[book]/[screen]', 'page');

    return { success: true };
  } catch (error) {
    console.error('Vote deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete vote'
    };
  }
}
