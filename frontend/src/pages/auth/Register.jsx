import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', businessName: '', email: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      const { user, token } = response.data;
      login(user, token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors.map(e => e.message).join(', '));
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Join CraftLedger today.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} type="text" autoComplete="name" required
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="John Doe" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Business Name</label>
            <input name="businessName" value={formData.businessName} onChange={handleChange} type="text" autoComplete="organization" required
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="My Furniture Co." />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email Address</label>
          <input name="email" value={formData.email} onChange={handleChange} type="email" autoComplete="email" required
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="you@company.com" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input name="password" value={formData.password} onChange={handleChange} type="password" autoComplete="new-password" required
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="••••••••" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Confirm Password</label>
          <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" autoComplete="new-password" required
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all" placeholder="••••••••" />
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
