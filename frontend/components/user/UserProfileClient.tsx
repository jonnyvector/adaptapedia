'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { UserProfile, DiffItem, ComparisonVote, Comment, ApiResponse } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import ReputationProgress from './ReputationProgress';
import ComparisonVoteCard from './ComparisonVoteCard';
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
  const [votes, setVotes] = useState<ComparisonVote[]>([]);
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
            setVotes(response.results || []);
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
            <Button
              variant={activeTab === 'diffs' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setActiveTab('diffs')}
            >
              Diffs ({profile.diffs_count})
            </Button>
            {isOwnProfile && (
              <Button
                variant={activeTab === 'votes' ? 'primary' : 'secondary'}
                size="md"
                onClick={() => setActiveTab('votes')}
              >
                Voting History ({profile.votes_count})
              </Button>
            )}
            <Button
              variant={activeTab === 'comments' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setActiveTab('comments')}
            >
              Comments ({profile.comments_count})
            </Button>
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
                    <span className={`${TEXT.secondary} ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>Sort by:</span>
                    <Button
                      variant={ordering === 'newest' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setOrdering('newest')}
                    >
                      Newest
                    </Button>
                    <Button
                      variant={ordering === 'most_votes' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setOrdering('most_votes')}
                    >
                      Most Votes
                    </Button>
                  </div>

                  {diffs.length === 0 ? (
                    <div className={`text-center py-8 ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>No diffs created yet</div>
                  ) : (
                    <div className="space-y-4">
                      {diffs.map((diff) => (
                        <div key={diff.id} className={`border ${BORDERS.medium} ${RADIUS.control} p-4 hover:bg-stone-50 hover:dark:bg-stone-950 transition-colors`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Link
                                href={`/compare/${diff.work_slug}/${diff.screen_work_slug}`}
                                className={`text-black dark:text-white hover:underline font-bold`}
                                style={{ fontFamily: FONTS.mono }}
                              >
                                {diff.work_title} / {diff.screen_work_title}
                              </Link>
                              <span className={`ml-2 ${TEXT.metadata} px-2 py-1 border ${BORDERS.subtle} ${RADIUS.control} ${TEXT.mutedStrong} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
                                {diff.category}
                              </span>
                            </div>
                            <span className={`${TEXT.metadata} ${TEXT.mutedMedium} whitespace-nowrap ml-4 uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                              {formatDate(diff.created_at)}
                            </span>
                          </div>
                          <p className={`text-black dark:text-white mb-2`} style={{ fontFamily: FONTS.mono }}>{diff.claim}</p>
                          {diff.detail && (
                            <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-2`} style={{ fontFamily: FONTS.mono }}>{diff.detail}</p>
                          )}
                          <div className={`flex items-center gap-4 ${TEXT.secondary} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                            <span className="flex items-center gap-1">
                              <span className="text-black dark:text-white">↑{diff.vote_counts.accurate}</span>
                              <span className="text-black/60 dark:text-white/60">~{diff.vote_counts.needs_nuance}</span>
                              <span className="text-black/40 dark:text-white/40">↓{diff.vote_counts.disagree}</span>
                            </span>
                            {diff.spoiler_scope !== 'NONE' && (
                              <span className={`${TEXT.metadata} px-2 py-1 border ${BORDERS.medium} ${RADIUS.control} bg-white dark:bg-black text-black dark:text-white font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
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
                    <div className={`text-center py-8 ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>No votes cast yet</div>
                  ) : (
                    <div className="space-y-4">
                      {votes.map((vote) => (
                        <ComparisonVoteCard key={vote.id} vote={vote} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div>
                  {comments.length === 0 ? (
                    <div className={`text-center py-8 ${TEXT.mutedMedium} uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>No comments posted yet</div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className={`border ${BORDERS.medium} ${RADIUS.control} p-4 hover:bg-stone-50 hover:dark:bg-stone-950 transition-colors`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Link
                                href={`/compare/${comment.work_slug}/${comment.screen_work_slug}`}
                                className={`text-black dark:text-white hover:underline font-bold`}
                                style={{ fontFamily: FONTS.mono }}
                              >
                                {comment.work_title} / {comment.screen_work_title}
                              </Link>
                            </div>
                            <span className={`${TEXT.metadata} ${TEXT.mutedMedium} whitespace-nowrap ml-4 uppercase tracking-wider`} style={{ fontFamily: FONTS.mono }}>
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-2`} style={{ fontFamily: FONTS.mono }}>On: &quot;{comment.diff_item_claim}&quot;</p>
                          <p className={`text-black dark:text-white`} style={{ fontFamily: FONTS.mono }}>{comment.body}</p>
                          {comment.spoiler_scope !== 'NONE' && (
                            <div className="mt-2">
                              <span className={`${TEXT.metadata} px-2 py-1 border ${BORDERS.medium} ${RADIUS.control} bg-white dark:bg-black text-black dark:text-white font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>
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
