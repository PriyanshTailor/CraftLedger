import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../lib/roles';

/**
 * ProtectedRoute — wraps a route and checks if the user is authenticated
 * and optionally has the required roles.
 * 
 * @param {string[]} allowedRoles — if omitted, just checks authentication
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400 gap-2 text-sm">
        <div className="w-5 h-5 border-2 border-royal border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * RoleGuard — renders children only if the user has the required role(s).
 * Otherwise renders fallback (or nothing).
 */
export function RoleGuard({ roles, children, fallback = null }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return fallback;
  return children;
}

export function ContactTypeGuard({ contactTypes, children, fallback = <Navigate to="/contact" replace /> }) {
  const { user } = useAuth();
  if (!user || user.role !== ROLES.CONTACT || !contactTypes.includes(user.contactType)) return fallback;
  return children;
}

/**
 * PermissionGuard — renders children only if the user's role includes the permission.
 */
export function PermissionGuard({ permission, children, fallback = null }) {
  const { can } = useAuth();
  if (!can(permission)) return fallback;
  return children;
}
