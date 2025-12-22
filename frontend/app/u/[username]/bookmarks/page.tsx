import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import type { Bookmark, ApiResponse } from '@/lib/types';

interface BookmarksPageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: BookmarksPageProps): Promise<Metadata> {
  const { username } = params;

  return {
    title: `${username}'s Bookmarks - Adaptapedia`,
    description: `View ${username}'s bookmarked comparisons on Adaptapedia`,
  };
}

async function getBookmarks(username: string): Promise<Bookmark[]> {
  try {
    const response = await api.bookmarks.list() as ApiResponse<Bookmark>;
    return response.results;
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
    return [];
  }
}

export default async function BookmarksPage({ params }: BookmarksPageProps): Promise<JSX.Element> {
  const { username } = params;
  const bookmarks = await getBookmarks(username);

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href={`/u/${username}`} className="text-link hover:underline">
              ← Back to Profile
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">{username}'s Bookmarks</h1>
          <p className="text-muted">
            {bookmarks.length} {bookmarks.length === 1 ? 'comparison' : 'comparisons'} saved
          </p>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-lg border border-border">
            <p className="text-lg text-muted mb-4">No bookmarks yet</p>
            <p className="text-sm text-muted mb-6">
              Bookmark comparisons to save them for later
            </p>
            <Link
              href="/browse"
              className="inline-block px-6 py-3 bg-link text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
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
                className="block border-2 border-border rounded-lg p-6 hover:shadow-lg hover:border-link/30 transition-all bg-surface"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Book Section */}
                  <div className="flex-1 flex gap-4">
                    {bookmark.work_cover_url && (
                      <img
                        src={bookmark.work_cover_url}
                        alt={bookmark.work_title}
                        className="w-20 h-28 object-cover rounded border border-border shadow-sm"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-xs text-muted mb-1">Book</div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {bookmark.work_title}
                      </h3>
                      {bookmark.work_author && (
                        <p className="text-sm text-muted">by {bookmark.work_author}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-2xl text-muted self-center hidden lg:block">→</div>

                  {/* Screen Section */}
                  <div className="flex-1 flex gap-4 lg:flex-row-reverse">
                    {bookmark.screen_work_poster_url && (
                      <img
                        src={bookmark.screen_work_poster_url}
                        alt={bookmark.screen_work_title}
                        className="w-20 h-28 object-cover rounded border border-border shadow-sm"
                      />
                    )}
                    <div className="flex-1 lg:text-right">
                      <div className="text-xs text-muted mb-1">
                        {bookmark.screen_work_type === 'MOVIE' ? 'Movie' : 'TV Series'}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {bookmark.screen_work_title}
                      </h3>
                      {bookmark.screen_work_year && (
                        <p className="text-sm text-muted">({bookmark.screen_work_year})</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted">
                    Bookmarked {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-link font-medium">
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
