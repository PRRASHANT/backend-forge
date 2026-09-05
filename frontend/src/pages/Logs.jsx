import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function Logs() {
  const { project } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/projects/${project._id}/logs?page=${pageNum}&limit=50`);
      setLogs(res.data.data.logs || []);
      setHasMore(res.data.data.pagination?.page < res.data.data.pagination?.pages);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [project._id]);

  const getMethodColor = (method) => {
    switch(method) {
      case 'GET': return 'success';
      case 'POST': return 'warning';
      case 'PATCH': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-emerald-500';
    if (status >= 400 && status < 500) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Request Logs</h2>
        <p className="text-muted-foreground text-sm">View real-time Runtime API requests.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-zinc-950/50 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Path</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No runtime requests found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-3">
                        <Badge variant={getMethodColor(log.method)} className="w-16 justify-center text-[10px]">
                          {log.method}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 font-mono text-muted-foreground text-xs">{log.path}</td>
                      <td className={`px-6 py-3 font-mono text-xs ${getStatusColor(log.status)}`}>
                        {log.status}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground text-xs font-mono">{log.duration}ms</td>
                      <td className="px-6 py-3 text-muted-foreground text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-4 border-t border-zinc-800 flex justify-center">
              <Button variant="outline" onClick={() => fetchLogs(page + 1)} disabled={loading}>
                Load Next 50
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
