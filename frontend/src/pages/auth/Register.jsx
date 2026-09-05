import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';

export function Register() {
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
    <AuthLayout title="Create an account" subtitle="Join Urban Furniture Intelligence today.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" required className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="John Doe" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Business Name</label>
            <input type="text" required className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="Urban Furniture Co." />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email Address</label>
          <input type="email" required className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="you@company.com" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input type="password" required className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="••••••••" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Confirm Password</label>
          <input type="password" required className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="••••••••" />
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input type="checkbox" id="terms" required className="mt-1 rounded text-royal focus:ring-royal border-slate-300" />
          <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
            I agree to the <a href="#" className="text-royal hover:underline">Terms of Service</a> and <a href="#" className="text-royal hover:underline">Privacy Policy</a>.
          </label>
        </div>

        <Button type="submit" className="w-full mt-4 h-11 bg-royal hover:bg-blue-700 text-white font-medium" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
        
        <div className="text-center mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-medium text-royal hover:text-blue-700">Sign In</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
