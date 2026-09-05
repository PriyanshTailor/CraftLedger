import React from 'react';
import { cn } from '../../lib/utils';

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-royal focus:ring-offset-2',
        {
          'border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80': variant === 'default',
          'border-transparent bg-royal text-white hover:bg-royal/80': variant === 'primary',
          'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200': variant === 'secondary',
          'border-transparent bg-red-100 text-red-800 hover:bg-red-200': variant === 'destructive',
          'border-transparent bg-green-100 text-green-800 hover:bg-green-200': variant === 'success',
          'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200': variant === 'warning',
          'text-slate-950 border-slate-200': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
