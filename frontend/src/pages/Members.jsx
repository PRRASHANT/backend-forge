import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { UserPlus, User } from 'lucide-react';

export default function Members() {
  const { project, role: currentUserRole } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${project._id}/members`);
      setMembers(res.data.data.members || []);
    } catch (err) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [project._id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await apiClient.post(`/projects/${project._id}/members`, { email, role });
      toast.success('Member added successfully');
      setIsInviteOpen(false);
      setEmail('');
      setRole('viewer');
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to add member');
    } finally {
      setInviting(false);
    }
  };

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground text-sm">Manage team access and RBAC roles.</p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-zinc-950/50 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Loading members...</td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                      No members found.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.user._id || m.user} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-muted-foreground">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{m.user.name || 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">{m.user.email || m.user}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          m.role === 'owner' ? 'destructive' :
                          m.role === 'admin' ? 'warning' :
                          m.role === 'developer' ? 'default' : 'secondary'
                        } className="uppercase text-[10px]">
                          {m.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(m.joinedAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Add Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">User Email</label>
            <Input 
              id="email" 
              type="email"
              placeholder="user@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="role">Role</label>
            <select 
              id="role"
              className="flex h-9 w-full rounded-md border border-input bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="developer">Developer (Manage Collections & APIs)</option>
              <option value="admin">Admin (Manage Members & Settings)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={inviting}>{inviting ? 'Adding...' : 'Add Member'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
