import type { User } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface ReputationProgressProps {
  user: User;
}

export default function ReputationProgress({ user }: ReputationProgressProps) {
  const { reputation_points, permissions } = user;

  if (!permissions) {
    return null;
  }

  const milestones = [
    { level: 50, label: 'Edit Diffs', unlocked: permissions.can_edit_diffs },
    { level: 100, label: 'Merge Duplicates', unlocked: permissions.can_merge_diffs },
    { level: 500, label: 'Moderate Content', unlocked: permissions.can_moderate },
  ];

  const getProgressPercentage = (level: number): number => {
    if (reputation_points >= level) return 100;
    const prevLevel = level === 50 ? 0 : level === 100 ? 50 : 100;
    return Math.min(100, ((reputation_points - prevLevel) / (level - prevLevel)) * 100);
  };

  return (
    <div className={`bg-stone-50 dark:bg-stone-950 border ${BORDERS.medium} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Reputation Progress</h2>
        <div className="text-2xl font-bold text-black dark:text-white" style={{ fontFamily: FONTS.mono }}>{reputation_points}</div>
      </div>

      {permissions.next_unlock && (
        <div className={`mb-4 p-3 bg-white dark:bg-black border ${BORDERS.medium} border-black/40 dark:border-white/40 rounded-md`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`${TEXT.secondary} font-bold text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}>Next Unlock:</span>
            <span className={`${TEXT.secondary} text-black dark:text-white font-bold`} style={{ fontFamily: FONTS.mono }}>
              {permissions.next_unlock.permission}
            </span>
          </div>
          <div className={`${TEXT.metadata} ${TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
            {permissions.next_unlock.points_needed} more {permissions.next_unlock.points_needed === 1 ? 'point' : 'points'} to reach {permissions.next_unlock.level} reputation
          </div>
        </div>
      )}

      <div className="space-y-4">
        {milestones.map((milestone) => {
          const progress = getProgressPercentage(milestone.level);
          const isUnlocked = milestone.unlocked;

          return (
            <div key={milestone.level} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`${TEXT.secondary} font-bold ${isUnlocked ? 'text-black dark:text-white' : TEXT.mutedMedium}`} style={{ fontFamily: FONTS.mono }}>
                    {isUnlocked ? '✓' : '🔒'} {milestone.label}
                  </span>
                </div>
                <span className={`${TEXT.metadata} ${TEXT.mutedMedium} ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>{milestone.level} rep</span>
              </div>
              <div className="relative h-2 bg-black/10 dark:bg-white/10 overflow-hidden border border-black/20 dark:border-white/20">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-black dark:bg-white'
                      : 'bg-black/40 dark:bg-white/40'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!permissions.next_unlock && (
        <div className={`mt-4 p-3 bg-black dark:bg-white border ${BORDERS.solid} rounded-md text-center`}>
          <div className={`${TEXT.secondary} font-bold text-white dark:text-black ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}>
            🎉 All permissions unlocked!
          </div>
        </div>
      )}
    </div>
  );
}
