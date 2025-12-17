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
  summary: string;
  year?: number;
  language?: string;
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
  poster_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DiffItem {
  id: number;
  work: number;
  screen_work: number;
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
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  results: T[];
  count: number;
  next: string | null;
}
