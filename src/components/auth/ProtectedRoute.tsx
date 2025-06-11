import React from 'react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string; // Kept for compatibility but not used
};

// Modified ProtectedRoute that doesn't require authentication
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children
}) => {
  // Always render children without authentication check
  return <>{children}</>;
};

export default ProtectedRoute;
