import React, { useState, useEffect } from 'react';
import {
  Users, Building2, UserPlus, ShieldAlert, ShieldCheck, CheckCircle2,
  XCircle, Search, RefreshCw, Archive, Power, AlertCircle, ArrowUpRight,
  TrendingUp, Activity, Layers, Lock
} from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { ROLES, ROLE_LABELS } from '../lib/roles';

export function PlatformAdmin() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: ''
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data?.users || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch platform users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user._id}`, { isActive: !user.isActive });
      setActionMessage({ type: 'success', text: `User ${user.name} is now ${!user.isActive ? 'Active' : 'Inactive'}` });
      fetchUsers();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update user status' });
    }
  };

  const handleArchive = async (user) => {
    if (!window.confirm(`Are you sure you want to archive user "${user.name}"?`)) return;
    try {
      await api.patch(`/users/${user._id}/archive`);
      setActionMessage({ type: 'success', text: `User ${user.name} archived successfully` });
      fetchUsers();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to archive user' });
    }
  };

  const handleCreateBusinessOwner = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await api.post('/users/create-business-owner', formData);
      setActionMessage({ type: 'success', text: `Business "${formData.businessName}" and Owner account created successfully!` });
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', password: '', businessName: '' });
      fetchUsers();
    } catch (err) {
      setErrorMessage(err.message || (err.errors ? err.errors.map(e => e.message).join(', ') : 'Failed to create business'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const businessOwnersCount = users.filter(u => u.role === ROLES.BUSINESS_OWNER).length;
  const accountantsCount = users.filter(u => u.role === ROLES.ACCOUNTANT).length;
  const contactsCount = users.filter(u => u.role === ROLES.CONTACT).length;
  const activeCount = users.filter(u => u.isActive).length;

  const roleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.PLATFORM_ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ROLES.BUSINESS_OWNER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ROLES.ACCOUNTANT:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case ROLES.CONTACT:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-royal/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium mb-2 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Administrator Control Plane</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">System & Tenant Administration</h1>
            <p className="text-slate-300 text-sm mt-1">
              Manage multi-tenant business provisioning, platform user access, and system governance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm h-10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => { setIsCreateModalOpen(true); setErrorMessage(''); }}
              className="bg-royal hover:bg-blue-600 text-white shadow-lg shadow-blue-900/30 text-sm h-10 font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Onboard Business Owner
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold uppercase opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</span>
            <div className="text-2xl font-bold text-navy mt-1">{totalUsers}</div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> {activeCount} Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-royal flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Businesses</span>
            <div className="text-2xl font-bold text-navy mt-1">{businessOwnersCount}</div>
            <span className="text-xs text-slate-500 mt-1 block">Provisioned Tenants</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accountants</span>
            <div className="text-2xl font-bold text-navy mt-1">{accountantsCount}</div>
            <span className="text-xs text-slate-500 mt-1 block">Active Invoicing Staff</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Client Contacts</span>
            <div className="text-2xl font-bold text-navy mt-1">{contactsCount}</div>
            <span className="text-xs text-slate-500 mt-1 block">Portal Access Accounts</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Directory Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT, ROLES.CONTACT].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  roleFilter === r
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : ROLE_LABELS[r] || r}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
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
                      Loading user accounts...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeStyle(u.role)}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                          <span className="w-2 h-2 rounded-full bg-slate-300" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {u.role !== ROLES.PLATFORM_ADMIN && (
                        <>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                              u.isActive
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={u.isActive ? 'Deactivate account' : 'Activate account'}
                          >
                            <Power className="w-3.5 h-3.5 inline mr-1" />
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleArchive(u)}
                            className="px-2.5 py-1 text-xs rounded-md border bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                            title="Archive account"
                          >
                            <Archive className="w-3.5 h-3.5 inline mr-1" />
                            Archive
                          </button>
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

      {/* Onboard Business Owner Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-navy">Onboard New Business Owner</h3>
                <p className="text-xs text-slate-500">Creates a new business entity and provisions its primary owner.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateBusinessOwner} className="space-y-3.5 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Woods Furniture"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-royal/20 focus:border-royal focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Owner Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-royal/20 focus:border-royal focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="owner@furniture.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-royal/20 focus:border-royal focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Temporary Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-royal/20 focus:border-royal focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-10 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 text-sm bg-royal hover:bg-blue-600 text-white font-semibold"
                >
                  {isSubmitting ? 'Provisioning...' : 'Create Business & Owner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
