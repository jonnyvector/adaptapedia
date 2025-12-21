import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading(): JSX.Element {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <LoadingSkeleton width="w-64" height="h-9" className="mb-2" />
        <LoadingSkeleton width="w-96" height="h-5" />
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-4">
          <LoadingSkeleton width="w-32" height="h-10" />
          <LoadingSkeleton width="w-40" height="h-10" />
          <LoadingSkeleton width="w-32" height="h-10" />
        </div>
      </div>

      {/* Filter Skeleton */}
      <div className="mb-6 flex items-center gap-3">
        <LoadingSkeleton width="w-32" height="h-5" />
        <LoadingSkeleton width="w-40" height="h-10" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        <SkeletonCard variant="detailed" />
        <SkeletonCard variant="detailed" />
        <SkeletonCard variant="detailed" />
      </div>
    </div>
  );
}
