'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Client-side route protection component
 * This is complementary to the server-side middleware protection
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isLocalStorageChecked, setIsLocalStorageChecked] = useState(false);
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);

  console.log('🔒 ProtectedRoute - Initial auth state:', { user, isLoading });

  // Double-check localStorage as a backup authentication method
  useEffect(() => {
    try {
      console.log('🔒 ProtectedRoute - Checking localStorage fallback...');
      const storedUser = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      if (storedUser && isAuthenticated === 'true') {
        try {
          const parsedUser = JSON.parse(storedUser);
          setLocalUser(parsedUser);
          setIsLocallyAuthenticated(true);
          console.log('🔒 ProtectedRoute - Found local authentication:', parsedUser.email);
        } catch (parseError) {
          console.error('🔒 Error parsing user from localStorage:', parseError);
        }
      } else {
        console.log('🔒 ProtectedRoute - No valid local auth found');
      }
    } catch (error) {
      console.error('🔒 Error accessing localStorage:', error);
    } finally {
      setIsLocalStorageChecked(true);
    }
  }, []);

  // Final authentication check combining context and localStorage
  const isAuthenticated = !!user || isLocallyAuthenticated;
  
  // Log the final auth decision
  useEffect(() => {
    if (isLocalStorageChecked) {
      console.log('🔒 ProtectedRoute - Final auth decision:', { 
        isAuthenticated,
        fromContext: !!user,
        fromLocalStorage: isLocallyAuthenticated
      });
    }
  }, [isLocalStorageChecked, user, isLocallyAuthenticated]);

  // If still loading auth state and haven't checked localStorage, show loading
  if (isLoading && !isLocalStorageChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-blue-600 font-medium">Verifying authentication...</p>
      </div>
    );
  }

  // If not authenticated via context OR localStorage, redirect to login
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute - Not authenticated, redirecting to login');
    
    // Use direct navigation for more reliable redirection
    if (typeof window !== 'undefined') {
      // Short timeout to avoid immediate redirect that might conflict with hydration
      setTimeout(() => {
        console.log('🔒 ProtectedRoute - Executing redirect to login');
        window.location.href = '/login';
      }, 100);
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
          <ShieldAlert className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-red-600 font-medium">Authentication required</p>
          <p className="text-red-500">Redirecting to login page...</p>
        </div>
      );
    }
  }

  // User is authenticated (either through context or localStorage), render children
  console.log('🔒 ProtectedRoute - Authentication verified, rendering protected content');
  return <>{children}</>;
}
