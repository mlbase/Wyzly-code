'use client';

import { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { usePopup } from '../../contexts/PopupContext';
import { Button, Input, Modal } from '../../design-system';

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginPopup({ isOpen, onClose, onSuccess }: LoginPopupProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccessToast, showErrorToast } = usePopup();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      showErrorToast('Email is required');
      return false;
    }

    if (!formData.password.trim()) {
      showErrorToast('Password is required');
      return false;
    }

    if (!isLoginMode) {
      if (!formData.username.trim()) {
        showErrorToast('Username is required for registration');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        showErrorToast('Passwords do not match');
        return false;
      }

      if (formData.password.length < 6) {
        showErrorToast('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLoginMode) {
        // Login - using email and defaulting to customer role
        const result = await login(formData.email, formData.password, 'customer');
        if (result.success) {
          showSuccessToast('Login successful! Syncing your data...');
          onSuccess?.();
          onClose();
        } else {
          showErrorToast(result.error || 'Invalid email or password');
        }
      } else {
        // Register
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (data.success) {
          showSuccessToast('Registration successful! Please login.');
          setIsLoginMode(true);
          setFormData(prev => ({
            ...prev,
            email: '',
            password: '',
            confirmPassword: ''
          }));
        } else {
          showErrorToast(data.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      showErrorToast('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleModeSwitch = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isLoginMode 
                ? 'Sign in to sync your cart and favorites'
                : 'Create an account to save your preferences'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              variant="default"
              size="md"
              disabled={loading}
            />
          </div>

          {/* Username (Register only) */}
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your username"
                variant="default"
                size="md"
                disabled={loading}
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                variant="default"
                size="md"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  variant="default"
                  size="md"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isLoginMode ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-gray-600">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={handleModeSwitch}
              disabled={loading}
              className="text-orange-600 hover:text-orange-500 font-medium transition-colors"
            >
              {isLoginMode ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
}