import LoadingSkeleton from './LoadingSkeleton';
import { BORDERS, RADIUS } from '@/lib/brutalist-design';

interface SkeletonCardProps {
  variant?: 'default' | 'compact' | 'detailed';
}

export default function SkeletonCard({ variant = 'default' }: SkeletonCardProps): JSX.Element {
  if (variant === 'compact') {
    return (
      <div className={`border ${BORDERS.medium} ${RADIUS.control} p-4`} aria-hidden="true">
        <LoadingSkeleton width="w-3/4" height="h-5" className="mb-2" />
        <LoadingSkeleton width="w-1/2" height="h-4" />
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`border ${BORDERS.medium} ${RADIUS.control} p-5`} aria-hidden="true">
        <div className="flex items-start justify-between mb-3">
          <LoadingSkeleton width="w-2/3" height="h-6" />
          <LoadingSkeleton width="w-16" height="h-6" variant="text" />
        </div>
        <LoadingSkeleton width="w-full" height="h-16" className="mb-4" />
        <div className="flex gap-2 mb-3">
          <LoadingSkeleton width="w-24" height="h-10" />
          <LoadingSkeleton width="w-28" height="h-10" />
          <LoadingSkeleton width="w-24" height="h-10" />
        </div>
        <LoadingSkeleton width="w-full" height="h-2" className="mb-2" />
        <LoadingSkeleton width="w-32" height="h-4" />
      </div>
    );
  }

  // Default variant
  return (
    <div className={`border ${BORDERS.medium} ${RADIUS.control} p-4`} aria-hidden="true">
      <LoadingSkeleton width="w-3/4" height="h-6" className="mb-2" />
      <LoadingSkeleton width="w-1/2" height="h-4" className="mb-4" />
      <LoadingSkeleton width="w-full" height="h-20" className="mb-4" />
      <LoadingSkeleton width="w-40" height="h-10" />
    </div>
  );
}
