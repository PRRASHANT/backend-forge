import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Database, Key, Activity } from 'lucide-react';
import apiClient from '../api/client';

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
          collections: colRes?.data?.collections?.length || 0,
          apiKeys: keysRes?.data?.apiKeys?.length || 0,
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [project._id]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground text-sm">Welcome to {project.name}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Runtime API URL</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono truncate bg-zinc-900 p-2 rounded-md">
              {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/v1/{project._id}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Base endpoint for data access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collections}</div>
            <p className="text-xs text-muted-foreground mt-2">Active data models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiKeys}</div>
            <p className="text-xs text-muted-foreground mt-2">Active access keys</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link to="collections"><Database className="mr-2 h-4 w-4" /> Manage Collections</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="api-keys"><Key className="mr-2 h-4 w-4" /> Manage API Keys</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="api-explorer"><Activity className="mr-2 h-4 w-4" /> Open API Explorer</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
