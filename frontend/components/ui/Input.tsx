import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

const inputVariants = cva(
  `w-full ${TEXT.body} border bg-white dark:bg-black text-black dark:text-white ${RADIUS.control} focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`,
  {
    variants: {
      variant: {
        default: `${BORDERS.medium} focus:border-black focus:dark:border-white`,
        error: `border-red-600 dark:border-red-400 focus:border-red-600 focus:dark:border-red-400`,
        success: `border-green-600 dark:border-green-400 focus:border-green-600 focus:dark:border-green-400`,
      },
      inputSize: {
        sm: 'px-2 py-2 text-sm min-h-[40px]',
        md: 'px-3 py-3 min-h-[44px]',
        lg: 'px-4 py-4 min-h-[52px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const inputVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`block ${TEXT.secondary} font-bold mb-2 text-black dark:text-white ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          {...props}
        />
        {error && (
          <p
            className={`mt-1 ${TEXT.metadata} text-red-600 dark:text-red-400`}
            style={{ fontFamily: FONTS.mono }}
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            className={`mt-1 ${TEXT.metadata} ${TEXT.mutedMedium}`}
            style={{ fontFamily: FONTS.mono }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
