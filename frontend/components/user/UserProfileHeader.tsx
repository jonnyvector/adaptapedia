import type { UserProfile } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

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
      return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-red-600 dark:border-red-400';
    case 'MOD':
      return 'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-400 border-purple-600 dark:border-purple-400';
    case 'TRUSTED_EDITOR':
      return 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border-blue-600 dark:border-blue-400';
    default:
      return 'bg-stone-100 dark:bg-stone-900 text-black dark:text-white border-black/30 dark:border-white/30';
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
          <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black text-3xl sm:text-4xl font-bold border ${BORDERS.solid}`} style={{ fontFamily: FONTS.mono }}>
            {profile.username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wider }}>{profile.username}</h1>
            {profile.role && profile.role !== 'USER' && (
              <span
                className={`px-3 py-1 ${TEXT.metadata} font-bold rounded-md border ${BORDERS.solid} ${getRoleBadgeColor(
                  profile.role
                )} inline-block ${monoUppercase}`}
                style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
              >
                {getRoleLabel(profile.role)}
              </span>
            )}
          </div>

          <div className={`${TEXT.secondary} ${TEXT.mutedMedium} mb-4`} style={{ fontFamily: FONTS.mono }}>
            Member since {formatDate(profile.date_joined)}
          </div>
        </div>
      </div>
    </div>
  );
}
