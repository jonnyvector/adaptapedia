/**
 * Utility functions for badge styling
 */

/**
 * Get Tailwind classes for spoiler scope badges
 */
export function getSpoilerBadgeColor(scope: string): string {
  const colors: Record<string, string> = {
    NONE: 'bg-success/10 text-success border border-success/30',
    BOOK_ONLY: 'bg-cyan/10 text-cyan border border-cyan/30',
    SCREEN_ONLY: 'bg-purple/10 text-purple border border-purple/30',
    FULL: 'bg-magenta/10 text-magenta border border-magenta/30',
  };
  return colors[scope] || 'bg-surface border border-border';
}

/**
 * Get human-readable label for spoiler scope
 */
export function getSpoilerLabel(scope: string): string {
  const labels: Record<string, string> = {
    NONE: 'Safe',
    BOOK_ONLY: 'Book Spoilers',
    SCREEN_ONLY: 'Screen Spoilers',
    FULL: 'Full Spoilers',
  };
  return labels[scope] || scope;
}

/**
 * Get Tailwind classes for category badges
 */
export function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    PLOT: 'bg-info/10 text-info border border-info/30',
    CHARACTER: 'bg-purple/10 text-purple border border-purple/30',
    ENDING: 'bg-danger/10 text-danger border border-danger/30',
    SETTING: 'bg-cyan/10 text-cyan border border-cyan/30',
    THEME: 'bg-magenta/10 text-magenta border border-magenta/30',
    TONE: 'bg-warn/10 text-warn border border-warn/30',
    TIMELINE: 'bg-success/10 text-success border border-success/30',
    WORLDBUILDING: 'bg-purple/10 text-purple border border-purple/30',
    OTHER: 'bg-muted/10 text-muted border border-muted/30',
  };
  return colors[category] || 'bg-muted/10 text-muted border border-muted/30';
}

/**
 * Get human-readable label for category
 */
export function getCategoryLabel(category: string): string {
  return category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ');
}
