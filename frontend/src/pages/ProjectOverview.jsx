import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Database, Key, Activity } from 'lucide-react';
import apiClient, { BASE_URL } from '../api/client';

export default function ProjectOverview() {
  const { project, role } = useOutletContext();
  const [stats, setStats] = useState({ collections: 0, apiKeys: 0 });
  
  useEffect(() => {
    // Attempt to fetch collection count and api key count if user has access
    const fetchStats = async () => {
      try {
        const [colRes, keysRes] = await Promise.all([
          apiClient.get(`/projects/${project._id}/collections`).catch(() => null),
          apiClient.get(`/projects/${project._id}/api-keys`).catch(() => null)
        ]);
        setStats({
          collections: colRes?.data?.data?.collections?.length || 0,
          apiKeys: keysRes?.data?.data?.apiKeys?.length || 0,
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [project._id]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 mt-2">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-100">Overview</h2>
          <p className="text-muted-foreground text-sm mt-1.5">Welcome to {project.name}.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Runtime API URL Card */}
        <div className="flex flex-col h-full rounded-xl border border-zinc-800/60 bg-zinc-950 hover:border-zinc-700 transition-colors shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-100 pointer-events-none" />
          <div className="p-6 flex-1 flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">Runtime API URL</h3>
              <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-zinc-400">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-md border border-indigo-500/20 truncate mb-2">
                {BASE_URL}/v1/{project._id}
              </div>
              <p className="text-xs text-zinc-500 font-medium">Base endpoint for data access</p>
            </div>
          </div>
        </div>

        {/* Collections Card */}
        <div className="flex flex-col h-full rounded-xl border border-zinc-800/60 bg-zinc-950 hover:border-zinc-700 transition-colors shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-100 pointer-events-none" />
          <div className="p-6 flex-1 flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">Collections</h3>
              <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-zinc-400">
                <Database className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-extrabold text-zinc-100 mb-1">{stats.collections}</div>
              <p className="text-xs text-zinc-500 font-medium">Active data models</p>
            </div>
          </div>
        </div>

        {/* API Keys Card */}
        <div className="flex flex-col h-full rounded-xl border border-zinc-800/60 bg-zinc-950 hover:border-zinc-700 transition-colors shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-100 pointer-events-none" />
          <div className="p-6 flex-1 flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-300">API Keys</h3>
              <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-zinc-400">
                <Key className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-extrabold text-zinc-100 mb-1">{stats.apiKeys}</div>
              <p className="text-xs text-zinc-500 font-medium">Active access keys</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/20">
            <h3 className="text-sm font-semibold text-zinc-100">Quick Links</h3>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <Link to="collections" className="group flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <Database className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">Manage Collections</span>
              </div>
            </Link>
            
            <Link to="api-keys" className="group flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <Key className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">Manage API Keys</span>
              </div>
            </Link>
            
            <Link to="api-explorer" className="group flex items-center justify-between p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">Open API Explorer</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
