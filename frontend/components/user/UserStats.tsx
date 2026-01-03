import type { UserProfile } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface UserStatsProps {
  profile: UserProfile;
}

export default function UserStats({ profile }: UserStatsProps): JSX.Element {
  const stats = [
    {
      label: 'Diffs Created',
      value: profile.diffs_count,
    },
    {
      label: 'Votes Cast',
      value: profile.votes_count,
    },
    {
      label: 'Comments Posted',
      value: profile.comments_count,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Reputation Score - Prominent */}
      <div className={`bg-black dark:bg-white border ${BORDERS.solid} p-4 sm:p-6 text-center`}>
        <div className="text-3xl sm:text-4xl font-bold text-white dark:text-black mb-1" style={{ fontFamily: FONTS.mono }}>
          {profile.reputation_score}
        </div>
        <div className={`${TEXT.secondary} font-bold text-white dark:text-black ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Reputation</div>
        <div className={`${TEXT.metadata} text-white/80 dark:text-black/80 mt-1`} style={{ fontFamily: FONTS.mono }}>
          Based on community votes
        </div>
      </div>

      {/* Activity Stats */}
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} p-4 sm:p-6 text-center hover:border-black hover:dark:border-white transition-colors`}
        >
          <div className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-1" style={{ fontFamily: FONTS.mono }}>
            {stat.value}
          </div>
          <div className={`${TEXT.metadata} ${TEXT.mutedMedium} font-bold ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
