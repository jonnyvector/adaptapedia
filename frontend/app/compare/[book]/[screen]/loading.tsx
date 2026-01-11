import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading(): JSX.Element {
  return (
    <div>
      {/* Desktop Header Skeleton */}
      <div className="hidden md:block bg-white dark:bg-black py-6 lg:py-10">
        {/* Title centered */}
        <div className="text-center space-y-1.5 mb-6">
          <LoadingSkeleton width="w-64" height="h-8" className="mx-auto" />
          <LoadingSkeleton width="w-16" height="h-4" className="mx-auto" />
        </div>

        {/* 3-column grid */}
        <div className="grid gap-4 lg:gap-6 px-4" style={{ gridTemplateColumns: '200px minmax(300px, 1fr) 200px', alignItems: 'start' }}>
          {/* Left cover */}
          <div className="flex flex-col items-center gap-3">
            <LoadingSkeleton width="w-full" height="h-72" className="aspect-[2/3]" />
            <LoadingSkeleton width="w-32" height="h-4" />
            <LoadingSkeleton width="w-20" height="h-4" />
          </div>

          {/* Center scoreboard */}
          <div>
            <LoadingSkeleton width="w-full" height="h-64" />
          </div>

          {/* Right cover */}
          <div className="flex flex-col items-center gap-3">
            <LoadingSkeleton width="w-full" height="h-72" className="aspect-[2/3]" />
            <LoadingSkeleton width="w-32" height="h-4" />
            <LoadingSkeleton width="w-20" height="h-4" />
          </div>
        </div>
      </div>

      {/* Mobile Header Skeleton */}
      <div className="md:hidden bg-white dark:bg-black py-4 px-4">
        {/* Title */}
        <div className="text-center space-y-2 mb-4">
          <LoadingSkeleton width="w-48" height="h-6" className="mx-auto" />
          <LoadingSkeleton width="w-16" height="h-4" className="mx-auto" />
        </div>

        {/* Two-up covers */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-2">
            <LoadingSkeleton width="w-full" height="h-48" className="aspect-[2/3]" />
            <LoadingSkeleton width="w-full" height="h-4" />
          </div>
          <div className="space-y-2">
            <LoadingSkeleton width="w-full" height="h-48" className="aspect-[2/3]" />
            <LoadingSkeleton width="w-full" height="h-4" />
          </div>
        </div>

        {/* Voting module */}
        <LoadingSkeleton width="w-full" height="h-40" />
      </div>

      {/* Diffs Skeleton */}
      <div className="container py-8">
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
    </div>
  );
}
