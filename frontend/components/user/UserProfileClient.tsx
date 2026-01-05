'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { UserProfile, DiffItem, Vote, Comment, ApiResponse } from '@/lib/types';
import Link from 'next/link';
import ReputationProgress from './ReputationProgress';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase, RADIUS } from '@/lib/brutalist-design';
import { TrophyIcon } from '@/components/ui/Icons';

interface UserProfileClientProps {
  profile: UserProfile;
}

type TabType = 'diffs' | 'votes' | 'comments';

export default function UserProfileClient({ profile }: UserProfileClientProps): JSX.Element {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('diffs');
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<'newest' | 'most_votes'>('newest');

  const isOwnProfile = currentUser?.username === profile.username;

  // Load data based on active tab
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'diffs') {
          const response = await api.users.getDiffs(profile.username, { ordering });
          setDiffs((response as ApiResponse<DiffItem>).results || []);
        } else if (activeTab === 'votes') {
          if (isOwnProfile) {
            const response = await api.users.getVotes(profile.username);
            setVotes((response as ApiResponse<Vote>).results || []);
          }
        } else if (activeTab === 'comments') {
          const response = await api.users.getComments(profile.username);
          setComments((response as ApiResponse<Comment>).results || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, profile.username, ordering, isOwnProfile]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'MOD':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'TRUSTED_EDITOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatRoleLabel = (role: string): string => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container py-8">
      {/* Profile Header */}
      <div className={`bg-white dark:bg-black border ${BORDERS.medium} ${RADIUS.control} p-6 mb-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold text-black dark:text-white mb-2 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>{profile.username}</h1>
            <div className="flex items-center gap-2">
              <span className={`${TEXT.metadata} px-2 py-1 border ${BORDERS.subtle} ${RADIUS.control} ${getRoleBadgeColor(profile.role)} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                {formatRoleLabel(profile.role)}
              </span>
              <span className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                Joined {formatDate(profile.date_joined)}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="mt-6">
            <h2 className={`${TEXT.body} font-bold text-black dark:text-white mb-3 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Badges</h2>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`bg-white dark:bg-black border ${BORDERS.solid} ${RADIUS.control} px-3 py-2 flex items-center gap-2`}
                  title={`Earned ${formatDate(badge.earned_at)}`}
                >
                  <TrophyIcon className="w-4 h-4" />
                  <span className={`${TEXT.secondary} font-bold text-black dark:text-white uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                    {badge.badge_display}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
            <div className={`text-2xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>{profile.diffs_count}</div>
            <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Diffs Created</div>
          </div>
          <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
            <div className={`text-2xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>{profile.votes_count}</div>
            <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Votes Cast</div>
          </div>
          <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
            <div className={`text-2xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>{profile.comments_count}</div>
            <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Comments</div>
          </div>
          <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
            <div className={`text-2xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>{profile.reputation_score}</div>
            <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Reputation</div>
          </div>
        </div>

        {/* Additional Stats */}
        {profile.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {profile.stats.accuracy_rate !== undefined && (
              <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
                <div className={`text-xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                  {profile.stats.accuracy_rate}%
                </div>
                <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Accuracy Rate</div>
              </div>
            )}
            {profile.stats.helpful_comments_count !== undefined && (
              <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
                <div className={`text-xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                  {profile.stats.helpful_comments_count}
                </div>
                <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Helpful Comments</div>
              </div>
            )}
            {profile.stats.sources_added_count !== undefined && (
              <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} ${RADIUS.control} p-4`}>
                <div className={`text-xl font-bold text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>
                  {profile.stats.sources_added_count}
                </div>
                <div className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Sources Added</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reputation Progress - Only for own profile */}
      {isOwnProfile && currentUser && (
        <div className="mb-6">
          <ReputationProgress user={currentUser} />
        </div>
      )}

      {/* Activity Tabs */}
      <div className={`bg-white dark:bg-black border ${BORDERS.medium} ${RADIUS.control}`}>
        <div className={`border-b ${BORDERS.medium}`}>
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab('diffs')}
              className={`px-4 py-2 ${RADIUS.control} ${TEXT.secondary} font-bold transition-colors ${monoUppercase} ${
                activeTab === 'diffs'
                  ? `bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid}`
                  : `${TEXT.mutedStrong} hover:text-black hover:dark:text-white border ${BORDERS.subtle}`
              }`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
            >
              Diffs ({profile.diffs_count})
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('votes')}
                className={`px-4 py-2 ${RADIUS.control} ${TEXT.secondary} font-bold transition-colors ${monoUppercase} ${
                  activeTab === 'votes'
                    ? `bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid}`
                    : `${TEXT.mutedStrong} hover:text-black hover:dark:text-white border ${BORDERS.subtle}`
                }`}
                style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
              >
                Voting History ({profile.votes_count})
              </button>
            )}
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 ${RADIUS.control} ${TEXT.secondary} font-bold transition-colors ${monoUppercase} ${
                activeTab === 'comments'
                  ? `bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid}`
                  : `${TEXT.mutedStrong} hover:text-black hover:dark:text-white border ${BORDERS.subtle}`
              }`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
            >
              Comments ({profile.comments_count})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className={`text-center py-8 ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Loading...</div>
          ) : error ? (
            <div className={`text-center py-8 text-red-600 dark:text-red-400`} style={{ fontFamily: FONTS.mono }}>{error}</div>
          ) : (
            <>
              {/* Diffs Tab */}
              {activeTab === 'diffs' && (
                <div>
                  {/* Ordering Controls */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm text-muted">Sort by:</span>
                    <button
                      onClick={() => setOrdering('newest')}
                      className={`text-sm px-3 py-1 rounded-md ${
                        ordering === 'newest'
                          ? 'bg-link text-white'
                          : 'text-muted hover:text-foreground border border-border'
                      }`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => setOrdering('most_votes')}
                      className={`text-sm px-3 py-1 rounded-md ${
                        ordering === 'most_votes'
                          ? 'bg-link text-white'
                          : 'text-muted hover:text-foreground border border-border'
                      }`}
                    >
                      Most Votes
                    </button>
                  </div>

                  {diffs.length === 0 ? (
                    <div className="text-center py-8 text-muted">No diffs created yet</div>
                  ) : (
                    <div className="space-y-4">
                      {diffs.map((diff) => (
                        <div key={diff.id} className="border border-border rounded-lg p-4 hover:bg-surface2 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Link
                                href={`/compare/${diff.work_slug}/${diff.screen_work_slug}`}
                                className="text-link hover:underline font-medium"
                              >
                                {diff.work_title} / {diff.screen_work_title}
                              </Link>
                              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-surface2 text-muted">
                                {diff.category}
                              </span>
                            </div>
                            <span className="text-xs text-muted whitespace-nowrap ml-4">
                              {formatDate(diff.created_at)}
                            </span>
                          </div>
                          <p className="text-foreground mb-2">{diff.claim}</p>
                          {diff.detail && (
                            <p className="text-sm text-muted mb-2">{diff.detail}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted">
                            <span className="flex items-center gap-1">
                              <span className="text-green-600 dark:text-green-400">↑{diff.vote_counts.accurate}</span>
                              <span className="text-yellow-600 dark:text-yellow-400">~{diff.vote_counts.needs_nuance}</span>
                              <span className="text-red-600 dark:text-red-400">↓{diff.vote_counts.disagree}</span>
                            </span>
                            {diff.spoiler_scope !== 'NONE' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Spoilers: {diff.spoiler_scope.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Votes Tab (only for own profile) */}
              {activeTab === 'votes' && isOwnProfile && (
                <div>
                  {votes.length === 0 ? (
                    <div className="text-center py-8 text-muted">No votes cast yet</div>
                  ) : (
                    <div className="space-y-4">
                      {votes.map((vote) => (
                        <div key={vote.id} className="border border-border rounded-lg p-4 hover:bg-surface2 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Link
                                href={`/compare/${vote.work_slug}/${vote.screen_work_slug}`}
                                className="text-link hover:underline font-medium"
                              >
                                {vote.work_title} / {vote.screen_work_title}
                              </Link>
                              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-surface2 text-muted">
                                {vote.diff_item_category}
                              </span>
                            </div>
                            <span className="text-xs text-muted whitespace-nowrap ml-4">
                              {formatDate(vote.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted mb-2">"{vote.diff_item_claim}"</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Your vote:</span>
                            <span
                              className={`text-sm px-2 py-1 rounded-full ${
                                vote.vote === 'ACCURATE'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : vote.vote === 'NEEDS_NUANCE'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {vote.vote === 'ACCURATE' ? 'Accurate' : vote.vote === 'NEEDS_NUANCE' ? 'Needs Nuance' : 'Disagree'}
                            </span>
                            {vote.created_by_username && (
                              <span className="text-sm text-muted">
                                by <Link href={`/u/${vote.created_by_username}`} className="text-link hover:underline">{vote.created_by_username}</Link>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div>
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted">No comments posted yet</div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border border-border rounded-lg p-4 hover:bg-surface2 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Link
                                href={`/compare/${comment.work_slug}/${comment.screen_work_slug}`}
                                className="text-link hover:underline font-medium"
                              >
                                {comment.work_title} / {comment.screen_work_title}
                              </Link>
                            </div>
                            <span className="text-xs text-muted whitespace-nowrap ml-4">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted mb-2">On: "{comment.diff_item_claim}"</p>
                          <p className="text-foreground">{comment.body}</p>
                          {comment.spoiler_scope !== 'NONE' && (
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Spoilers: {comment.spoiler_scope.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
