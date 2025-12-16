
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireKYC?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireKYC = true }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const kycCompleted = localStorage.getItem('kycCompleted') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireKYC && !kycCompleted) {
    return <Navigate to="/kyc" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
