import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Database, Plus, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import SchemaBuilder from './SchemaBuilder';

export default function Collections() {
  const { project, role } = useOutletContext();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // view: 'list' | 'create' | 'edit'
  const [view, setView] = useState('list');
  const [selectedCollection, setSelectedCollection] = useState(null);

  // New Collection State
  const [newCollectionName, setNewCollectionName] = useState('');

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${project._id}/collections`);
      setCollections(res.data.collections || []);
    } catch (err) {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [project._id]);

  const handleDelete = async (colId) => {
    if (!window.confirm('Are you sure you want to delete this collection? Data will be lost.')) return;
    try {
      await apiClient.delete(`/projects/${project._id}/collections/${colId}`);
      toast.success('Collection deleted');
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  const handleCreate = async (fields) => {
    try {
      await apiClient.post(`/projects/${project._id}/collections`, {
        name: newCollectionName,
        fields,
      });
      toast.success('Collection created');
      setView('list');
      setNewCollectionName('');
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create collection');
    }
  };

  const handleUpdate = async (fields) => {
    try {
      await apiClient.patch(`/projects/${project._id}/collections/${selectedCollection._id}`, {
        fields,
      });
      toast.success('Collection schema updated');
      setView('list');
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update collection');
    }
  };

  if (view === 'create') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setView('list')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create Collection</h2>
            <p className="text-muted-foreground text-sm">Define the schema for your new collection.</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2 max-w-sm">
                <label className="text-sm font-medium">Collection Name</label>
                <Input 
                  placeholder="e.g. products, users" 
                  value={newCollectionName} 
                  onChange={(e) => setNewCollectionName(e.target.value)} 
                />
              </div>
              <div className="border-t pt-4 border-zinc-800">
                <h3 className="text-lg font-medium mb-4">Schema Definition</h3>
                <SchemaBuilder onSave={handleCreate} initialFields={[]} collections={collections} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setView('list')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Collection: {selectedCollection.name}</h2>
            <p className="text-muted-foreground text-sm">Update the schema fields. Existing data validation will adapt.</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <SchemaBuilder 
              onSave={handleUpdate} 
              initialFields={selectedCollection.fields} 
              collections={collections}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground text-sm">Define data models for your runtime API.</p>
        </div>
        {role !== 'viewer' && (
          <Button onClick={() => setView('create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Collection
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading collections...</div>
      ) : collections.length === 0 ? (
        <Card className="border-dashed bg-transparent">
          <CardHeader className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No collections yet</CardTitle>
            <CardDescription>Create your first collection to start saving runtime data.</CardDescription>
            {role !== 'viewer' && (
              <div className="mt-4">
                <Button onClick={() => setView('create')}>Create Collection</Button>
              </div>
            )}
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <Card key={col._id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="truncate">{col.name}</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">/{col.slug}</CardDescription>
                  </div>
                  <Badge variant="secondary">{col.fields.length} fields</Badge>
                </div>
              </CardHeader>
              <CardContent className="mt-auto pt-0 flex justify-between gap-2">
                {role !== 'viewer' ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedCollection(col); setView('edit'); }}>
                      <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit Schema
                    </Button>
                    {role !== 'developer' && (
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(col._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedCollection(col); setView('edit'); }}>
                    View Schema
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
