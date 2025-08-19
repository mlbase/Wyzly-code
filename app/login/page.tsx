'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/contexts/AuthContext';
import { usePopup } from '../../lib/contexts/PopupContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'customer' | 'restaurant' | 'admin'>('customer');
  
  const { login, user } = useAuth();
  const { showError, showSuccessToast } = usePopup();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectUrl = user.role === 'admin' ? '/admin' : 
                         user.role === 'restaurant' ? '/restaurant' : '/feed';
      router.push(redirectUrl);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(email, password, role);
      
      if (result.success && result.redirectUrl) {
        showSuccessToast(`Welcome back!`, 'Login successful');
        // Redirect based on role
        router.push(result.redirectUrl);
      } else {
        showError({
          title: 'Login Failed',
          message: result.error || 'Unable to log in with the provided credentials.',
          type: 'error'
        });
      }
    } catch (err) {
      showError({
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">W</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Wyzly</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              I am a:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                  role === 'customer'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('restaurant')}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                  role === 'restaurant'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                Restaurant
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                  role === 'admin'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ChevronRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div><strong>Admin:</strong> admin@wyzly.com / password</div>
              <div><strong>Restaurant:</strong> pasta_palace@example.com / password</div>
              <div><strong>Customer:</strong> john.doe@example.com / password</div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Mobile Optimization Note */}
        <div className="text-center text-xs text-gray-500 px-4">
          <p>Optimized for mobile • Tap above to get started</p>
        </div>
      </div>
    </div>
  );
}