import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FolderPlus } from 'lucide-react';
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
      setProjects(res.data.projects || []);
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
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground text-sm">Manage your Backend Forge projects.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p._id} to={`/projects/${p._id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="truncate">{p.name}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2 h-10">
                    {p.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
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
