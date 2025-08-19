'use client';

import { QuestionMarkCircleIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

interface ConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  description?: string;
  type?: 'default' | 'danger' | 'warning';
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  type = 'default',
  confirmLabel,
  cancelLabel = 'Cancel',
  loading = false
}: ConfirmPopupProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  // Style configurations based on type
  const config = {
    default: {
      icon: QuestionMarkCircleIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      defaultConfirmLabel: 'Confirm'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      confirmButton: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      defaultConfirmLabel: 'Continue'
    },
    danger: {
      icon: TrashIcon,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      defaultConfirmLabel: 'Delete'
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;
  const finalConfirmLabel = confirmLabel || currentConfig.defaultConfirmLabel;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnBackdrop={!loading}>
      <ModalHeader onClose={onClose} showCloseButton={!loading}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${currentConfig.iconBg}`}>
            <IconComponent className={`h-6 w-6 ${currentConfig.iconColor}`} />
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

      <ModalFooter>
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={`px-4 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${currentConfig.confirmButton} ${
            loading ? 'cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            finalConfirmLabel
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}