import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    // If not authenticated, redirect to the login page.
    // We pass the original location so we can redirect back after login.
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (role !== 'event_admin' && role !== 'super_admin') {
    // If authenticated but not an authorized role, show an error and redirect to home.
    toast.error('You are not authorized to access this page.');
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the child components (the Admin page).
  return children;
};

export default ProtectedRoute;