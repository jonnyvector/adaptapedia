'use client';

import * as React from 'react';
import { Input, type InputProps } from './Input';
import { FONTS, BORDERS, RADIUS } from '@/lib/brutalist-design';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    if (!showToggle) {
      return <Input ref={ref} type="password" className={className} {...props} />;
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={className}
          style={{ paddingRight: '3rem' }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${props.label ? 'mt-4' : ''} text-black/60 dark:text-white/60 hover:text-black hover:dark:text-white transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white ${RADIUS.control} p-1`}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? (
            // Brutalist eye-slash icon (hide)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              {/* Eye shape */}
              <path d="M12 4L23 12L12 20L1 12L12 4Z" />
              {/* Pupil cutout */}
              <path d="M12 9L15 12L12 15L9 12L12 9Z" fill="white" className="dark:fill-black" />
              {/* Diagonal slash */}
              <rect x="10.5" y="0" width="3" height="28" transform="rotate(45 12 12)" />
            </svg>
          ) : (
            // Brutalist eye icon (show)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              {/* Eye shape - angular diamond */}
              <path d="M12 4L23 12L12 20L1 12L12 4Z" />
              {/* Pupil - smaller diamond cutout */}
              <path d="M12 9L15 12L12 15L9 12L12 9Z" fill="white" className="dark:fill-black" />
            </svg>
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
