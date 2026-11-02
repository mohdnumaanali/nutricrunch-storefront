import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * ProtectedRoute guards all /admin/* routes.
 * It checks the useAdminAuth() hook state:
 * - If still verifying session (isLoading), it renders a themed loading state.
 * - If unauthenticated (!isAuthenticated), it redirects immediately to /admin/login.
 * - If authenticated, it renders the protected children or Outlet.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9E9] flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-[#123D24]/10 shadow-sm">
          <div className="w-5 h-5 border-2 border-[#123D24] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#123D24]">Verifying Admin Credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to /admin/login while preserving origin in state
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
