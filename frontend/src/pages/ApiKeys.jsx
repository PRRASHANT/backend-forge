import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Key, Plus, Trash2, Copy, Check } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export default function ApiKeys() {
  const { project, role } = useOutletContext();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  // Result state
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    if (role === 'viewer') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${project._id}/api-keys`);
      setApiKeys(res.data.data.apiKeys || []);
    } catch (err) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [project._id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await apiClient.post(`/projects/${project._id}/api-keys`, { name: newKeyName });
      setGeneratedKey(res.data.data.apiKey.rawKey);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId) => {
    if (!window.confirm('Are you sure you want to revoke this API key? Systems using it will immediately lose access.')) return;
    try {
      await apiClient.patch(`/projects/${project._id}/api-keys/${keyId}/revoke`);
      toast.success('API key revoked');
      fetchKeys();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to revoke API key');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeGeneratedModal = () => {
    setGeneratedKey(null);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground text-sm">Manage runtime access keys for your applications.</p>
        </div>
        {role !== 'viewer' && role !== 'developer' && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Key
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {role === 'viewer' ? (
            <div className="py-12 text-center text-muted-foreground">
              API key management is available to project owners.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-zinc-950/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Prefix</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    {role !== 'developer' && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading keys...</td>
                    </tr>
                  ) : apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No API keys generated yet.
                      </td>
                    </tr>
                  ) : (
                    apiKeys.map((k) => (
                      <tr key={k._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{k.name}</td>
                        <td className="px-6 py-4 font-mono text-muted-foreground">{k.prefix}...</td>
                        <td className="px-6 py-4">
                          {k.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Revoked</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </td>
                        {role !== 'developer' && (
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRevoke(k._id)}
                              disabled={!k.isActive}
                            >
                              Revoke
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Key Modal */}
      <Modal isOpen={isCreateOpen && !generatedKey} onClose={() => setIsCreateOpen(false)} title="Generate API Key">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Key Name</label>
            <Input 
              id="name" 
              placeholder="e.g. Production Web App" 
              value={newKeyName} 
              onChange={(e) => setNewKeyName(e.target.value)} 
              required
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This key provides full CRUD access to this project's runtime data. Keep it secure.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Generating...' : 'Generate'}</Button>
          </div>
        </form>
      </Modal>

      {/* Show Generated Key Modal */}
      <Modal isOpen={!!generatedKey} onClose={closeGeneratedModal} title="API Key Generated">
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-md text-sm">
            <p className="font-semibold mb-1">Copy this key now.</p>
            <p>For security reasons, Backend Forge will not show the full secret again. If you lose it, you must revoke it and generate a new one.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Input 
              readOnly
              value={generatedKey || ''}
              className="font-mono bg-zinc-950"
            />
            <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={closeGeneratedModal}>I have copied the key</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
