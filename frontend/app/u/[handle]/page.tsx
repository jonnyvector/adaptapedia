import { api } from '@/lib/api';
import type { UserProfile, DiffItem, Comment, ApiResponse } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import UserProfileHeader from '@/components/user/UserProfileHeader';
import UserStats from '@/components/user/UserStats';
import UserDiffsList from '@/components/user/UserDiffsList';
import UserCommentsList from '@/components/user/UserCommentsList';

interface PageProps {
  params: {
    handle: string;
  };
}

interface UserProfileData {
  profile: UserProfile;
  diffs: DiffItem[];
  comments: Comment[];
  hasMoreDiffs: boolean;
  hasMoreComments: boolean;
}

async function getUserProfileData(handle: string): Promise<UserProfileData> {
  try {
    // Fetch user profile
    const profile = (await api.users.getProfile(handle)) as UserProfile;

    // Fetch user's diffs (first 20)
    const diffsResponse = (await api.users.getDiffs(handle, {
      ordering: 'newest',
      page_size: '20',
    })) as ApiResponse<DiffItem>;

    // Fetch user's comments (first 20)
    const commentsResponse = (await api.users.getComments(handle, {
      ordering: 'newest',
      page_size: '20',
    })) as ApiResponse<Comment>;

    return {
      profile,
      diffs: diffsResponse.results,
      comments: commentsResponse.results,
      hasMoreDiffs: diffsResponse.next !== null,
      hasMoreComments: commentsResponse.next !== null,
    };
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    notFound();
  }
}

export default async function UserProfilePage({
  params,
}: PageProps): Promise<JSX.Element> {
  const { profile, diffs, comments, hasMoreDiffs, hasMoreComments } =
    await getUserProfileData(params.handle);

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Profile Header */}
        <UserProfileHeader profile={profile} />

        {/* Stats Cards */}
        <UserStats profile={profile} />

        {/* Activity Sections */}
        <div className="space-y-6 sm:space-y-8">
          {/* Diffs Section */}
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Diffs Created
                {profile.diffs_count > 0 && (
                  <span className="text-sm sm:text-base text-muted ml-2">
                    ({profile.diffs_count})
                  </span>
                )}
              </h2>
            </div>

            <UserDiffsList diffs={diffs} />

            {hasMoreDiffs && (
              <div className="mt-4 text-center">
                <p className="text-xs sm:text-sm text-muted">
                  Showing first 20 diffs. Pagination coming soon.
                </p>
              </div>
            )}
          </section>

          {/* Comments Section */}
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Recent Comments
                {profile.comments_count > 0 && (
                  <span className="text-sm sm:text-base text-muted ml-2">
                    ({profile.comments_count})
                  </span>
                )}
              </h2>
            </div>

            <UserCommentsList comments={comments} />

            {hasMoreComments && (
              <div className="mt-4 text-center">
                <p className="text-xs sm:text-sm text-muted">
                  Showing first 20 comments. Pagination coming soon.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
          <Link href="/" className="text-link hover:underline text-sm sm:text-base inline-block min-h-[44px] flex items-center">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const profile = (await api.users.getProfile(params.handle)) as UserProfile;
    return {
      title: `${profile.username}'s Profile - Adaptapedia`,
      description: `View ${profile.username}'s contributions to Adaptapedia: ${profile.diffs_count} diffs, ${profile.comments_count} comments, ${profile.reputation_score} reputation.`,
    };
  } catch (error) {
    return {
      title: 'User Profile - Adaptapedia',
      description: 'User profile page',
    };
  }
}
