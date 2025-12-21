import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading(): JSX.Element {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <LoadingSkeleton width="w-16" height="h-5" className="mb-2" />
            <LoadingSkeleton width="w-64" height="h-9" className="mb-2" />
            <LoadingSkeleton width="w-24" height="h-6" />
          </div>

          <div className="text-4xl text-muted mx-6 self-center">→</div>

          <div className="flex-1 text-right">
            <LoadingSkeleton width="w-20" height="h-5" className="mb-2 ml-auto" />
            <LoadingSkeleton width="w-64" height="h-9" className="mb-2 ml-auto" />
            <LoadingSkeleton width="w-24" height="h-6" className="ml-auto" />
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="border-t border-b border-border py-4">
          <div className="flex items-center justify-between gap-4">
            <LoadingSkeleton width="w-64" height="h-10" />
            <LoadingSkeleton width="w-40" height="h-10" />
          </div>
        </div>
      </div>

      {/* Diffs Skeleton */}
      <div className="space-y-8">
        <div>
          <LoadingSkeleton width="w-48" height="h-7" className="mb-4" />
          <div className="space-y-4">
            <SkeletonCard variant="detailed" />
            <SkeletonCard variant="detailed" />
          </div>
        </div>

        <div>
          <LoadingSkeleton width="w-40" height="h-7" className="mb-4" />
          <div className="space-y-4">
            <SkeletonCard variant="detailed" />
          </div>
        </div>
      </div>
    </div>
  );
}
