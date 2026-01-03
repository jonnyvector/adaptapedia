interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export default function LoadingSkeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  variant = 'rectangular'
}: LoadingSkeletonProps): JSX.Element {
  const baseClasses = 'bg-black/10 dark:bg-white/10 animate-pulse';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  );
}
