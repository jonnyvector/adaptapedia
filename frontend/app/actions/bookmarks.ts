'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

/**
 * Check if a comparison is bookmarked
 */
export async function checkBookmark(workId: number, screenWorkId: number) {
  try {
    const result = await api.bookmarks.check(workId, screenWorkId);
    return { success: true, data: result };
  } catch (error) {
    console.error('Bookmark check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check bookmark',
      data: { is_bookmarked: false, bookmark_id: null }
    };
  }
}

/**
 * Create a bookmark for a comparison
 */
export async function createBookmark(workId: number, screenWorkId: number) {
  try {
    const result = await api.bookmarks.create(workId, screenWorkId);

    // Revalidate the comparison page
    revalidatePath('/compare/[book]/[screen]', 'page');

    return { success: true, data: result };
  } catch (error) {
    console.error('Bookmark creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bookmark'
    };
  }
}

/**
 * Delete a bookmark by comparison IDs
 */
export async function deleteBookmarkByComparison(workId: number, screenWorkId: number) {
  try {
    await api.bookmarks.deleteByComparison(workId, screenWorkId);

    // Revalidate the comparison page
    revalidatePath('/compare/[book]/[screen]', 'page');

    return { success: true };
  } catch (error) {
    console.error('Bookmark deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete bookmark'
    };
  }
}
