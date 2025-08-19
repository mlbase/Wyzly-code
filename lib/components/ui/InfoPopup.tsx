'use client';

import { 
  InformationCircleIcon, 
  CheckCircleIcon, 
  LightBulbIcon 
} from '@heroicons/react/24/outline';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  description?: string;
  type?: 'info' | 'success' | 'tip';
  actionLabel?: string;
  onAction?: () => void;
  showSecondaryAction?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function InfoPopup({
  isOpen,
  onClose,
  title,
  message,
  description,
  type = 'info',
  actionLabel = 'OK',
  onAction,
  showSecondaryAction = false,
  secondaryActionLabel = 'Cancel',
  onSecondaryAction
}: InfoPopupProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onClose();
    }
  };

  // Style configurations based on type
  const config = {
    info: {
      icon: InformationCircleIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      defaultTitle: 'Information'
    },
    success: {
      icon: CheckCircleIcon,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      defaultTitle: 'Success'
    },
    tip: {
      icon: LightBulbIcon,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      defaultTitle: 'Tip'
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose} showCloseButton={!showSecondaryAction}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${currentConfig.iconBg}`}>
            <IconComponent className={`h-6 w-6 ${currentConfig.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title || currentConfig.defaultTitle}
          </h3>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-3">
          <p className="text-gray-700">
            {message}
          </p>
          {description && (
            <p className="text-gray-600 text-sm">
              {description}
            </p>
          )}
        </div>
      </ModalBody>

      <ModalFooter className={showSecondaryAction ? "flex justify-end space-x-3" : "flex justify-end"}>
        {showSecondaryAction && (
          <button
            onClick={handleSecondaryAction}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            {secondaryActionLabel}
          </button>
        )}
        <button
          onClick={handleAction}
          className={`px-4 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentConfig.button}`}
        >
          {actionLabel}
        </button>
      </ModalFooter>
    </Modal>
  );
}