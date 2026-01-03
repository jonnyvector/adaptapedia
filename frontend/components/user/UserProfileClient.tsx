'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { UserProfile, DiffItem, Vote, Comment, ApiResponse } from '@/lib/types';
import Link from 'next/link';
import ReputationProgress from './ReputationProgress';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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

  const getBadgeIcon = (badgeType: string): string => {
    const iconMap: Record<string, string> = {
      // Milestone badges
      'FIRST_VOTE': '🗳️',
      'FIRST_COMMENT': '💬',
      'FIRST_DIFF': '✍️',
      'VOTER_10': '🎯',
      'VOTER_50': '🏆',
      'VOTER_100': '👑',
      'COMMENTER_10': '💭',
      'COMMENTER_50': '🗨️',
      'COMMENTER_100': '📣',
      'CONTRIBUTOR_10': '📝',
      'CONTRIBUTOR_50': '📚',
      'CONTRIBUTOR_100': '🏅',
      // Quality badges
      'WELL_SOURCED': '📖',
      'HIGH_ACCURACY': '✓',
      'CONSENSUS_BUILDER': '🤝',
      // Special badges
      'EARLY_ADOPTER': '🌟',
      'WEEKLY_STREAK_7': '🔥',
    };
    return iconMap[badgeType] || '🏆';
  };

  return (
    <div className="container py-8">
      {/* Profile Header */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{profile.username}</h1>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(profile.role)}`}>
                {formatRoleLabel(profile.role)}
              </span>
              <span className="text-sm text-muted">
                Joined {formatDate(profile.date_joined)}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Badges</h2>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-2 flex items-center gap-2"
                  title={`Earned ${formatDate(badge.earned_at)}`}
                >
                  <span className="text-xl">{getBadgeIcon(badge.badge_type)}</span>
                  <span className="text-sm font-medium text-foreground">
                    {badge.badge_display}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-surface2 p-4 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{profile.diffs_count}</div>
            <div className="text-sm text-muted">Diffs Created</div>
          </div>
          <div className="bg-surface2 p-4 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{profile.votes_count}</div>
            <div className="text-sm text-muted">Votes Cast</div>
          </div>
          <div className="bg-surface2 p-4 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{profile.comments_count}</div>
            <div className="text-sm text-muted">Comments</div>
          </div>
          <div className="bg-surface2 p-4 rounded-lg">
            <div className="text-2xl font-bold text-link">{profile.reputation_score}</div>
            <div className="text-sm text-muted">Reputation</div>
          </div>
        </div>

        {/* Additional Stats */}
        {profile.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {profile.stats.accuracy_rate !== undefined && (
              <div className="bg-surface2 p-4 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {profile.stats.accuracy_rate}%
                </div>
                <div className="text-sm text-muted">Accuracy Rate</div>
              </div>
            )}
            {profile.stats.helpful_comments_count !== undefined && (
              <div className="bg-surface2 p-4 rounded-lg">
                <div className="text-xl font-bold text-foreground">
                  {profile.stats.helpful_comments_count}
                </div>
                <div className="text-sm text-muted">Helpful Comments</div>
              </div>
            )}
            {profile.stats.sources_added_count !== undefined && (
              <div className="bg-surface2 p-4 rounded-lg">
                <div className="text-xl font-bold text-foreground">
                  {profile.stats.sources_added_count}
                </div>
                <div className="text-sm text-muted">Sources Added</div>
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
      <div className="bg-surface border border-border rounded-lg">
        <div className="border-b border-border">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab('diffs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'diffs'
                  ? 'bg-surface2 text-foreground'
                  : 'text-muted hover:text-foreground hover:bg-surface2/50'
              }`}
            >
              Diffs ({profile.diffs_count})
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('votes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'votes'
                    ? 'bg-surface2 text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-surface2/50'
                }`}
              >
                Voting History ({profile.votes_count})
              </button>
            )}
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'comments'
                  ? 'bg-surface2 text-foreground'
                  : 'text-muted hover:text-foreground hover:bg-surface2/50'
              }`}
            >
              Comments ({profile.comments_count})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
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
