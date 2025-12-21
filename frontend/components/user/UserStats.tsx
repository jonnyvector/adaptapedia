import type { UserProfile } from '@/lib/types';

interface UserStatsProps {
  profile: UserProfile;
}

export default function UserStats({ profile }: UserStatsProps): JSX.Element {
  const stats = [
    {
      label: 'Diffs Created',
      value: profile.diffs_count,
      color: 'text-blue-600',
    },
    {
      label: 'Votes Cast',
      value: profile.votes_count,
      color: 'text-green-600',
    },
    {
      label: 'Comments Posted',
      value: profile.comments_count,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Reputation Score - Prominent */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-lg p-4 sm:p-6 text-center">
        <div className="text-3xl sm:text-4xl font-bold text-amber-700 mb-1">
          {profile.reputation_score}
        </div>
        <div className="text-sm font-medium text-amber-800">Reputation</div>
        <div className="text-xs text-amber-600 mt-1">
          Based on community votes
        </div>
      </div>

      {/* Activity Stats */}
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-border rounded-lg p-4 sm:p-6 text-center hover:shadow-md transition-shadow"
        >
          <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-xs sm:text-sm text-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
