import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { FONTS, LETTER_SPACING, BORDERS, TEXT, RADIUS, monoUppercase } from '@/lib/brutalist-design';
import LoadingSpinner from './LoadingSpinner';

const buttonVariants = cva(
  // Base styles - applied to all buttons
  `inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white ${RADIUS.control}`,
  {
    variants: {
      variant: {
        primary: `bg-black dark:bg-white text-white dark:text-black border ${BORDERS.solid} hover:bg-black/90 hover:dark:bg-white/90`,
        secondary: `bg-white dark:bg-black border ${BORDERS.medium} text-black dark:text-white hover:border-black hover:dark:border-white`,
        ghost: `border-none ${TEXT.mutedStrong} hover:text-black hover:dark:text-white`,
        danger: `bg-red-600 text-white border ${BORDERS.solid} border-red-700 hover:bg-red-700`,
        success: `bg-green-600 text-white border ${BORDERS.solid} border-green-700 hover:bg-green-700`,
      },
      size: {
        sm: `px-2 py-1 ${TEXT.metadata} min-h-[36px]`,
        md: `px-3 py-2 ${TEXT.secondary} min-h-[44px]`,
        lg: `px-4 py-3 ${TEXT.secondary} min-h-[48px]`,
      },
      mono: {
        true: monoUppercase,
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      mono: true,
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, mono, fullWidth, loading, children, disabled, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, mono, fullWidth }), className)}
        style={{ fontFamily: FONTS.mono, letterSpacing: LETTER_SPACING.tight }}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
