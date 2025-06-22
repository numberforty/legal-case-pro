'use client';

import React, { useState } from 'react';
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginButtonProps {
  email: string;
  password: string;
}

/**
 * Simplified and reliable login button that properly handles authentication flow
 */
export default function LoginButton({ email, password }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 LOGIN: Starting login process...');
      
      // Call the login method and await the response
      const response = await login(email, password);
      console.log('🚀 LOGIN: Login successful for:', response.user.email);
      
      setIsSuccess(true);
      
      // Store additional auth data in localStorage for client-side checks
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('loginTime', new Date().toISOString());
      
      console.log('🚀 LOGIN: Auth data stored, redirecting to dashboard...');
      
      // Simple redirect - let the middleware handle the rest
      // The middleware will see the auth-token cookie and redirect properly
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      console.error('🚀 LOGIN: Error during login:', err);
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
      setIsSuccess(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleLogin}
        disabled={isLoading || isSuccess}
        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            Signing in...
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Success! Redirecting to dashboard...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-5 w-5" />
            Sign In
          </>
        )}
      </button>
    </div>
  );
}