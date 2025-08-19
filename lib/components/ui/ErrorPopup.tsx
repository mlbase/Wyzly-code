'use client';

import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
  type?: 'error' | 'warning';
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorPopup({
  isOpen,
  onClose,
  title,
  message,
  details,
  type = 'error',
  actionLabel = 'OK',
  onAction
}: ErrorPopupProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  const isError = type === 'error';
  const iconColor = isError ? 'text-red-600' : 'text-amber-600';
  const bgColor = isError ? 'bg-red-50' : 'bg-amber-50';
  const buttonColor = isError 
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
    : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose} showCloseButton={false}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${bgColor}`}>
            {isError ? (
              <XCircleIcon className={`h-6 w-6 ${iconColor}`} />
            ) : (
              <ExclamationTriangleIcon className={`h-6 w-6 ${iconColor}`} />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title || (isError ? 'Error' : 'Warning')}
          </h3>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-3">
          <p className="text-gray-700">
            {message}
          </p>
          {details && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-mono">
                {details}
              </p>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          onClick={handleAction}
          className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {actionLabel}
        </button>
      </ModalFooter>
    </Modal>
  );
}