'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import { designTokens } from './tokens';

// Sustainable Card variants
const cardVariants = cva(
  "bg-white transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "shadow-sm hover:shadow-md",
        elevated: "shadow-md hover:shadow-lg", 
        outlined: "border border-gray-200 hover:border-gray-300"
      },
      radius: {
        md: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl"
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6", 
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      radius: "lg",
      padding: "none"
    }
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ 
  children, 
  variant, 
  radius, 
  padding, 
  className, 
  onClick 
}: CardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={cn(
        cardVariants({ variant, radius, padding }),
        onClick && "cursor-pointer hover:transform hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

// Card subcomponents
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("p-6 pb-4", className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("p-6 pt-4", className)}>
      {children}
    </div>
  );
}