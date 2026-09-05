import React from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
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
      <aside className="w-64 border-r bg-zinc-950/50 p-4 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight">BACKEND FORGE</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent text-accent-foreground">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link to="/projects" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent text-muted-foreground">
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
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-destructive/10 text-destructive mt-1"
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
