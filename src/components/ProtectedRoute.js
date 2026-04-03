import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import Sidebar from './Sidebar';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F4FBFA] flex">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Dashboard top bar */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 lg:px-6 sticky top-0 z-20 gap-4">
          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Notification bell (placeholder) */}
          <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative" aria-label="Notifications">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#62BABB] rounded-full" />
          </button>

          {/* User info in header */}
          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate max-w-[140px]">{user.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate max-w-[140px]">{user.email}</p>
              </div>
              <div className="w-9 h-9 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
