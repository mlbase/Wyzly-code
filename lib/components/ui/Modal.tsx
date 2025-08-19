'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  closeOnBackdrop = true 
}: ModalProps) {
  // Handle escape key
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

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-xl transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Modal Header Component
export function ModalHeader({ 
  children, 
  onClose,
  showCloseButton = true 
}: { 
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex-1">
        {children}
      </div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

// Modal Body Component
export function ModalBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      {children}
    </div>
  );
}

// Modal Footer Component
export function ModalFooter({ 
  children,
  className = "flex justify-end space-x-3"
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}