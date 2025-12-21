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
  const baseClasses = 'bg-muted/20 animate-pulse';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  );
}
