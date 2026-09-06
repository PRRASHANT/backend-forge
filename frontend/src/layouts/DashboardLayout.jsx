import React from 'react';
import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Folder, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  let token = localStorage.getItem('bf_token');
  if (token === 'undefined') token = null;

  let user = null;
  try {
    const userStr = localStorage.getItem('bf_user');
    if (userStr && userStr !== 'undefined') {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }
  const navigate = useNavigate();
  const location = useLocation();

  // If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_user');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800/60 bg-zinc-950 p-4 flex flex-col">
        <div className="mb-10 px-2 mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <img src="/backend-forge-logo.svg" alt="Backend Forge" className="w-7 h-7" />
            <h2 className="text-base font-extrabold tracking-tight text-zinc-100">BACKEND FORGE</h2>
          </div>
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest pl-10">Build. Deploy. Scale.</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-1">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 relative overflow-hidden ${
              location.pathname === '/dashboard'
                ? 'bg-zinc-800/60 text-zinc-100 font-medium shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
            }`}
          >
            {location.pathname === '/dashboard' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
            <LayoutDashboard className={`h-4 w-4 ${location.pathname === '/dashboard' ? 'text-indigo-400' : ''}`} />
            Dashboard
          </Link>
          <Link 
            to="/projects" 
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 relative overflow-hidden ${
              location.pathname.startsWith('/projects')
                ? 'bg-zinc-800/60 text-zinc-100 font-medium shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
            }`}
          >
            {location.pathname.startsWith('/projects') && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
            <Folder className={`h-4 w-4 ${location.pathname.startsWith('/projects') ? 'text-indigo-400' : ''}`} />
            Projects
          </Link>
        </nav>

        <div className="mt-auto pt-4 pb-2">
          <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800/50 flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-300 font-medium text-sm border border-zinc-700/50">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">Account</p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            {location.pathname.startsWith('/projects') ? <Folder className="h-4 w-4 text-zinc-500" /> : <LayoutDashboard className="h-4 w-4 text-zinc-500" />}
            {location.pathname.startsWith('/projects') ? 'Projects' : 'Dashboard'}
          </h1>
          <span className="text-xs text-zinc-500 font-mono tracking-wide">Build. Deploy. Scale.</span>
        </header>
        <div className="flex-1 p-6 overflow-auto bg-zinc-950/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
