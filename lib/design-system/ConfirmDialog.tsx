'use client';

import { QuestionMarkCircleIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';
import { designTokens } from './tokens';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  description?: string;
  variant?: 'default' | 'danger' | 'warning';
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  variant = 'default',
  confirmLabel,
  cancelLabel = 'Cancel',
  loading = false
}: ConfirmDialogProps) {
  // Sustainable configuration using design tokens
  const variantConfig = {
    default: {
      icon: QuestionMarkCircleIcon,
      iconWrapperClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      confirmVariant: 'primary' as const,
      defaultConfirmLabel: 'Confirm'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconWrapperClass: 'bg-amber-50',
      iconClass: 'text-amber-600',
      confirmVariant: 'warning' as const,
      defaultConfirmLabel: 'Continue'
    },
    danger: {
      icon: TrashIcon,
      iconWrapperClass: 'bg-red-50',
      iconClass: 'text-red-600', 
      confirmVariant: 'danger' as const,
      defaultConfirmLabel: 'Delete'
    }
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;
  const finalConfirmLabel = confirmLabel || config.defaultConfirmLabel;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg" 
      closeOnBackdrop={!loading}
    >
      <ModalHeader onClose={onClose} showCloseButton={!loading}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${config.iconWrapperClass}`}>
            <IconComponent className={`h-6 w-6 ${config.iconClass}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title || 'Confirm Action'}
          </h3>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-3">
          <p className="text-gray-700 font-medium">
            {message}
          </p>
          {description && (
            <p className="text-gray-600 text-sm">
              {description}
            </p>
          )}
        </div>
      </ModalBody>

      <ModalFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-6 bg-gray-50">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          fullWidth={true}
          className="sm:w-auto"
        >
          {cancelLabel}
        </Button>
        
        <Button
          variant={config.confirmVariant}
          onClick={onConfirm}
          disabled={loading}
          loading={loading}
          fullWidth={true}
          className="sm:w-auto"
        >
          {finalConfirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}