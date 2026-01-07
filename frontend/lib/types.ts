/**
 * Core type definitions for Adaptapedia.
 */

export type SpoilerScope = 'NONE' | 'BOOK_ONLY' | 'SCREEN_ONLY' | 'FULL';

export type DiffCategory =
  | 'PLOT'
  | 'CHARACTER'
  | 'ENDING'
  | 'SETTING'
  | 'THEME'
  | 'TONE'
  | 'TIMELINE'
  | 'WORLDBUILDING'
  | 'OTHER';

export type VoteType = 'ACCURATE' | 'NEEDS_NUANCE' | 'DISAGREE';

export interface Work {
  id: number;
  title: string;
  slug: string;
  author?: string;
  summary: string;
  year?: number;
  language?: string;
  genre?: string;
  wikidata_qid?: string;
  openlibrary_work_id?: string;
  cover_url?: string;
  dominant_color?: string;
  publisher?: string;
  average_rating?: number;
  ratings_count?: number;
  created_at: string;
  updated_at: string;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface CountryWatchProviders {
  link: string;
  flatrate?: WatchProvider[];  // Streaming
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WatchProviders {
  [countryCode: string]: CountryWatchProviders;
}

export interface ScreenWork {
  id: number;
  type: 'MOVIE' | 'TV';
  title: string;
  slug: string;
  summary: string;
  year?: number;
  wikidata_qid?: string;
  tmdb_id?: number;
  tmdb_popularity?: number;
  poster_url?: string;
  backdrop_path?: string;
  dominant_color?: string;
  director?: string;
  runtime?: number;
  studio?: string;
  average_rating?: number;
  ratings_count?: number;
  primary_genre?: string;
  genres?: string[];
  watch_providers?: WatchProviders;
  created_at: string;
  updated_at: string;
}

export interface RankedAdaptation extends ScreenWork {
  engagement_score: number;
  rank_score: number;
  diff_count: number;
  last_diff_updated: string | null;
}

export interface WorkWithAdaptations extends Work {
  adaptations: RankedAdaptation[];
}

export interface DiffItem {
  id: number;
  work: number;
  screen_work: number;
  work_title?: string;
  work_slug?: string;
  screen_work_title?: string;
  screen_work_slug?: string;
  cover_url?: string;
  poster_url?: string;
  category: DiffCategory;
  claim: string;
  detail: string;
  spoiler_scope: SpoilerScope;
  status: string;
  image?: string | null;
  created_by: number;
  created_by_username: string;
  vote_counts: {
    accurate: number;
    needs_nuance: number;
    disagree: number;
  };
  user_vote?: VoteType | null;
  created_at: string;
  updated_at: string;
}

export interface AdaptationEdge {
  id: number;
  work: number;
  screen_work: number;
  work_detail: Work;
  screen_work_detail: ScreenWork;
  relation_type: 'BASED_ON' | 'INSPIRED_BY' | 'LOOSELY_BASED';
  source: 'WIKIDATA' | 'MANUAL';
  confidence: number;
  created_at: string;
}

export interface Comment {
  id: number;
  diff_item: number;
  user: number;
  username: string;
  top_badge?: {
    badge_type: BadgeType;
    badge_display: string;
  } | null;
  body: string;
  spoiler_scope: SpoilerScope;
  status: string;
  created_at: string;
  parent?: number | null;
  diff_item_claim?: string;
  work_title?: string;
  work_slug?: string;
  screen_work_title?: string;
  screen_work_slug?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'TRUSTED_EDITOR' | 'MOD' | 'ADMIN';
  reputation_points: number;
  spoiler_preference: string;
  date_joined: string;
  permissions?: {
    can_edit_diffs: boolean;
    can_merge_diffs: boolean;
    can_moderate: boolean;
    next_unlock?: {
      level: number;
      permission: string;
      points_needed: number;
    } | null;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  date_joined: string;
  role: string;
  diffs_count: number;
  votes_count: number;
  comments_count: number;
  reputation_score: number;
  badges?: UserBadge[];
  stats?: {
    total_votes: number;
    total_comments: number;
    total_diffs: number;
    [key: string]: number;
  };
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface CreateDiffData {
  work: number;
  screen_work: number;
  category: DiffCategory;
  claim: string;
  detail?: string;
  spoiler_scope: SpoilerScope;
}

export type DiffStatus = 'LIVE' | 'HIDDEN' | 'LOCKED' | 'PENDING' | 'REJECTED' | 'FLAGGED';
export type CommentStatus = 'LIVE' | 'HIDDEN' | 'PENDING' | 'DELETED';

export interface ModerationDiff extends DiffItem {
  status: DiffStatus;
}

export interface ModerationComment extends Comment {
  status: CommentStatus;
  diff_item_id: number;
}

export interface ModerationAction {
  reason?: string;
}

export type PreferenceChoice = 'BOOK' | 'SCREEN' | 'TIE' | 'DIDNT_FINISH';

export interface ComparisonVote {
  id: number;
  work: number;
  screen_work: number;
  user: number;
  has_read_book: boolean;
  has_watched_adaptation: boolean;
  preference: PreferenceChoice;
  faithfulness_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface ComparisonVoteStats {
  total_votes: number;
  preference_breakdown: {
    BOOK: number;
    SCREEN: number;
    TIE: number;
    DIDNT_FINISH: number;
  };
  faithfulness: {
    average: number | null;
    count: number;
  };
  user_vote: ComparisonVote | null;
}

export interface CreateComparisonVoteData {
  work: number;
  screen_work: number;
  has_read_book: boolean;
  has_watched_adaptation: boolean;
  preference: PreferenceChoice;
  faithfulness_rating?: number | null;
}

export interface SearchWithAdaptationsResponse {
  search_type: 'book' | 'screen';
  query: string;
  detected_year?: number;
  total_count?: number;
  results: WorkWithAdaptations[] | ScreenWork[];
}

export interface Genre {
  genre: string;
  book_count: number;
  slug: string;
}

export interface ScreenGenre {
  primary_genre: string;
  comparison_count: number;
  diff_count: number;
  last_updated: string | null;
}

export interface BrowseComparison {
  work_id: number;
  work_title: string;
  work_slug: string;
  work_author?: string;
  work_year?: number;
  cover_url?: string;
  screen_work_id: number;
  screen_work_title: string;
  screen_work_slug: string;
  screen_work_type: string;
  screen_work_year?: number;
  poster_url?: string;
  diff_count: number;
  vote_count: number;
  last_updated?: string;
  activity_score?: number;
  recent_diffs?: number;
  recent_votes?: number;
}

export interface BrowseSections {
  featured: BrowseComparison[];
  recently_updated: BrowseComparison[];
  most_documented: BrowseComparison[];
  trending: BrowseComparison[];
  all_comparisons: BrowseComparison[];
}

export interface GenreListResponse {
  results: Genre[];
}

export interface SimilarBook {
  id: number;
  title: string;
  slug: string;
  author?: string;
  year?: number;
  genre?: string;
  cover_url?: string;
  adaptation_count: number;
  similarity_score: number;
}

export interface SimilarBooksResponse {
  results: SimilarBook[];
  count: number;
}

export interface Vote {
  id: number;
  diff_item: number;
  user: number;
  vote: VoteType;
  created_at: string;
  diff_item_claim?: string;
  diff_item_category?: DiffCategory;
  work_title?: string;
  work_slug?: string;
  screen_work_title?: string;
  screen_work_slug?: string;
  created_by_username?: string;
}

export interface TrendingComparison {
  work_id: number;
  work_title: string;
  work_slug: string;
  work_year?: number | null;
  cover_url?: string;
  screen_work_id: number;
  screen_work_title: string;
  screen_work_slug: string;
  screen_work_type: string;
  screen_work_year: number | null;
  poster_url?: string;
  total_diffs: number;
  recent_diffs: number;
  recent_votes: number;
  activity_score: number;
}

export interface Bookmark {
  id: number;
  user: number;
  work: number;
  screen_work: number;
  work_title: string;
  work_slug: string;
  work_author?: string;
  work_cover_url?: string;
  screen_work_title: string;
  screen_work_slug: string;
  screen_work_type: 'MOVIE' | 'TV';
  screen_work_poster_url?: string;
  created_at: string;
}

export interface BookmarkCheckResponse {
  is_bookmarked: boolean;
  bookmark_id: number | null;
}

// Reputation & Badge System

export type BadgeType =
  // Milestone badges
  | 'FIRST_VOTE'
  | 'FIRST_COMMENT'
  | 'FIRST_DIFF'
  | 'VOTER_10'
  | 'VOTER_50'
  | 'VOTER_100'
  | 'COMMENTER_10'
  | 'COMMENTER_50'
  | 'DIFF_CREATOR_5'
  | 'DIFF_CREATOR_25'
  // Quality badges
  | 'WELL_SOURCED'
  | 'HIGH_ACCURACY'
  | 'CONSENSUS_BUILDER'
  | 'EDITOR'
  | 'HELPFUL_COMMENTER'
  // Community badges
  | 'EARLY_ADOPTER'
  | 'GENRE_SPECIALIST_HORROR'
  | 'GENRE_SPECIALIST_SCIFI'
  | 'GENRE_SPECIALIST_FANTASY'
  | 'SERIES_SPECIALIST'
  // Activity badges
  | 'ACTIVE_CONTRIBUTOR'
  | 'WEEKLY_CONTRIBUTOR';

export interface UserBadge {
  id: number;
  badge_type: BadgeType;
  badge_display: string;
  earned_at: string;
  metadata: Record<string, any>;
}

export type ReputationEventType =
  | 'DIFF_CREATED'
  | 'DIFF_ACCURATE'
  | 'DIFF_CONSENSUS_HIGH'
  | 'DIFF_CONSENSUS_MODERATE'
  | 'DIFF_REJECTED'
  | 'DIFF_SOURCE_ADDED'
  | 'COMMENT_CREATED'
  | 'COMMENT_HELPFUL'
  | 'VOTE_CAST'
  | 'CONTRIBUTION_REPORTED'
  | 'CONTRIBUTION_REMOVED';

export interface ReputationEvent {
  id: number;
  event_type: ReputationEventType;
  event_type_display: string;
  amount: number;
  description: string;
  diff_title?: string | null;
  created_at: string;
}

export type NotificationType =
  | 'BADGE_EARNED'
  | 'REPUTATION_MILESTONE'
  | 'DIFF_CONSENSUS'
  | 'COMMENT_REPLY'
  | 'COMMENT_HELPFUL'
  | 'DIFF_VALIDATED';

export interface Notification {
  id: number;
  notification_type: NotificationType;
  notification_type_display: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string;
  metadata: Record<string, any>;
  created_at: string;
  read_at: string | null;
}

export interface UserStats {
  reputation: number;
  total_diffs: number;
  total_votes: number;
  total_comments: number;
  accuracy_rate: number | null;
  diffs_evaluated: number;
  recent_events: ReputationEvent[];
}

export interface EnhancedUserProfile {
  id: number;
  username: string;
  date_joined: string;
  role: string;
  reputation_points: number;
  badges: UserBadge[];
  stats: UserStats;
  recent_reputation_events: ReputationEvent[];
}

export interface VoteResponse {
  id: number;
  diff_item: number;
  user: number;
  vote: VoteType;
  created_at: string;
  consensus?: {
    total_votes: number;
    accurate_percentage: number;
  };
}

export interface NeedsHelpComparison {
  work_id: number;
  work_title: string;
  work_slug: string;
  work_author?: string;
  cover_url?: string;
  screen_work_id: number;
  screen_work_title: string;
  screen_work_slug: string;
  screen_work_type: string;
  screen_work_year?: number;
  poster_url?: string;
  diff_count?: number;
  disputed_diff_count?: number;
  no_comment_diff_count?: number;
  total_votes?: number;
}

export interface NeedsHelpResponse {
  needs_differences: NeedsHelpComparison[];
  most_disputed: NeedsHelpComparison[];
  no_comments: NeedsHelpComparison[];
}
