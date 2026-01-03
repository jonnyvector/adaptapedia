import type { BadgeType } from '@/lib/types';
import { FONTS, LETTER_SPACING, monoUppercase } from '@/lib/brutalist-design';

interface UserBadgeProps {
  badgeType: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const getBadgeIcon = (badgeType: BadgeType): string => {
  const iconMap: Partial<Record<BadgeType, string>> = {
    // Milestone badges
    FIRST_VOTE: '🗳️',
    FIRST_COMMENT: '💬',
    FIRST_DIFF: '✍️',
    VOTER_10: '🎯',
    VOTER_50: '🏆',
    VOTER_100: '👑',
    COMMENTER_10: '💭',
    COMMENTER_50: '🗨️',
    CONTRIBUTOR_10: '📝',
    CONTRIBUTOR_50: '📚',
    CONTRIBUTOR_100: '🏅',
    // Quality badges
    WELL_SOURCED: '📖',
    HIGH_ACCURACY: '✓',
    CONSENSUS_BUILDER: '🤝',
    // Special badges
    EARLY_ADOPTER: '🌟',
    WEEKLY_STREAK_7: '🔥',
  };
  return iconMap[badgeType] || '🏆';
};

const getBadgeLabel = (badgeType: BadgeType): string => {
  return badgeType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const getBadgeSize = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-sm';
    case 'lg':
      return 'text-base';
    default:
      return 'text-sm';
  }
};

export default function UserBadge({ badgeType, size = 'sm', showLabel = false }: UserBadgeProps) {
  const icon = getBadgeIcon(badgeType);
  const label = getBadgeLabel(badgeType);
  const sizeClass = getBadgeSize(size);

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClass}`}
      title={label}
      aria-label={label}
    >
      <span>{icon}</span>
      {showLabel && <span className={`font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>{label}</span>}
    </span>
  );
}
