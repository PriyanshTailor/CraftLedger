import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../lib/roles';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.login(formData);
      const { user, token } = response.data;
      
      // Store via AuthContext
      login(user, token);

      // Redirect based on role
      const destination = user.role === ROLES.CONTACT
        ? '/contact'
        : user.role === ROLES.PLATFORM_ADMIN
          ? '/platform'
          : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" required
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
            placeholder="you@company.com" />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-royal hover:text-blue-700">Forgot password?</Link>
          </div>
          <input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="current-password" required
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
            placeholder="••••••••" />
        </div>

        <Button type="submit" className="w-full mt-4 h-11 bg-royal hover:bg-blue-700 text-white font-medium" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <p className="text-center mt-6 text-sm text-slate-500">
          Need an account? Ask your business owner to send you an invitation.
        </p>
      </form>
    </AuthLayout>
  );
}
