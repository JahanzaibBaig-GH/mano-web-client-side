import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  variant: {
    default: 'bg-teal-600 text-white hover:bg-teal-700',
    outline: 'border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
  },
  size: {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-lg px-8',
    icon: 'h-9 w-9',
  },
};

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50',
          buttonVariants.variant[variant] ?? buttonVariants.variant.default,
          buttonVariants.size[size] ?? buttonVariants.size.default,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
