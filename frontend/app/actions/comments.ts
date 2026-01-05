'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';
import type { SpoilerScope } from '@/lib/types';

/**
 * Create a comment on a diff item
 */
export async function createComment(
  diffItemId: number,
  content: string,
  spoilerScope: SpoilerScope,
  parentId?: number
) {
  try {
    const result = await api.comments.create(diffItemId, {
      content,
      spoiler_scope: spoilerScope,
      parent: parentId,
    });

    // No revalidation needed - component refetches comments after adding

    return { success: true, data: result };
  } catch (error) {
    console.error('Comment creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comment'
    };
  }
}

/**
 * Fetch comments for a diff item
 * Note: This is kept as a server action for on-demand fetching
 * Could also be moved to initial page data if comments should always load
 */
export async function fetchComments(diffItemId: number) {
  try {
    const response = await api.comments.list(diffItemId);
    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch comments',
      data: { results: [] }
    };
  }
}
