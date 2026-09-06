import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-20 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Horizontal Top Navigation */}
      <TopNavbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Page Content */}
      <main className="flex-1 overflow-x-hidden w-full">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
