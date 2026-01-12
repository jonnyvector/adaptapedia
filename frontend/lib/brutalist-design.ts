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
  book: '#4A7C9E', // Medium slate blue (soft vintage)
  screen: '#C17A4F', // Terracotta/clay (warm vintage)
} as const;

// Border Radius
export const RADIUS = {
  none: '', // 0 radius for structural elements (cards, containers)
  control: '[border-radius:var(--button-radius)]', // Uses CSS variable for centralized control
  input: '[border-radius:var(--input-radius)]', // Uses CSS variable for input elements
} as const;

// Border Styles
export const BORDERS = {
  subtle: 'border-black/20 dark:border-white/20',
  medium: 'border-black/30 dark:border-white/30',
  solid: 'border-black dark:border-white',
  strongSubtle: 'border-black/40 dark:border-white/40',
} as const;

// Text Styles - Mobile-first with responsive variants
export const TEXT = {
  // Sizes - mobile first, then desktop
  micro: 'text-[8px] sm:text-[9px]', // For vote strips, tiny badges, micro-labels
  metadata: 'text-[9px] sm:text-[10px]',
  label: 'text-[11px] sm:text-xs',
  secondary: 'text-xs sm:text-sm',
  body: 'text-sm sm:text-base',
  heading: 'text-base sm:text-lg',
  title: 'text-lg sm:text-xl',

  // Colors
  mutedLight: 'text-black/50 dark:text-white/50',
  mutedMedium: 'text-black/60 dark:text-white/60',
  mutedStrong: 'text-black/70 dark:text-white/70',
  primary: 'text-black dark:text-white',
} as const;

// Spacing - Mobile-first responsive utilities
export const SPACING = {
  // Container padding
  containerPx: 'px-4 sm:px-6 lg:px-8',
  containerPy: 'py-8 sm:py-12 md:py-16',

  // Section spacing
  sectionGap: 'space-y-8 sm:space-y-12 md:space-y-16',

  // Card padding
  cardPadding: 'p-4 sm:p-5 md:p-6',
  cardPaddingCompact: 'p-3 sm:p-4',

  // Button padding - ensures 44px touch targets on mobile
  buttonPadding: 'px-3 py-2 sm:px-4 sm:py-2.5',
  buttonPaddingCompact: 'px-2.5 py-1.5 sm:px-3 sm:py-2',
  buttonPaddingSmall: 'px-2 py-1 sm:px-2.5 sm:py-1.5',

  // Gaps
  gapSmall: 'gap-2 sm:gap-3',
  gapMedium: 'gap-3 sm:gap-4',
  gapLarge: 'gap-4 sm:gap-6',
} as const;

// Height tokens for common UI elements
export const HEIGHT = {
  // Touch target minimums (WCAG AA compliance - 44x44px)
  touchTarget: 'min-h-[44px]',
  touchTargetLg: 'min-h-[48px]',

  // Component heights
  input: 'h-[44px]',
  inputSm: 'h-[36px]',
  inputLg: 'h-[48px]',

  // Dividers
  dividerThin: 'h-[1px]',
  dividerMedium: 'h-[2px]',
  dividerThick: 'h-[4px]',
} as const;

// Width tokens for common UI patterns
export const WIDTH = {
  // Cover/poster aspect ratios
  coverSm: 'w-[120px]',
  coverMd: 'w-[180px]',
  coverLg: 'w-[240px]',

  // Component widths
  scoreboardSm: 'w-[180px]',
  scoreboardMd: 'w-[200px]',
  scoreboardLg: 'w-[240px]',

  // Icon sizes
  iconSm: 'w-4 h-4',
  iconMd: 'w-5 h-5',
  iconLg: 'w-6 h-6',
  iconXl: 'w-8 h-8',
} as const;

// Common Style Objects - Mobile-optimized
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

  // Button: Primary CTA - 44px min touch target
  buttonPrimary: `${SPACING.buttonPadding} border ${BORDERS.solid} bg-transparent hover:bg-black hover:dark:bg-white hover:text-white hover:dark:text-black font-bold transition-all ${TEXT.secondary} ${RADIUS.control}`,

  // Button: Secondary/Utility
  buttonSecondary: `${SPACING.buttonPaddingCompact} border ${BORDERS.subtle} bg-transparent hover:border-black hover:dark:border-white font-bold transition-all ${TEXT.label} ${RADIUS.control}`,

  // Button: Tertiary (most subtle)
  buttonTertiary: `${SPACING.buttonPaddingSmall} border ${BORDERS.subtle} bg-transparent hover:${BORDERS.medium} transition-all ${TEXT.metadata} ${RADIUS.control}`,

  // Card: Archive/Index card style
  card: `${SPACING.cardPadding} border ${BORDERS.medium} bg-stone-50 dark:bg-stone-950`,

  // Input: Text field - 44px min touch target
  input: `${SPACING.buttonPadding} border ${BORDERS.medium} bg-white dark:bg-black ${TEXT.body} focus:border-black focus:dark:border-white ${RADIUS.control}`,

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
