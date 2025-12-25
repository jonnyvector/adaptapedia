import type { User } from '@/lib/types';

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
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Reputation Progress</h2>
        <div className="text-2xl font-bold text-link">{reputation_points}</div>
      </div>

      {permissions.next_unlock && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">Next Unlock:</span>
            <span className="text-sm text-link font-semibold">
              {permissions.next_unlock.permission}
            </span>
          </div>
          <div className="text-xs text-muted">
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
                  <span className={`text-sm font-medium ${isUnlocked ? 'text-green-600 dark:text-green-400' : 'text-muted'}`}>
                    {isUnlocked ? '✓' : '🔒'} {milestone.label}
                  </span>
                </div>
                <span className="text-xs text-muted">{milestone.level} rep</span>
              </div>
              <div className="relative h-2 bg-surface2 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-green-500 dark:bg-green-400'
                      : 'bg-blue-500 dark:bg-blue-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!permissions.next_unlock && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <div className="text-sm font-medium text-green-800 dark:text-green-200">
            🎉 All permissions unlocked!
          </div>
        </div>
      )}
    </div>
  );
}
