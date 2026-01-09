import LoadingSpinner from './LoadingSpinner';
import { FONTS, TEXT } from '@/lib/brutalist-design';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Loading...', size = 'lg' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <LoadingSpinner size={size} />
      <p
        className={`${TEXT.secondary} ${TEXT.mutedMedium}`}
        style={{ fontFamily: FONTS.mono }}
      >
        {message}
      </p>
    </div>
  );
}
