/**
 * Special login handler utility to ensure reliable login and redirection
 * This approach combines multiple strategies to ensure the user is redirected correctly
 */

interface LoginResponse {
  user: any;
  token: string;
}

/**
 * Handle login and redirection with multiple fallback strategies
 */
export const handleSuccessfulLogin = (loginResponse: LoginResponse): Promise<void> => {
  return new Promise((resolve) => {
    console.log('🔐 Login handler: Processing successful login');
    
    // Step 1: Ensure localStorage is cleared of any stale data
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    
    // Step 2: Store fresh authentication data
    localStorage.setItem('user', JSON.stringify(loginResponse.user));
    localStorage.setItem('isAuthenticated', 'true');
    
    // Step 3: Log verification of stored data
    try {
      const storedUser = localStorage.getItem('user');
      console.log('🔐 Login handler: Verified localStorage data was set', 
        storedUser ? 'successfully' : 'FAILED');
    } catch (e) {
      console.error('🔐 Login handler: Error verifying localStorage', e);
    }
    
    // Step 4: Set a cookie as an additional auth method (non-HTTP-only for client access)
    document.cookie = `client-auth-verification=true; path=/; max-age=${60*60*24*7}`; // 7 days
    
    // Step 5: Use multiple redirection strategies with increasing delays
    console.log('🔐 Login handler: Setting up redirection strategies');
    
    // Strategy 1: Try Next.js navigation first (might not work due to client/server state issues)
    try {
      // This would typically be router.push but we'll skip that since it's not working
      console.log('🔐 Login handler: Strategy 1 skipped (Next.js router)');
    } catch (e) {
      console.error('🔐 Login handler: Strategy 1 error', e);
    }
    
    // Strategy 2: window.location.href after a small delay (most likely to work)
    setTimeout(() => {
      try {
        console.log('🔐 Login handler: Strategy 2 - Using window.location.href');
        window.location.href = '/dashboard';
      } catch (e) {
        console.error('🔐 Login handler: Strategy 2 error', e);
      }
    }, 500);
    
    // Strategy 3: Full URL navigation as ultimate fallback
    setTimeout(() => {
      try {
        console.log('🔐 Login handler: Strategy 3 - Using full URL navigation');
        window.location.href = `${window.location.protocol}//${window.location.host}/dashboard`;
      } catch (e) {
        console.error('🔐 Login handler: Strategy 3 error', e);
      }
      // After final attempt, resolve the promise
      resolve();
    }, 1500);
  });
};
