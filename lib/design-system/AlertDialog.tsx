'use client';

import { 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon,
  LightBulbIcon 
} from '@heroicons/react/24/outline';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';

// Unified Alert Dialog for Error, Info, Success messages
interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant: 'error' | 'warning' | 'info' | 'success' | 'tip';
  title?: string;
  message: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showSecondaryAction?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function AlertDialog({
  isOpen,
  onClose,
  variant,
  title,
  message,
  description,
  actionLabel = 'OK',
  onAction,
  showSecondaryAction = false,
  secondaryActionLabel = 'Cancel',
  onSecondaryAction
}: AlertDialogProps) {
  
  const handlePrimaryAction = () => {
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

  // Sustainable variant configuration
  const variantConfig = {
    error: {
      icon: XCircleIcon,
      iconWrapperClass: 'bg-red-50',
      iconClass: 'text-red-600',
      buttonVariant: 'danger' as const,
      defaultTitle: 'Error'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconWrapperClass: 'bg-amber-50',
      iconClass: 'text-amber-600',
      buttonVariant: 'warning' as const,
      defaultTitle: 'Warning'
    },
    info: {
      icon: InformationCircleIcon,
      iconWrapperClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      buttonVariant: 'primary' as const,
      defaultTitle: 'Information'
    },
    success: {
      icon: CheckCircleIcon,
      iconWrapperClass: 'bg-green-50',
      iconClass: 'text-green-600',
      buttonVariant: 'primary' as const,
      defaultTitle: 'Success'
    },
    tip: {
      icon: LightBulbIcon,
      iconWrapperClass: 'bg-yellow-50',
      iconClass: 'text-yellow-600',
      buttonVariant: 'warning' as const,
      defaultTitle: 'Tip'
    }
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose} showCloseButton={!showSecondaryAction}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${config.iconWrapperClass}`}>
            <IconComponent className={`h-6 w-6 ${config.iconClass}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title || config.defaultTitle}
          </h3>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-3">
          <p className="text-gray-700">
            {message}
          </p>
          {description && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {description}
              </p>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter className={showSecondaryAction ? "flex justify-end space-x-3" : "flex justify-end"}>
        {showSecondaryAction && (
          <Button
            variant="secondary"
            onClick={handleSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}
        <Button
          variant={config.buttonVariant}
          onClick={handlePrimaryAction}
        >
          {actionLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Convenient component variants
export function ErrorDialog(props: Omit<AlertDialogProps, 'variant'>) {
  return <AlertDialog {...props} variant="error" />;
}

export function WarningDialog(props: Omit<AlertDialogProps, 'variant'>) {
  return <AlertDialog {...props} variant="warning" />;
}

export function InfoDialog(props: Omit<AlertDialogProps, 'variant'>) {
  return <AlertDialog {...props} variant="info" />;
}

export function SuccessDialog(props: Omit<AlertDialogProps, 'variant'>) {
  return <AlertDialog {...props} variant="success" />;
}

export function TipDialog(props: Omit<AlertDialogProps, 'variant'>) {
  return <AlertDialog {...props} variant="tip" />;
}