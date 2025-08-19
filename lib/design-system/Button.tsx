import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '../utils';

// Sustainable button variants using CVA
const buttonVariants = cva(
  // Base styles - always applied
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        warning: "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500",
        ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl"
      },
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, children, disabled, ...props }, ref) => {
    // Fallback inline styles to ensure visibility
    const getInlineStyles = () => {
      const baseStyles: React.CSSProperties = {
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px',
        borderRadius: '6px',
        fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        border: 'none',
        transition: 'all 150ms ease',
        width: fullWidth ? '100%' : 'auto'
      };

      switch (variant) {
        case 'danger':
          return { ...baseStyles, backgroundColor: '#dc2626', color: 'white' };
        case 'warning':
          return { ...baseStyles, backgroundColor: '#d97706', color: 'white' };
        case 'secondary':
          return { ...baseStyles, backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' };
        default:
          return { ...baseStyles, backgroundColor: '#2563eb', color: 'white' };
      }
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        style={getInlineStyles()}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";