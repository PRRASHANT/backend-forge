import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FolderPlus, ArrowRight } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Create Project State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/projects');
      setProjects(res.data.data.projects || []);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await apiClient.post('/projects', { name, description });
      toast.success('Project created successfully');
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchProjects();
      // Navigate straight to the new project workspace
      navigate(`/projects/${res.data.data.project._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 mt-2">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-100">Projects</h2>
          <p className="text-muted-foreground text-sm mt-1.5">Create and manage your Backend Forge projects.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm font-medium h-10 px-4 bg-zinc-100 text-zinc-900 hover:bg-white transition-colors">
          <FolderPlus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed bg-transparent">
          <CardHeader className="text-center py-12">
            <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>Create your first Backend Forge project to get started.</CardDescription>
            <div className="mt-4">
              <Button onClick={() => setIsModalOpen(true)}>Create Project</Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const monogram = p.name.substring(0, 2).toUpperCase();
            return (
              <Link key={p._id} to={`/projects/${p._id}`} className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl">
                <div className="flex flex-col h-full rounded-xl border border-zinc-800/60 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-6 flex-1 flex flex-col relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="h-12 w-12 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-sm font-bold text-zinc-300 shadow-inner group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors">
                        {monogram}
                      </div>
                      <div className="text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all duration-300">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-100 truncate mb-2">{p.name}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 flex-1 leading-relaxed">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="px-6 py-4 border-t border-zinc-800/50 bg-zinc-950 flex items-center justify-between mt-auto relative z-10">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Project ID</span>
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 truncate max-w-[150px]">
                      {p._id}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Project Name</label>
            <Input 
              id="name" 
              placeholder="e.g. My Awesome App" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">Description (optional)</label>
            <Input 
              id="description" 
              placeholder="A brief description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Project'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
