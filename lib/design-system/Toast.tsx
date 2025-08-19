'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import { designTokens } from './tokens';

// Sustainable toast variants
const toastVariants = cva(
  "relative flex items-start p-4 border rounded-lg shadow-lg transition-all duration-300 ease-in-out transform max-w-sm w-full",
  {
    variants: {
      variant: {
        success: "bg-green-50 border-green-200",
        error: "bg-red-50 border-red-200", 
        warning: "bg-amber-50 border-amber-200",
        info: "bg-blue-50 border-blue-200"
      }
    },
    defaultVariants: {
      variant: "info"
    }
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  id: string;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ 
  id, 
  variant = 'info',
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Toast configuration
  const toastConfig = {
    success: {
      icon: CheckCircleIcon,
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      icon: XCircleIcon,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-800',
      messageColor: 'text-amber-700'
    },
    info: {
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };

  const config = toastConfig[variant || 'info'];
  const IconComponent = config.icon;

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto dismiss
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match transition duration
  };

  return (
    <div 
      className={cn(
        toastVariants({ variant }),
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex-shrink-0">
        <IconComponent className={cn("h-5 w-5", config.iconColor)} />
      </div>
      
      <div className="ml-3 flex-1">
        {title && (
          <h4 className={cn("text-sm font-medium", config.titleColor)}>
            {title}
          </h4>
        )}
        <p className={cn(
          "text-sm", 
          title ? 'mt-1' : '', 
          config.messageColor
        )}>
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className={cn(
          "ml-3 flex-shrink-0 p-1 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors",
          config.iconColor
        )}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// Sustainable Toast Container
interface ToastContainerProps {
  toasts: ToastProps[];
  onCloseToast: (id: string) => void;
}

export function ToastContainer({ toasts, onCloseToast }: ToastContainerProps) {
  return (
    <div 
      className="fixed top-4 right-4 space-y-2 max-w-sm w-full"
      style={{ zIndex: designTokens.zIndex.toast }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onCloseToast}
        />
      ))}
    </div>
  );
}