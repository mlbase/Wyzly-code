'use client';

import React, { createContext, useContext, useState } from 'react';
import { ErrorPopup } from '../components/ui/ErrorPopup';
import { ConfirmPopup } from '../components/ui/ConfirmPopup';
import { InfoPopup } from '../components/ui/InfoPopup';
import { ToastContainer, ToastProps } from '../components/ui/Toast';

interface ErrorPopupState {
  title?: string;
  message: string;
  details?: string;
  type?: 'error' | 'warning';
  actionLabel?: string;
  onAction?: () => void;
}

interface ConfirmPopupState {
  title?: string;
  message: string;
  description?: string;
  type?: 'default' | 'danger' | 'warning';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}

interface InfoPopupState {
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

interface PopupContextType {
  // Error popup
  showError: (config: ErrorPopupState) => void;
  hideError: () => void;
  
  // Confirm popup
  showConfirm: (config: ConfirmPopupState) => void;
  hideConfirm: () => void;
  setConfirmLoading: (loading: boolean) => void;
  
  // Info popup
  showInfo: (config: InfoPopupState) => void;
  hideInfo: () => void;
  
  // Toast notifications
  showToast: (config: Omit<ToastProps, 'id' | 'onClose'>) => void;
  
  // Quick methods
  showSuccessToast: (message: string, title?: string) => void;
  showErrorToast: (message: string, title?: string) => void;
  showWarningToast: (message: string, title?: string) => void;
  showInfoToast: (message: string, title?: string) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  // Error popup state
  const [errorPopup, setErrorPopup] = useState<ErrorPopupState | null>(null);
  
  // Confirm popup state
  const [confirmPopup, setConfirmPopup] = useState<ConfirmPopupState | null>(null);
  
  // Info popup state
  const [infoPopup, setInfoPopup] = useState<InfoPopupState | null>(null);
  
  // Toast state
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Error popup methods
  const showError = (config: ErrorPopupState) => {
    setErrorPopup(config);
  };

  const hideError = () => {
    setErrorPopup(null);
  };

  // Confirm popup methods
  const showConfirm = (config: ConfirmPopupState) => {
    setConfirmPopup(config);
  };

  const hideConfirm = () => {
    setConfirmPopup(null);
  };

  const setConfirmLoading = (loading: boolean) => {
    if (confirmPopup) {
      setConfirmPopup({ ...confirmPopup, loading });
    }
  };

  // Info popup methods
  const showInfo = (config: InfoPopupState) => {
    setInfoPopup(config);
  };

  const hideInfo = () => {
    setInfoPopup(null);
  };

  // Toast methods
  const showToast = (config: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString() + Math.random().toString(36);
    const toast: ToastProps = {
      ...config,
      id,
      onClose: (toastId: string) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }
    };
    setToasts(prev => [...prev, toast]);
  };

  // Quick toast methods
  const showSuccessToast = (message: string, title?: string) => {
    showToast({ type: 'success', message, title });
  };

  const showErrorToast = (message: string, title?: string) => {
    showToast({ type: 'error', message, title });
  };

  const showWarningToast = (message: string, title?: string) => {
    showToast({ type: 'warning', message, title });
  };

  const showInfoToast = (message: string, title?: string) => {
    showToast({ type: 'info', message, title });
  };

  const value = {
    showError,
    hideError,
    showConfirm,
    hideConfirm,
    setConfirmLoading,
    showInfo,
    hideInfo,
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
      
      {/* Error Popup */}
      {errorPopup && (
        <ErrorPopup
          isOpen={true}
          onClose={hideError}
          {...errorPopup}
        />
      )}
      
      {/* Confirm Popup */}
      {confirmPopup && (
        <ConfirmPopup
          isOpen={true}
          onClose={hideConfirm}
          {...confirmPopup}
        />
      )}
      
      {/* Info Popup */}
      {infoPopup && (
        <InfoPopup
          isOpen={true}
          onClose={hideInfo}
          {...infoPopup}
        />
      )}
      
      {/* Toast Container */}
      <ToastContainer 
        toasts={toasts}
        onCloseToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}