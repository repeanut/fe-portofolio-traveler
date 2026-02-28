// Authentication utilities for persistent login

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userEmail: string | null;
  userName: string | null;
  authProvider: string | null;
  loginTime: string | null;
  userAvatarUrl: string | null;
}

// Check if user is authenticated with token validation
export const checkAuthState = (): AuthState => {
  const token = localStorage.getItem('authToken');
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const authProvider = localStorage.getItem('authProvider');
  const loginTime = localStorage.getItem('loginTime');
  const userAvatarUrl = localStorage.getItem('userAvatarUrl');

  // Check if token exists and is not expired (30 days)
  if (token && loginTime) {
    const loginTimeMs = parseInt(loginTime);
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    
    if (now - loginTimeMs > thirtyDaysInMs) {
      // Token expired, clear auth data
      clearAuthData();
      return {
        isAuthenticated: false,
        token: null,
        userEmail: null,
        userName: null,
        authProvider: null,
        loginTime: null,
        userAvatarUrl: null
      };
    }
  }

  return {
    isAuthenticated: !!token && isAuthenticated,
    token,
    userEmail,
    userName,
    authProvider,
    loginTime,
    userAvatarUrl
  };
};

// Clear authentication data
export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authProvider');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('userAvatarUrl');
};

// Store authentication data
export const storeAuthData = (token: string, userData: any, provider: string = 'google'): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('userEmail', userData.email);
  localStorage.setItem('userName', userData.displayName || userData.username);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('authProvider', provider);
  localStorage.setItem('loginTime', Date.now().toString());
  
  if (userData.photoUrl || userData.picture) {
    localStorage.setItem('userAvatarUrl', userData.photoUrl || userData.picture);
  }
};

// Verify token with backend
export const verifyTokenWithBackend = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/google/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.success;
    }
    return false;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

// Auto-redirect to login if not authenticated
export const requireAuth = (redirectUrl: string = '/login'): boolean => {
  const authState = checkAuthState();
  
  if (!authState.isAuthenticated) {
    window.location.href = redirectUrl;
    return false;
  }
  
  return true;
};
