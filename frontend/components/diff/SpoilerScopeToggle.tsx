import type { SpoilerScope } from '@/lib/types';

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
      <h3 className="text-sm font-semibold mb-2 sm:mb-3">Spoiler Level</h3>
      <div className="flex flex-wrap gap-2">
        {scopes.map((scope) => (
          <button
            key={scope.value}
            onClick={() => onScopeChange(scope.value)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] flex items-center ${
              currentScope === scope.value
                ? 'bg-link text-white'
                : 'bg-muted/10 text-foreground hover:bg-muted/20'
            }`}
            title={scope.description}
            aria-pressed={currentScope === scope.value}
          >
            {scope.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted mt-2 hidden sm:block">
        {scopes.find((s) => s.value === currentScope)?.description}
      </p>
    </div>
  );
}
