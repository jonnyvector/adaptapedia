'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { FONTS, BORDERS, TEXT } from '@/lib/brutalist-design';

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
    const checkBookmarkStatus = async (): Promise<void> => {
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

    checkBookmarkStatus();
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
        // Remove bookmark using API client
        await api.bookmarks.deleteByComparison(workId, screenWorkId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        // Add bookmark using API client
        const result = await api.bookmarks.create(workId, screenWorkId);
        setIsBookmarked(true);
        setBookmarkId(result.id);
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
        className={`inline-flex items-center justify-center transition-colors p-2 ${
          isBookmarked
            ? `text-black dark:text-white`
            : `text-black/60 dark:text-white/60 hover:text-black hover:dark:text-white`
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ fontFamily: FONTS.mono }}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          style={{ minWidth: '16px', minHeight: '16px', flexShrink: 0 }}
          xmlns="http://www.w3.org/2000/svg"
          fill={isBookmarked ? 'currentColor' : 'none'}
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
          />
        </svg>
      </button>
      {error && (
        <p className={`${TEXT.metadata} text-red-600 dark:text-red-400 mt-1`} role="alert" style={{ fontFamily: FONTS.mono }}>
          {error}
        </p>
      )}
    </div>
  );
}
