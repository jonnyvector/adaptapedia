import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';

const textareaVariants = cva(
  `w-full ${TEXT.body} border bg-white dark:bg-black text-black dark:text-white ${RADIUS.control} focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-vertical`,
  {
    variants: {
      variant: {
        default: `${BORDERS.medium} focus:border-black focus:dark:border-white`,
        error: `border-red-600 dark:border-red-400 focus:border-red-600 focus:dark:border-red-400`,
        success: `border-green-600 dark:border-green-400 focus:border-green-600 focus:dark:border-green-400`,
      },
      textareaSize: {
        sm: 'px-2 py-2 text-sm min-h-[80px]',
        md: 'px-3 py-3 min-h-[120px]',
        lg: 'px-4 py-4 min-h-[160px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'md',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, textareaSize, label, error, helperText, showCharCount, maxLength, id, value, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const textareaVariant = error ? 'error' : variant;
    const currentLength = value?.toString().length || 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={`block ${TEXT.secondary} font-bold mb-2 text-black dark:text-white ${monoUppercase}`}
            style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.wide }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          className={cn(textareaVariants({ variant: textareaVariant, textareaSize }), className)}
          style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.normal }}
          {...props}
        />
        <div className="flex justify-between items-start mt-1 gap-2">
          <div className="flex-1">
            {error && (
              <p
                className={`${TEXT.metadata} text-red-600 dark:text-red-400`}
                style={{ fontFamily: FONTS.mono }}
              >
                {error}
              </p>
            )}
            {helperText && !error && (
              <p
                className={`${TEXT.metadata} ${TEXT.mutedMedium}`}
                style={{ fontFamily: FONTS.mono }}
              >
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p
              className={`${TEXT.metadata} ${TEXT.mutedMedium} flex-shrink-0`}
              style={{ fontFamily: FONTS.mono }}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
