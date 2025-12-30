/**
 * Application-wide constants
 */

import type { DiffCategory } from './types';

/**
 * File upload constraints
 */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE_MB = 5;

/**
 * Diff form validation constraints
 */
export const MIN_CLAIM_LENGTH = 10;
export const MAX_CLAIM_LENGTH = 200;
export const MAX_DETAIL_LENGTH = 1000;

/**
 * All available diff categories
 */
export const DIFF_CATEGORIES: DiffCategory[] = [
  'PLOT',
  'CHARACTER',
  'ENDING',
  'SETTING',
  'THEME',
  'TONE',
  'TIMELINE',
  'WORLDBUILDING',
  'OTHER',
];

/**
 * Human-readable labels for diff categories
 */
export const CATEGORY_LABELS: Record<DiffCategory, string> = {
  PLOT: 'Plot',
  CHARACTER: 'Character',
  ENDING: 'Ending',
  SETTING: 'Setting',
  THEME: 'Theme',
  TONE: 'Tone',
  TIMELINE: 'Timeline',
  WORLDBUILDING: 'Worldbuilding',
  OTHER: 'Other',
};
