import Link from 'next/link';

interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export default function EmptyState({ message, action, className = '' }: EmptyStateProps): JSX.Element {
  return (
    <div className={`border border-border rounded-lg p-12 text-center ${className}`}>
      <p className="text-muted mb-4">{message}</p>
      {action && (
        <Link href={action.href} className="text-link hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}
