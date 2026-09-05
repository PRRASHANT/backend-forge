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
        <div className="mb-8 px-1 mt-2">
          <h2 className="text-lg font-bold tracking-tight text-zinc-100">BACKEND FORGE</h2>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
              location.pathname === '/dashboard'
                ? 'bg-zinc-800/50 text-white font-medium border border-zinc-700/50 shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            to="/projects" 
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
              location.pathname.startsWith('/projects')
                ? 'bg-zinc-800/50 text-white font-medium border border-zinc-700/50 shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Folder className="h-4 w-4" />
            Projects
          </Link>
        </nav>

        <div className="border-t border-zinc-800 pt-4 mt-auto">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {user?.email}
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-destructive/10 text-destructive mt-1 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-6">
          <h1 className="text-sm font-medium">Dashboard</h1>
        </header>
        <div className="flex-1 p-6 overflow-auto bg-zinc-950/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
