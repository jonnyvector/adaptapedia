'use client';

interface DiffSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultsCount?: number;
}

export default function DiffSearch({ value, onChange, resultsCount }: DiffSearchProps): JSX.Element {
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search diffs..."
          className="w-full px-4 pr-10 text-sm bg-surface text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-link placeholder:text-muted h-[40px]"
          aria-label="Search diffs"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1 min-h-[32px] min-w-[32px]"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {value && resultsCount !== undefined && (
        <p className="text-xs text-muted px-1">
          {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
        </p>
      )}
    </div>
  );
}
