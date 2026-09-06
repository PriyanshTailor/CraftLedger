import React, { useState, useEffect } from 'react';
import { BookOpen, Search, RefreshCw, Calendar, User, Shield } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async (p = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/audit-logs?page=${p}&limit=25`);
      setLogs(res.data?.logs || []);
      setTotalPages(res.data?.pages || 1);
      setPage(res.data?.page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const filtered = logs.filter(l =>
    (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.entity || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Audit Trail & Activity Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Immutable record of critical business operations, edits, and security events.</p>
        </div>
        <Button variant="outline" onClick={() => fetchLogs(page)} disabled={isLoading} className="h-10 text-sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit actions or actors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-royal border-t-transparent rounded-full animate-spin" />
                      Loading audit logs...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">No activity logged yet.</td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-xs">{log.userId?.name || 'System'}</div>
                      <div className="text-[11px] text-slate-400">{log.userId?.email || 'automated'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {log.entity || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => fetchLogs(page - 1)}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => fetchLogs(page + 1)}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
