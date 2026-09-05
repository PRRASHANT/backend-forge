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
        setProject(res.data.project);
        setRole(res.data.role);
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
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/80 p-4 flex flex-col overflow-y-auto">
        <Link to="/projects" className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to Projects
        </Link>
        
        <div className="mb-6">
          <h2 className="text-lg font-bold tracking-tight truncate">{project.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground font-mono truncate">{project._id}</span>
            <Badge variant="outline" className="text-[10px] uppercase py-0">{role}</Badge>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-zinc-800/50 hover:text-foreground'
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
