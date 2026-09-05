import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Settings() {
  const { project, role } = useOutletContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = role === 'owner' || role === 'admin';
  const canDelete = role === 'owner';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    try {
      await apiClient.patch(`/projects/${project._id}`, { name, description });
      toast.success('Project settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    const confirmName = window.prompt(`To confirm deletion, please type the project name: ${project.name}`);
    if (confirmName !== project.name) {
      if (confirmName !== null) toast.error('Project name did not match');
      return;
    }
    
    setDeleting(true);
    try {
      await apiClient.delete(`/projects/${project._id}`);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Project Settings</h2>
        <p className="text-muted-foreground text-sm">Manage your project configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Update your project's basic information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit || saving}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit || saving}
              />
            </div>
            {canEdit && (
              <div className="pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Project</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Permanently remove this project, all collections, and all runtime data. This action cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={!canDelete || deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
          {!canDelete && (
            <p className="text-xs text-destructive mt-4">Only the project owner can delete this project.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
