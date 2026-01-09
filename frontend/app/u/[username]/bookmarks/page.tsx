'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Bookmark, ApiResponse } from '@/lib/types';
import { FONTS, BORDERS, TEXT, RADIUS } from '@/lib/brutalist-design';

interface BookmarksPageProps {
  params: {
    username: string;
  };
}

export default function BookmarksPage({ params }: BookmarksPageProps): JSX.Element {
  const { username } = params;
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);

  // Fetch bookmarks
  useEffect(() => {
    async function fetchBookmarks() {
      if (!isAuthenticated || !user) {
        setIsLoadingBookmarks(false);
        return;
      }

      try {
        const response = await api.bookmarks.list() as ApiResponse<Bookmark>;
        setBookmarks(response.results);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
        setBookmarks([]);
      } finally {
        setIsLoadingBookmarks(false);
      }
    }

    if (!isLoading) {
      fetchBookmarks();
    }
  }, [isAuthenticated, user, isLoading]);

  // Redirect if not the current user's bookmarks
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.username !== username) {
      router.push(`/u/${user.username}/bookmarks`);
    }
  }, [isLoading, isAuthenticated, user, username, router]);

  // Show loading state
  if (isLoading || isLoadingBookmarks) {
    return (
      <main className="min-h-screen">
        <div className="container py-6">
          <div className="text-center py-12">
            <p className={`${TEXT.body} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>Loading bookmarks...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen">
        <div className="container py-6">
          <div className={`text-center py-12 bg-stone-50 dark:bg-stone-950 ${RADIUS.control} border ${BORDERS.medium}`}>
            <p className={`${TEXT.body} ${TEXT.primary} mb-4 font-bold`} style={{ fontFamily: FONTS.mono }}>Please log in to view bookmarks</p>
            <Link
              href="/auth/login"
              className={`inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} hover:bg-black/90 hover:dark:bg-white/90 transition-colors border ${BORDERS.solid} font-bold uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono, letterSpacing: '0.05em' }}
            >
              Log In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href={`/u/${username}`}
              className={`${TEXT.body} ${TEXT.primary} hover:underline font-bold uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono, letterSpacing: '0.05em' }}
            >
              ← Back to Profile
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-black dark:text-white" style={{ fontFamily: FONTS.mono }}>{username}&apos;s Bookmarks</h1>
          <p className={`${TEXT.body} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}>
            {bookmarks.length} {bookmarks.length === 1 ? 'comparison' : 'comparisons'} saved
          </p>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className={`text-center py-12 bg-stone-50 dark:bg-stone-950 ${RADIUS.control} border ${BORDERS.medium}`}>
            <p className={`${TEXT.body} ${TEXT.primary} mb-4 font-bold`} style={{ fontFamily: FONTS.mono }}>No bookmarks yet</p>
            <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-6`} style={{ fontFamily: FONTS.mono }}>
              Bookmark comparisons to save them for later
            </p>
            <Link
              href="/browse"
              className={`inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black ${RADIUS.control} hover:bg-black/90 hover:dark:bg-white/90 transition-colors border ${BORDERS.solid} font-bold uppercase tracking-wider`}
              style={{ fontFamily: FONTS.mono, letterSpacing: '0.05em' }}
            >
              Explore Comparisons
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/compare/${bookmark.work_slug}/${bookmark.screen_work_slug}`}
                className={`block border ${BORDERS.medium} ${RADIUS.control} p-6 hover:border-black hover:dark:border-white transition-all bg-white dark:bg-black`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Book Section */}
                  <div className="flex-1 flex gap-4">
                    {bookmark.work_cover_url && (
                      <img
                        src={bookmark.work_cover_url}
                        alt={bookmark.work_title}
                        className={`w-20 h-28 object-cover ${RADIUS.control} border ${BORDERS.subtle}`}
                      />
                    )}
                    <div className="flex-1">
                      <div className={`${TEXT.label} ${TEXT.mutedMedium} mb-1 font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>Book</div>
                      <h3 className={`text-lg font-bold ${TEXT.primary} mb-1`} style={{ fontFamily: FONTS.mono }}>
                        {bookmark.work_title}
                      </h3>
                      {bookmark.work_author && (
                        <p className={`${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>by {bookmark.work_author}</p>
                      )}
                    </div>
                  </div>

                  <div className={`text-2xl ${TEXT.mutedMedium} self-center hidden lg:block`} style={{ fontFamily: FONTS.mono }}>→</div>

                  {/* Screen Section */}
                  <div className="flex-1 flex gap-4 lg:flex-row-reverse">
                    {bookmark.screen_work_poster_url && (
                      <img
                        src={bookmark.screen_work_poster_url}
                        alt={bookmark.screen_work_title}
                        className={`w-20 h-28 object-cover ${RADIUS.control} border ${BORDERS.subtle}`}
                      />
                    )}
                    <div className="flex-1 lg:text-right">
                      <div className={`${TEXT.label} ${TEXT.mutedMedium} mb-1 font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.1em' }}>
                        {bookmark.screen_work_type === 'MOVIE' ? 'Movie' : 'TV Series'}
                      </div>
                      <h3 className={`text-lg font-bold ${TEXT.primary} mb-1`} style={{ fontFamily: FONTS.mono }}>
                        {bookmark.screen_work_title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className={`mt-4 pt-4 border-t ${BORDERS.subtle} flex items-center justify-between`}>
                  <span className={`${TEXT.label} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.08em' }}>
                    Bookmarked {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                  <span className={`${TEXT.secondary} ${TEXT.primary} font-bold uppercase tracking-wider`} style={{ fontFamily: FONTS.mono, letterSpacing: '0.05em' }}>
                    View Comparison →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
