import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon, UserPlus, Search, RefreshCw, Power, Archive, ArchiveRestore,
  Shield, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { ROLES, ROLE_LABELS } from '../lib/roles';
import { getApiErrorMessage, getApiFieldErrors, validateEmail, validateRequired } from '../lib/validation';

export function Users() {
  const { user } = useAuth();
  const isBusinessOwner = user?.role === ROLES.BUSINESS_OWNER;
  const isPlatformAdmin = user?.role === ROLES.PLATFORM_ADMIN;

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users', { params: showArchived ? { includeArchived: 'true' } : undefined });
      setUsers(res.data?.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [showArchived]);

  const handleCreateAccountant = async (e) => {
    e.preventDefault();
    const errors = {};
    if (validateRequired(formData.name, 'Name')) errors.name = 'Name is required';
    if (validateEmail(formData.email)) errors.email = 'Enter a valid email address';
    if (!formData.password || formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/users/create-accountant', formData);
      setMessage({ type: 'success', text: `Accountant "${formData.name}" created successfully!` });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Failed to create accountant'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await api.patch(`/users/${u._id}`, { isActive: !u.isActive });
      setMessage({ type: 'success', text: `User ${u.name} status updated` });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update status' });
    }
  };

  const handleArchive = async (u) => {
    if (!window.confirm(`Archive user ${u.name}?`)) return;
    try {
      await api.patch(`/users/${u._id}/archive`);
      setMessage({ type: 'success', text: `User ${u.name} archived` });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to archive' });
    }
  };

  const handleRestore = async (u) => {
    try {
      await api.patch(`/users/${u._id}/restore`);
      setMessage({ type: 'success', text: `User ${u.name} restored` });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to restore user' });
    }
  };

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isPlatformAdmin ? 'Manage all platform and tenant accounts' : 'Manage your business staff, invoicing accountants, and team permissions.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={isLoading} className="h-10 text-sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowArchived(value => !value)} className="h-10 text-sm">
            <ArchiveRestore className="w-4 h-4 mr-2" /> {showArchived ? 'Hide archived' : 'Show archived'}
          </Button>
          {isBusinessOwner && (
            <Button onClick={() => { setIsModalOpen(true); setError(''); }} className="h-10 text-sm bg-royal hover:bg-blue-600 text-white font-medium">
              <UserPlus className="w-4 h-4 mr-2" /> Add Accountant
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-bold uppercase opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Total users: <span className="font-bold text-navy">{filtered.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Name & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-royal border-t-transparent rounded-full animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                          <span className="w-2 h-2 rounded-full bg-slate-300" /> {u.isArchived ? 'Archived' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {u._id !== user?._id && (
                        <>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                              u.isActive ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5 inline mr-1" />
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          {u.isArchived ? (
                            <button onClick={() => handleRestore(u)} className="px-2.5 py-1 text-xs rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors">
                              <ArchiveRestore className="w-3.5 h-3.5 inline mr-1" /> Restore
                            </button>
                          ) : (
                            <button onClick={() => handleArchive(u)} className="px-2.5 py-1 text-xs rounded-md border bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700 transition-colors">
                              <Archive className="w-3.5 h-3.5 inline mr-1" /> Archive
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy">Invite New Accountant</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            {error && <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">{error}</div>}

            <form onSubmit={handleCreateAccountant} className="space-y-3.5 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text" required placeholder="Accountant Name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  aria-invalid={Boolean(fieldErrors.name)}
                  className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-royal/20 focus:border-royal focus:outline-none ${fieldErrors.name ? 'border-red-300' : 'border-slate-200'}`}
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email" required placeholder="accountant@company.com" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-royal/20 focus:border-royal focus:outline-none ${fieldErrors.email ? 'border-red-300' : 'border-slate-200'}`}
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Temporary Password</label>
                <input
                  type="password" required minLength={6} placeholder="Min 6 characters" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  aria-invalid={Boolean(fieldErrors.password)}
                  className={`w-full h-10 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-royal/20 focus:border-royal focus:outline-none ${fieldErrors.password ? 'border-red-300' : 'border-slate-200'}`}
                />
                {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-10 text-sm">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="h-10 text-sm bg-royal hover:bg-blue-600 text-white font-medium">
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
