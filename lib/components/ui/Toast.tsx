'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

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
    }, 300); // Match the transition duration
  };

  const config = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-800',
      messageColor: 'text-amber-700'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  return (
    <div 
      className={`
        relative flex items-start p-4 border rounded-lg shadow-lg transition-all duration-300 ease-in-out transform
        ${currentConfig.bgColor} ${currentConfig.borderColor}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex-shrink-0">
        <IconComponent className={`h-5 w-5 ${currentConfig.iconColor}`} />
      </div>
      
      <div className="ml-3 flex-1">
        {title && (
          <h4 className={`text-sm font-medium ${currentConfig.titleColor}`}>
            {title}
          </h4>
        )}
        <p className={`text-sm ${title ? 'mt-1' : ''} ${currentConfig.messageColor}`}>
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className={`ml-3 flex-shrink-0 p-1 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors ${currentConfig.iconColor}`}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast Container Component
export function ToastContainer({ 
  toasts, 
  onCloseToast 
}: { 
  toasts: ToastProps[];
  onCloseToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
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