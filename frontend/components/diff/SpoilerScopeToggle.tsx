import type { SpoilerScope } from '@/lib/types';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, monoUppercase } from '@/lib/brutalist-design';

interface SpoilerScopeToggleProps {
  currentScope: SpoilerScope;
  onScopeChange: (scope: SpoilerScope) => void;
}

const scopes: { value: SpoilerScope; label: string; description: string }[] = [
  {
    value: 'NONE',
    label: 'Safe',
    description: 'No spoilers - high-level changes only',
  },
  {
    value: 'BOOK_ONLY',
    label: 'Book Spoilers',
    description: 'Show book plot details',
  },
  {
    value: 'SCREEN_ONLY',
    label: 'Screen Spoilers',
    description: 'Show movie/TV plot details',
  },
  {
    value: 'FULL',
    label: 'Full Spoilers',
    description: 'Show everything including endings',
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
        {scopes.map((scope) => (
          <button
            key={scope.value}
            onClick={() => onScopeChange(scope.value)}
            className={`px-3 sm:px-4 py-2 rounded-md ${TEXT.metadata} font-bold transition-colors min-h-[44px] flex items-center ${monoUppercase} ${
              currentScope === scope.value
                ? `bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid}`
                : `bg-white dark:bg-black text-black dark:text-white border ${BORDERS.medium} hover:border-black hover:dark:border-white`
            }`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
            title={scope.description}
            aria-pressed={currentScope === scope.value}
          >
            {scope.label}
          </button>
        ))}
      </div>
      <p className={`${TEXT.metadata} ${TEXT.mutedMedium} mt-2 hidden sm:block`} style={{ fontFamily: FONTS.sans }}>
        {scopes.find((s) => s.value === currentScope)?.description}
      </p>
    </div>
  );
}
