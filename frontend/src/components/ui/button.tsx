import * as React from 'react';
import { cn } from './cn';

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("button", className)} {...props} />;
}
