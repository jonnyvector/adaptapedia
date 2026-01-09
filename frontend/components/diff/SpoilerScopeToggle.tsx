import type { SpoilerScope } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, HEIGHT, monoUppercase } from '@/lib/brutalist-design';
import {
  BrutalistShieldIcon,
  BrutalistBookIconSmall,
  BrutalistScreenIconSmall,
  BrutalistEyeIcon
} from '@/components/ui/Icons';

interface SpoilerScopeToggleProps {
  currentScope: SpoilerScope;
  onScopeChange: (scope: SpoilerScope) => void;
}

const scopes: { value: SpoilerScope; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    value: 'NONE',
    label: 'Safe',
    description: 'No spoilers - high-level changes only',
    icon: BrutalistShieldIcon,
  },
  {
    value: 'BOOK_ONLY',
    label: 'Book Spoilers',
    description: 'Show book plot details',
    icon: BrutalistBookIconSmall,
  },
  {
    value: 'SCREEN_ONLY',
    label: 'Screen Spoilers',
    description: 'Show movie/TV plot details',
    icon: BrutalistScreenIconSmall,
  },
  {
    value: 'FULL',
    label: 'Full Spoilers',
    description: 'Show everything including endings',
    icon: BrutalistEyeIcon,
  },
];

export default function SpoilerScopeToggle({
  currentScope,
  onScopeChange,
}: SpoilerScopeToggleProps): JSX.Element {
  return (
    <div className="flex-1">
      <h3 className={`${TEXT.secondary} font-bold mb-2 sm:mb-3 ${monoUppercase}`} style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}>Spoiler Level</h3>
      <div className="flex flex-wrap gap-2">
        {scopes.map((scope) => {
          const Icon = scope.icon;
          return (
            <button
              key={scope.value}
              onClick={() => onScopeChange(scope.value)}
              className={`px-3 sm:px-4 py-2 ${RADIUS.control} ${TEXT.metadata} font-bold transition-colors ${HEIGHT.touchTarget} flex items-center gap-2 ${monoUppercase} ${
                currentScope === scope.value
                  ? `bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid}`
                  : `bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} hover:border-black hover:dark:border-white`
              }`}
              style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
              title={scope.description}
              aria-pressed={currentScope === scope.value}
            >
              <Icon className="w-4 h-4" />
              {scope.label}
            </button>
          );
        })}
      </div>
      <p className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-2 hidden sm:block`} style={{ fontFamily: FONTS.mono }}>
        {scopes.find((s) => s.value === currentScope)?.description}
      </p>
    </div>
  );
}
