'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Book page error:', error);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="text-lg text-muted">
            We couldn&apos;t load this book&apos;s details.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-red-900 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-700 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-link text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted/10 transition-colors font-semibold"
          >
            Go home
          </Link>
        </div>

        <p className="text-sm text-muted">
          If this problem persists, please let us know.
        </p>
      </div>
    </main>
  );
}
