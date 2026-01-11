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
          className="absolute right-3 text-black/60 hover:text-black transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black p-1"
          style={{
            borderRadius: RADIUS.control,
            top: props.label ? 'calc(50% + 14px)' : '50%',
            transform: 'translateY(-50%)'
          }}
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
              {/* Diamond eye shape */}
              <path d="M1 12L12 6L23 12L12 18Z" />
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
              {/* Diamond eye shape */}
              <path d="M1 12L12 6L23 12L12 18Z" />
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
