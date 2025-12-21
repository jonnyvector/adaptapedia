import type { UserProfile } from '@/lib/types';

interface UserProfileHeaderProps {
  profile: UserProfile;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'MOD':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'TRUSTED_EDITOR':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'MOD':
      return 'Moderator';
    case 'TRUSTED_EDITOR':
      return 'Trusted Editor';
    default:
      return 'User';
  }
}

export default function UserProfileHeader({
  profile,
}: UserProfileHeaderProps): JSX.Element {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Avatar Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
            {profile.username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{profile.username}</h1>
            {profile.role && profile.role !== 'USER' && (
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                  profile.role
                )} inline-block`}
              >
                {getRoleLabel(profile.role)}
              </span>
            )}
          </div>

          <div className="text-sm sm:text-base text-muted mb-4">
            Member since {formatDate(profile.date_joined)}
          </div>
        </div>
      </div>
    </div>
  );
}
