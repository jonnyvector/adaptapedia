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
  created_at: string;
  updated_at: string;
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
  category: DiffCategory;
  claim: string;
  detail: string;
  spoiler_scope: SpoilerScope;
  status: string;
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
  body: string;
  spoiler_scope: SpoilerScope;
  status: string;
  created_at: string;
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
  results: WorkWithAdaptations[] | ScreenWork[];
}
