import Link from 'next/link';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS} from '@/lib/brutalist-design';

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
    <div className={`border ${BORDERS.medium} p-12 text-center ${className}`}>
      <p className={`${TEXT.mutedMedium} mb-4`} style={{ fontFamily: FONTS.mono }}>{message}</p>
      {action && (
        <Link href={action.href} className="text-black dark:text-white hover:opacity-70 transition-opacity font-bold" style={{ fontFamily: FONTS.mono }}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
