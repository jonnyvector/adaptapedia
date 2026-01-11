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
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              className="w-5 h-5"
            >
              {/* Almond eye shape */}
              <path d="M2 12C2 12 5 6 12 6C19 6 22 12 22 12C22 12 19 18 12 18C5 18 2 12 2 12Z" />
              {/* Pupil */}
              <circle cx="12" cy="12" r="3" />
              {/* Diagonal slash */}
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth="1.5" />
            </svg>
          ) : (
            // Brutalist eye icon (show)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
              className="w-5 h-5"
            >
              {/* Almond eye shape */}
              <path d="M2 12C2 12 5 6 12 6C19 6 22 12 22 12C22 12 19 18 12 18C5 18 2 12 2 12Z" />
              {/* Pupil */}
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
