'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { BrutalistBookmarkIcon, BrutalistBookmarkFilledIcon } from '@/components/ui/Icons';
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
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleBookmark}
        disabled={isLoading}
        className={`p-2 min-h-0 h-auto ${
          isBookmarked
            ? `text-black dark:text-white`
            : `text-black/60 dark:text-white/60 hover:text-black hover:dark:text-white`
        }`}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      >
        {isBookmarked ? (
          <BrutalistBookmarkFilledIcon className="w-4 h-4" />
        ) : (
          <BrutalistBookmarkIcon className="w-4 h-4" />
        )}
      </Button>
      {error && (
        <p className={`${TEXT.metadata} text-red-600 dark:text-red-400 mt-1`} role="alert" style={{ fontFamily: FONTS.mono }}>
          {error}
        </p>
      )}
    </div>
  );
}
