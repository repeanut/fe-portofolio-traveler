import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminToast } from '../../hooks/useAdminToast';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const toast = useAdminToast();

  // Check authentication status
  const checkAuth = () => {
    try {
      const isAuth = localStorage.getItem("isAuthenticated") === "true" ||
                    sessionStorage.getItem("isAuthenticated") === "true";
      
      const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const isAdmin = localStorage.getItem("isAdmin") === "true" || sessionStorage.getItem("isAdmin") === "true";

      // Additional validation for admin access
      if (!isAuth || !authToken || !isAdmin) {
        console.warn('Admin authentication failed:', { isAuth, hasToken: !!authToken, isAdmin });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking admin auth:', error);
      return false;
    }
  };

  // Handle authentication changes
  const handleAuthChange = () => {
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    setIsLoading(false);

    if (!isAuth && location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
      toast.error("Session Expired", "Please login again to continue");
    }
  };

  useEffect(() => {
    // Initial check
    handleAuthChange();

    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated' || e.key === 'authToken' || e.key === 'isAdmin') {
        handleAuthChange();
      }
    };

    const handleAuthEvent = () => {
      handleAuthChange();
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:changed', handleAuthEvent);

    // Periodic session check (every 30 seconds)
    const sessionCheck = setInterval(() => {
      if (isAuthenticated && !checkAuth()) {
        console.warn('Session expired during periodic check');
        handleAuthChange();
      }
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:changed', handleAuthEvent);
      clearInterval(sessionCheck);
    };
  }, [location.pathname]);

  // Handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // Re-check auth when tab becomes visible
        const stillAuth = checkAuth();
        if (!stillAuth) {
          handleAuthChange();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (location.pathname === '/admin/login') {
      return <>{children}</>;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Redirect to dashboard if trying to access login page while authenticated
  if (location.pathname === '/admin/login') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
