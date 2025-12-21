import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading(): JSX.Element {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Search header skeleton */}
        <div className="mb-8">
          <LoadingSkeleton width="w-64" height="h-8" className="mb-4" />
          <LoadingSkeleton width="w-96" height="h-12" />
        </div>

        {/* Results skeleton */}
        <div className="space-y-8">
          {/* Books section */}
          <section>
            <LoadingSkeleton width="w-48" height="h-8" className="mb-4" />
            <div className="space-y-3">
              <SkeletonCard variant="compact" />
              <SkeletonCard variant="compact" />
              <SkeletonCard variant="compact" />
            </div>
          </section>

          {/* Screen works section */}
          <section>
            <LoadingSkeleton width="w-56" height="h-8" className="mb-4" />
            <div className="space-y-3">
              <SkeletonCard variant="compact" />
              <SkeletonCard variant="compact" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
