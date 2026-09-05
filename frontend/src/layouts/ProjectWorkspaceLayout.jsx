import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Key, Activity, BarChart3, Users, Settings, ArrowLeft } from 'lucide-react';
import apiClient from '../api/client';
import { Badge } from '../components/ui/Badge';

export default function ProjectWorkspaceLayout() {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await apiClient.get(`/projects/${projectId}`);
        setProject(res.data.data.project);
        setRole(res.data.data.role);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground flex-1">Loading workspace...</div>;
  }

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const navItems = [
    { name: 'Overview', path: `/projects/${projectId}`, icon: LayoutDashboard },
    { name: 'Collections', path: `/projects/${projectId}/collections`, icon: Database },
    { name: 'API Explorer', path: `/projects/${projectId}/api-explorer`, icon: Activity },
    { name: 'API Keys', path: `/projects/${projectId}/api-keys`, icon: Key },
    { name: 'Logs', path: `/projects/${projectId}/logs`, icon: BarChart3 },
    { name: 'Analytics', path: `/projects/${projectId}/analytics`, icon: BarChart3 },
    { name: 'Members', path: `/projects/${projectId}/members`, icon: Users },
    { name: 'Settings', path: `/projects/${projectId}/settings`, icon: Settings },
  ];

  return (
    <div className="flex h-full w-full">
      {/* Workspace Sidebar */}
      <aside className="w-64 border-r border-zinc-800/60 bg-zinc-950 p-4 flex flex-col overflow-y-auto">
        <Link to="/projects" className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to Projects
        </Link>
        
        <div className="mb-8 px-1">
          <h2 className="text-base font-semibold tracking-tight text-zinc-100 truncate">{project.name}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary" className="text-[10px] uppercase font-medium tracking-wider py-0 px-1.5 bg-zinc-800 text-zinc-300 border-zinc-700/50">{role}</Badge>
            <span className="text-[10px] text-zinc-500 font-mono truncate">{project._id}</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-zinc-800/50 text-white font-medium border border-zinc-700/50 shadow-sm' 
                    : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Workspace Content */}
      <main className="flex-1 overflow-auto bg-zinc-950/30">
        <Outlet context={{ project, role }} />
      </main>
    </div>
  );
}
