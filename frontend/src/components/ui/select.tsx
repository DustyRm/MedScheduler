import * as React from 'react';
import { cn } from './cn';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return <select ref={ref} className={cn('input', className)} {...props} />;
});

Select.displayName = 'Select';
