import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

// Protected route component - redirects to login if not authenticated
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="loading-spinner" role="status" aria-live="polite">
        {t("common.loading")}
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
