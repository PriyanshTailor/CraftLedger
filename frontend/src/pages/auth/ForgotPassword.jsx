import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a link to reset your password.">
      {!isSent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input type="email" required className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="you@company.com" />
          </div>

          <Button type="submit" className="w-full mt-4 h-11 bg-royal hover:bg-blue-700 text-white font-medium" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? 'Sending link...' : 'Send Reset Link'}
          </Button>
          
          <div className="text-center mt-6 text-sm text-slate-500">
            <Link to="/login" className="font-medium text-royal hover:text-blue-700">Back to Login</Link>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-navy">Check your email</h3>
          <p className="text-slate-500 text-sm">
            We sent a password reset link to your email.
          </p>
          <Button asChild variant="outline" className="w-full mt-4 h-11">
            <Link to="/login">Back to Login</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
