import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLES, ROLE_PERMISSIONS, hasPermission } from '../lib/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          ...parsed,
          permissions: ROLE_PERMISSIONS[parsed.role] || []
        });
      } catch {
        // Corrupt data — clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    const enriched = {
      ...userData,
      permissions: ROLE_PERMISSIONS[userData.role] || []
    };
    setUser(enriched);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(enriched));
    localStorage.setItem('isAuthenticated', 'true');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }, []);

  const can = useCallback((permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  }, [user]);

  const isRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  const isAuthenticated = !!user;

  // Role helpers
  const isBusinessOwner = user?.role === ROLES.BUSINESS_OWNER;
  const isPlatformAdmin = user?.role === ROLES.PLATFORM_ADMIN;
  const isAccountant = user?.role === ROLES.ACCOUNTANT;
  const isContact = user?.role === ROLES.CONTACT;

  // Default redirect after login/unauthorized
  const defaultPath = user?.role === ROLES.CONTACT ? '/contact' : user?.role === ROLES.PLATFORM_ADMIN ? '/platform' : '/dashboard';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      isBusinessOwner,
      isPlatformAdmin,
      isAccountant, 
      isContact, 
      login, 
      logout, 
      can, 
      isRole,
      defaultPath
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
