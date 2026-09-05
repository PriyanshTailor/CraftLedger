import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Mock authentication
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    }, 800);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email Address</label>
          <input type="email" required className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="you@company.com" defaultValue="admin@urbanfurniture.in" />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-royal hover:text-blue-700">Forgot password?</Link>
          </div>
          <input type="password" required className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="••••••••" defaultValue="password123" />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="remember" className="rounded text-royal focus:ring-royal border-slate-300" />
          <label htmlFor="remember" className="text-sm text-slate-600">Remember me for 30 days</label>
        </div>

        <Button type="submit" className="w-full mt-4 h-11 bg-royal hover:bg-blue-700 text-white font-medium" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <div className="text-center mt-6 text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="font-medium text-royal hover:text-blue-700">Create one</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
