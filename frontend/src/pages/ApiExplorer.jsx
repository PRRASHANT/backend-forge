import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { Play, Key } from 'lucide-react';

export default function ApiExplorer() {
  const { project } = useOutletContext();
  const [collections, setCollections] = useState([]);
  
  // Runtime API state
  const [method, setMethod] = useState('GET');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [recordId, setRecordId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [reqBody, setReqBody] = useState('{\n  \n}');
  
  // Response state
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    // Load collections for selector
    apiClient.get(`/projects/${project._id}/collections`)
      .then(res => {
        setCollections(res.data.data.collections || []);
        if (res.data.data.collections?.length > 0) {
          setSelectedCollection(res.data.data.collections[0].slug);
        }
      })
      .catch(console.error);
      
    // Try to restore an api key from memory (if user just generated one, though we didn't persist it. Let's just rely on them pasting it)
  }, [project._id]);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const runtimeUrl = `${baseUrl.replace('/api', '')}/api/v1/${project._id}/${selectedCollection}`;
  const fullUrl = recordId ? `${runtimeUrl}/${recordId}` : runtimeUrl;

  const handleSend = async () => {
    if (!apiKey) {
      toast.error('Please provide an API Key');
      return;
    }

    let parsedBody = undefined;
    if (method === 'POST' || method === 'PATCH') {
      try {
        parsedBody = reqBody ? JSON.parse(reqBody) : {};
      } catch (e) {
        toast.error('Invalid JSON in Request Body');
        return;
      }
    }

    setLoading(true);
    setResponse(null);
    setStatus(null);
    
    const startTime = performance.now();
    try {
      const res = await axios({
        method,
        url: fullUrl,
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        data: parsedBody
      });
      setStatus(res.status);
      setResponse(res.data);
    } catch (err) {
      setStatus(err.response?.status || 0);
      setResponse(err.response?.data || err.message);
    } finally {
      setTime(Math.round(performance.now() - startTime));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Explorer</h2>
        <p className="text-muted-foreground text-sm">Test your runtime APIs directly from the dashboard.</p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        
        {/* LEFT PANEL - Setup */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Key className="h-3 w-3" /> X-API-Key Header
                </label>
                <Input 
                  type="password"
                  placeholder="bf_sk_..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Request Setup</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Method</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Collection</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    value={selectedCollection}
                    onChange={e => setSelectedCollection(e.target.value)}
                  >
                    {collections.map(c => <option key={c._id} value={c.slug}>{c.name} (/{c.slug})</option>)}
                  </select>
                </div>
              </div>

              {(method === 'PATCH' || method === 'DELETE' || method === 'GET') && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Record ID {method === 'GET' ? '(Optional)' : '(Required)'}
                  </label>
                  <Input 
                    placeholder="Document ID (e.g. 64b...)"
                    value={recordId}
                    onChange={e => setRecordId(e.target.value)}
                    className="font-mono text-sm h-9"
                  />
                </div>
              )}

              {(method === 'POST' || method === 'PATCH') && (
                <div className="space-y-1 flex-1 flex flex-col min-h-[150px]">
                  <label className="text-xs font-medium text-muted-foreground">Request Body (JSON)</label>
                  <textarea 
                    className="flex-1 w-full rounded-md border border-input bg-zinc-950 px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    value={reqBody}
                    onChange={e => setReqBody(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL - Execution & Response */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <Badge variant={
                method === 'GET' ? 'success' : 
                method === 'POST' ? 'warning' : 
                method === 'PATCH' ? 'secondary' : 'destructive'
              } className="text-xs px-2 rounded-sm shrink-0">
                {method}
              </Badge>
              <div className="text-sm font-mono truncate text-muted-foreground flex-1 overflow-x-auto whitespace-nowrap">
                {fullUrl}
              </div>
              <Button onClick={handleSend} disabled={loading} className="shrink-0 gap-2 w-24">
                {loading ? '...' : <><Play className="h-4 w-4" /> Send</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-800 bg-zinc-950/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Response</CardTitle>
              {status && (
                <div className="flex items-center gap-3 text-xs">
                  <span className={`font-mono ${status >= 200 && status < 300 ? 'text-emerald-500' : 'text-destructive'}`}>
                    Status: {status}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    Time: {time}ms
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-auto bg-[#0d0d0d]">
              {response ? (
                <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Send a request to view the response.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
