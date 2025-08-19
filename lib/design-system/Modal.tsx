'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import { designTokens } from './tokens';

// Sustainable Modal variants
const modalVariants = cva(
  "relative w-full bg-white transform transition-all max-h-[90vh] overflow-y-auto",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md", 
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl"
      },
      radius: {
        md: "rounded-xl",
        lg: "rounded-2xl", 
        xl: "rounded-3xl"
      }
    },
    defaultVariants: {
      size: "md",
      radius: "lg"
    }
  }
);

interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  size,
  radius,
  closeOnBackdrop = true,
  className
}: ModalProps) {
  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 overflow-y-auto"
      style={{ 
        zIndex: designTokens.zIndex.modal,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: designTokens.spacing.md
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal */}
      <div 
        className={cn(modalVariants({ size, radius }), className)}
        style={{
          position: 'relative',
          zIndex: 1,
          boxShadow: designTokens.boxShadow['2xl']
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Sustainable Modal subcomponents
interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export function ModalHeader({ 
  children, 
  onClose,
  showCloseButton = true,
  className
}: ModalHeaderProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between border-b border-gray-200", 
        className
      )}
      style={{ padding: designTokens.spacing.lg }}
    >
      <div className="flex-1">
        {children}
      </div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div 
      className={cn("", className)}
      style={{ padding: designTokens.spacing.lg }}
    >
      {children}
    </div>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div 
      className={cn(
        "border-t border-gray-200 bg-gray-50", 
        className
      )}
      style={{ padding: designTokens.spacing.lg }}
    >
      {children}
    </div>
  );
}