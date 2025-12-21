import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading(): JSX.Element {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="mb-6">
            <LoadingSkeleton width="w-2/3" height="h-10" className="mb-2" />
            <LoadingSkeleton width="w-32" height="h-6" />
          </div>
          <LoadingSkeleton width="w-full" height="h-24" />
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Source Books Skeleton */}
            <div>
              <LoadingSkeleton width="w-64" height="h-8" className="mb-4" />
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-5">
              <LoadingSkeleton width="w-32" height="h-6" className="mb-4" />
              <div className="space-y-3">
                <LoadingSkeleton width="w-full" height="h-4" />
                <LoadingSkeleton width="w-full" height="h-4" />
                <LoadingSkeleton width="w-full" height="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
