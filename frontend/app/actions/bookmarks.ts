'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

/**
 * Create a bookmark for a comparison
 */
export async function createBookmark(workId: number, screenWorkId: number) {
  try {
    const result = await api.bookmarks.create({ work: workId, screen_work: screenWorkId });

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
 * Delete a bookmark
 */
export async function deleteBookmark(bookmarkId: number) {
  try {
    await api.bookmarks.delete(bookmarkId);

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
