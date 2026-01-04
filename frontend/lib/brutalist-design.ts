/**
 * Brutalist/Archival Design System
 * Shared design tokens for consistent styling across comparison page components
 */

// Typography
export const FONTS = {
  mono: 'JetBrains Mono, monospace',
  sans: 'Space Grotesk, sans-serif',
} as const;

export const LETTER_SPACING = {
  tight: '0.05em',
  normal: '0.08em',
  wide: '0.1em',
  wider: '0.12em',
  widest: '0.15em',
} as const;

// Colors - Ink vs Ember palette
export const COLORS = {
  book: '#6F8FA8', // Dusty steel blue (ink)
  screen: '#C98A3A', // Burnt amber (ember)
} as const;

// Border Radius
export const RADIUS = {
  none: '', // 0 radius for structural elements (cards, containers)
  control: 'rounded-lg', // 8px for interactive controls (buttons, inputs)
} as const;

// Border Styles
export const BORDERS = {
  subtle: 'border-black/20 dark:border-white/20',
  medium: 'border-black/30 dark:border-white/30',
  solid: 'border-black dark:border-white',
  strongSubtle: 'border-black/40 dark:border-white/40',
} as const;

// Text Styles
export const TEXT = {
  metadata: 'text-[9px]',
  label: 'text-[10px]',
  secondary: 'text-xs',
  body: 'text-sm',
  mutedLight: 'text-black/50 dark:text-white/50',
  mutedMedium: 'text-black/60 dark:text-white/60',
  mutedStrong: 'text-black/70 dark:text-white/70',
  primary: 'text-black dark:text-white',
} as const;

// Common Style Objects
export const BRUTALIST_STYLES = {
  // Monospace label with wide tracking (for metadata, tags, labels)
  monoLabel: {
    fontFamily: FONTS.mono,
    letterSpacing: LETTER_SPACING.wider,
  },

  // Monospace body with medium tracking (for buttons, controls)
  monoBody: {
    fontFamily: FONTS.mono,
    letterSpacing: LETTER_SPACING.normal,
  },

  // Button: Primary CTA
  buttonPrimary: `border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black font-bold transition-all ${TEXT.secondary} ${RADIUS.control}`,

  // Button: Secondary/Utility
  buttonSecondary: `border ${BORDERS.subtle} bg-transparent hover:border-black hover:dark:border-white font-bold transition-all ${TEXT.label} ${RADIUS.control}`,

  // Button: Tertiary (most subtle)
  buttonTertiary: `border ${BORDERS.subtle} bg-transparent hover:${BORDERS.medium} transition-all ${TEXT.metadata} ${RADIUS.control}`,

  // Card: Archive/Index card style
  card: `border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950 p-5`,

  // Input: Text field
  input: `border ${BORDERS.medium} bg-white dark:bg-black ${TEXT.body} focus:border-black focus:dark:border-white ${RADIUS.control}`,

  // Dropdown: Floating menus (search, notifications, etc)
  dropdown: `border ${BORDERS.medium} bg-white dark:bg-black ${RADIUS.control}`,

  // Dropdown Divider: Internal separators
  dropdownDivider: `border-t ${BORDERS.subtle}`,
} as const;

// Helper Functions
export const getAccentColor = (side: 'book' | 'screen' | 'tie'): string => {
  if (side === 'book') return COLORS.book;
  if (side === 'screen') return COLORS.screen;
  return '';
};

export const monoUppercase = 'uppercase tracking-widest';
