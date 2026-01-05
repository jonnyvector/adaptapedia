'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { VoteType } from '@/lib/types';

const API_BASE_URL = process.env.API_URL || 'http://backend:8000/api';

/**
 * Submit a vote on a diff item
 * Server action for voting - handles API call and cache revalidation
 */
export async function submitVote(diffId: number, voteType: VoteType) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_BASE_URL}/diffs/items/${diffId}/vote/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ vote: voteType }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Failed to submit vote');
    }

    const result = await response.json();

    // No revalidation needed - client-side optimistic updates handle UI changes
    // Revalidating would overwrite the optimistic update with refetched data

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
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_BASE_URL}/diffs/items/${diffId}/vote/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Failed to delete vote');
    }

    // No revalidation needed - client-side optimistic updates handle UI changes

    return { success: true };
  } catch (error) {
    console.error('Vote deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete vote'
    };
  }
}
