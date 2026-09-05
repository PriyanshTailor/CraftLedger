import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../lib/roles';
import { Button } from '../components/ui/Button';

export function Unauthorized() {
  const { user } = useAuth();
  const returnPath = user?.role === ROLES.CONTACT ? '/contact' : '/dashboard';
  const returnLabel = user?.role === ROLES.CONTACT ? 'Go to My Dashboard' : 'Go to Dashboard';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 max-w-md w-full">
        <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto mb-6">
          <ShieldOff className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">Access Restricted</h1>
        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
          You do not have permission to access this page.<br />
          Please contact your administrator if you believe this is an error.
        </p>
        <Button asChild className="bg-royal hover:bg-blue-700 text-white w-full h-11">
          <Link to={returnPath}>{returnLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
