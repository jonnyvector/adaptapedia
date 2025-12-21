import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading(): JSX.Element {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header Skeleton */}
        <div className="mb-8 pb-6 border-b border-border">
          <div className="flex items-start gap-6">
            <LoadingSkeleton width="w-24" height="h-24" variant="circular" />
            <div className="flex-1">
              <LoadingSkeleton width="w-48" height="h-8" className="mb-2" />
              <LoadingSkeleton width="w-32" height="h-5" className="mb-4" />
              <LoadingSkeleton width="w-full" height="h-16" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-border rounded-lg p-4">
            <LoadingSkeleton width="w-16" height="h-8" className="mb-1" />
            <LoadingSkeleton width="w-24" height="h-4" />
          </div>
          <div className="border border-border rounded-lg p-4">
            <LoadingSkeleton width="w-16" height="h-8" className="mb-1" />
            <LoadingSkeleton width="w-24" height="h-4" />
          </div>
          <div className="border border-border rounded-lg p-4">
            <LoadingSkeleton width="w-16" height="h-8" className="mb-1" />
            <LoadingSkeleton width="w-24" height="h-4" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-4">
            <LoadingSkeleton width="w-32" height="h-10" />
            <LoadingSkeleton width="w-32" height="h-10" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <SkeletonCard variant="detailed" />
          <SkeletonCard variant="detailed" />
          <SkeletonCard variant="detailed" />
        </div>
      </div>
    </main>
  );
}
