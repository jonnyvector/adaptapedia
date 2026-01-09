import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { BORDERS, RADIUS, SPACING } from '@/lib/brutalist-design';

const cardVariants = cva(
  `border ${BORDERS.medium} transition-all`,
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-black',
        subtle: 'bg-stone-50 dark:bg-stone-950',
        bordered: `bg-white dark:bg-black border-2`,
      },
      padding: {
        none: 'p-0',
        sm: 'p-3 sm:p-4',
        md: SPACING.cardPadding,
        lg: 'p-6 sm:p-8',
      },
      interactive: {
        true: 'hover:border-black hover:dark:border-white cursor-pointer hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white',
        false: '',
      },
      rounded: {
        true: RADIUS.control,
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
      rounded: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, rounded, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive, rounded }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };
