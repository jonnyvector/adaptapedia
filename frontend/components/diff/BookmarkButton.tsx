'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';

interface BookmarkButtonProps {
  workId: number;
  screenWorkId: number;
  className?: string;
}

export default function BookmarkButton({
  workId,
  screenWorkId,
  className = '',
}: BookmarkButtonProps): JSX.Element {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if comparison is bookmarked
  useEffect(() => {
    const checkBookmark = async (): Promise<void> => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const result = await api.bookmarks.check(workId, screenWorkId);
        setIsBookmarked(result.is_bookmarked);
        setBookmarkId(result.bookmark_id);
      } catch (err) {
        console.error('Failed to check bookmark status:', err);
      }
    };

    checkBookmark();
  }, [isAuthenticated, workId, screenWorkId]);

  const handleToggleBookmark = async (): Promise<void> => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = `/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isBookmarked) {
        // Remove bookmark
        await api.bookmarks.deleteByComparison(workId, screenWorkId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        // Add bookmark
        const bookmark = await api.bookmarks.create(workId, screenWorkId);
        setIsBookmarked(true);
        setBookmarkId(bookmark.id);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update bookmark');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleToggleBookmark}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border transition-colors min-h-[40px] ${
          isBookmarked
            ? 'bg-link/10 border-link text-link hover:bg-link/20'
            : 'bg-surface border-border text-foreground hover:bg-surface2'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={isBookmarked ? 0 : 2}
        >
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
        <span className="text-sm font-medium hidden sm:inline">
          {isLoading ? 'Saving...' : isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      </button>
      {error && (
        <p className="text-xs text-warn mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
