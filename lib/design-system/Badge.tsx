'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

// Sustainable Badge variants
const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-blue-100 text-blue-800",
        secondary: "bg-gray-100 text-gray-600",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        danger: "bg-red-100 text-red-800",
        outline: "border border-gray-300 text-gray-700"
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded-full",
        md: "px-2.5 py-1 text-sm rounded-full",
        lg: "px-3 py-1.5 text-base rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export function Badge({ 
  className, 
  variant, 
  size, 
  children,
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, size }), className)} 
      {...props}
    >
      {children}
    </div>
  );
}