import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading(): JSX.Element {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted">Loading...</p>
      </div>
    </main>
  );
}
