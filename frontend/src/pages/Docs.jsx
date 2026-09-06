import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Book, Code, Key, Database, Activity, BarChart3, Users, AlertTriangle, ArrowRight, Menu, X, Terminal } from 'lucide-react';

// Dummy Blocks icon since we missed importing it initially
const Blocks = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
);

export default function Docs() {
  const logoPath = (localStorage.getItem('bf_token') && localStorage.getItem('bf_token') !== 'undefined') ? '/dashboard' : '/';
  const [activeSection, setActiveSection] = useState('getting-started');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Book },
    { id: 'projects', title: 'Projects', icon: Blocks },
    { id: 'collections', title: 'Collections & Schemas', icon: Database },
    { id: 'api-keys', title: 'API Keys', icon: Key },
    { id: 'runtime-api', title: 'Runtime REST API', icon: Code },
    { id: 'api-explorer', title: 'API Explorer', icon: Terminal },
    { id: 'logs-analytics', title: 'Logs & Analytics', icon: BarChart3 },
    { id: 'team-access', title: 'Team Access / RBAC', icon: Users },
    { id: 'error-responses', title: 'Error Responses', icon: AlertTriangle },
  ];

  // Helper for scrolling
  const scrollTo = (id) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Setup intersection observer for scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );
    
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, [sections]);


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 font-sans">
      
      {/* PUBLIC NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to={logoPath} className="flex items-center gap-3">
              <img src="/backend-forge-logo.svg" alt="Backend Forge" className="w-7 h-7" />
              <span className="font-extrabold tracking-tight text-zinc-100 hidden sm:block">BACKEND FORGE</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 ml-4">
              DOCS
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">Home</Link>
            <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign In</Link>
            <Button asChild className="shadow-sm font-medium">
              <Link to="/dashboard">Open Console</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 flex items-start gap-12 pt-8 pb-24 relative">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 pb-12">
          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon || Activity;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 text-left ${
                    isActive 
                      ? 'bg-zinc-800/60 text-zinc-100 font-medium shadow-sm border border-zinc-700/50' 
                      : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : ''}`} />
                  {section.title}
                </button>
              );
            })}
          </div>
        </aside>

        {/* MOBILE SIDEBAR (Overlay) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-40 bg-zinc-950 border-t border-zinc-900 md:hidden overflow-y-auto px-6 py-8">
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon || Activity;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className="w-full flex items-center gap-3 rounded-md px-4 py-3 text-base text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 text-left border border-zinc-800"
                  >
                    <Icon className="h-5 w-5 text-indigo-400" />
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 pb-32">
          <div className="prose prose-invert prose-zinc max-w-none prose-headings:tracking-tight prose-a:text-indigo-400">
            
            {/* 1. GETTING STARTED */}
            <section id="getting-started" className="scroll-mt-28 mb-20">
              <h1 className="text-4xl font-extrabold mb-6">Getting Started</h1>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Backend Forge provides a fully hosted, zero-configuration backend environment. The typical workflow allows you to transition from idea to production-ready APIs in minutes.
              </p>
              
              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 shadow-sm mb-8">
                <ol className="list-decimal list-inside space-y-4 text-zinc-300 font-medium">
                  <li><strong className="text-zinc-100">Create an account</strong> via the public console.</li>
                  <li><strong className="text-zinc-100">Create a backend project</strong> to serve as your workspace.</li>
                  <li><strong className="text-zinc-100">Create a collection</strong> to represent a data entity.</li>
                  <li><strong className="text-zinc-100">Define schema fields</strong> (e.g. string, number, boolean).</li>
                  <li><strong className="text-zinc-100">Generate an API key</strong> for authentication.</li>
                  <li><strong className="text-zinc-100">Call the Runtime API</strong> from your frontend client.</li>
                  <li><strong className="text-zinc-100">Inspect logs and analytics</strong> to monitor live usage.</li>
                </ol>
              </div>
            </section>

            {/* 2. PROJECTS */}
            <section id="projects" className="scroll-mt-28 mb-20 pt-8 border-t border-zinc-800/50">
              <h2 className="text-3xl font-bold mb-6">Projects</h2>
              <p className="text-zinc-300 mb-4 leading-relaxed">
                A <strong>Project</strong> is an isolated Backend Forge backend workspace. Every resource belongs to a specific project.
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400 mb-6">
                <li><strong className="text-zinc-200">Collections:</strong> The data models defining your backend.</li>
                <li><strong className="text-zinc-200">API Keys:</strong> Secure credentials used to access the project's runtime APIs.</li>
                <li><strong className="text-zinc-200">Runtime APIs:</strong> Instant, RESTful endpoints automatically exposed.</li>
                <li><strong className="text-zinc-200">Logs & Analytics:</strong> Project-scoped monitoring and request history.</li>
                <li><strong className="text-zinc-200">Members:</strong> Users granted access via Role-Based Access Control.</li>
              </ul>
            </section>

            {/* 3. COLLECTIONS & SCHEMAS */}
            <section id="collections" className="scroll-mt-28 mb-20 pt-8 border-t border-zinc-800/50">
              <h2 className="text-3xl font-bold mb-6">Collections & Schemas</h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Collections define runtime data models. By defining a schema, you instruct Backend Forge on how to validate incoming data and structure outgoing responses. Backend Forge dynamically applies schema validation and handles runtime models—no physical code-generation files are created.
              </p>
              
              <h3 className="text-xl font-bold mb-4 mt-8">Example Schema: <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded text-lg">products</span></h3>
              <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 mb-6">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-900 border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-zinc-300">Field Name</th>
                      <th className="px-4 py-3 font-semibold text-zinc-300">Type</th>
                      <th className="px-4 py-3 font-semibold text-zinc-300">Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-400 font-mono">
                    <tr>
                      <td className="px-4 py-3 text-sky-400">name</td>
                      <td className="px-4 py-3">string</td>
                      <td className="px-4 py-3 text-rose-400">required</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sky-400">price</td>
                      <td className="px-4 py-3">number</td>
                      <td className="px-4 py-3 text-rose-400">required</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sky-400">description</td>
                      <td className="px-4 py-3">string</td>
                      <td className="px-4 py-3 text-zinc-500">optional</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sky-400">inStock</td>
                      <td className="px-4 py-3">boolean</td>
                      <td className="px-4 py-3 text-rose-400">required</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. API KEYS */}
            <section id="api-keys" className="scroll-mt-28 mb-20 pt-8 border-t border-zinc-800/50">
              <h2 className="text-3xl font-bold mb-6">API Keys</h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Runtime APIs require project-specific API keys for authentication. Keys are passed via the standard HTTP header.
              </p>
              
              <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950 mb-6 font-mono text-sm">
                <span className="text-indigo-400">X-API-Key:</span> <span className="text-zinc-300">bf_sk_••••••••</span>
              </div>
              
              <ul className="list-disc list-inside space-y-2 text-zinc-400">
                <li>Keys are generated directly from the project console.</li>
                <li>The full secret key is only shown <strong>once</strong> upon creation.</li>
                <li>Keys can be revoked at any time by a project admin or owner.</li>
                <li>Revoked or invalid keys are immediately rejected by the runtime API.</li>
              </ul>
            </section>

            {/* 5. RUNTIME REST API */}
            <section id="runtime-api" className="scroll-mt-28 mb-20 pt-8 border-t border-zinc-800/50">
              <h2 className="text-3xl font-bold mb-6">Runtime REST API</h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Backend Forge exposes strict, predictable REST endpoints dynamically based on your schema. Notably, document updates are handled via <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">PATCH</code> rather than <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">PUT</code>.
              </p>
              
              <h3 className="text-xl font-bold mb-4">Endpoints</h3>
              <div className="space-y-3 font-mono text-sm mb-10">
                <div className="flex gap-4 p-3 rounded-md bg-zinc-900 border border-zinc-800"><span className="text-emerald-400 font-bold w-16">POST</span> <span className="text-zinc-300">/api/v1/{"{projectId}"}/{"{collection}"}</span></div>
                <div className="flex gap-4 p-3 rounded-md bg-zinc-900 border border-zinc-800"><span className="text-sky-400 font-bold w-16">GET</span> <span className="text-zinc-300">/api/v1/{"{projectId}"}/{"{collection}"}</span></div>
                <div className="flex gap-4 p-3 rounded-md bg-zinc-900 border border-zinc-800"><span className="text-sky-400 font-bold w-16">GET</span> <span className="text-zinc-300">/api/v1/{"{projectId}"}/{"{collection}"}/{"{documentId}"}</span></div>
                <div className="flex gap-4 p-3 rounded-md bg-zinc-900 border border-zinc-800"><span className="text-amber-400 font-bold w-16">PATCH</span> <span className="text-zinc-300">/api/v1/{"{projectId}"}/{"{collection}"}/{"{documentId}"}</span></div>
                <div className="flex gap-4 p-3 rounded-md bg-zinc-900 border border-zinc-800"><span className="text-rose-400 font-bold w-16">DELETE</span> <span className="text-zinc-300">/api/v1/{"{projectId}"}/{"{collection}"}/{"{documentId}"}</span></div>
              </div>

              <h3 className="text-xl font-bold mb-4">Example Request</h3>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm mb-6">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-500">Request</div>
                <div className="p-5 font-mono text-sm leading-relaxed text-zinc-300 overflow-x-auto">
                  <span className="text-emerald-400 font-bold">POST</span> /api/v1/proj_abc123/products<br/><br/>
                  <span className="text-zinc-500">Headers:</span><br/>
                  X-API-Key: bf_sk_••••••••<br/>
                  Content-Type: application/json<br/><br/>
                  <span className="text-zinc-500">Body:</span><br/>
                  {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"name"</span>: <span className="text-amber-300">"Wireless Mouse"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"price"</span>: <span className="text-emerald-300">899</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"description"</span>: <span className="text-amber-300">"Bluetooth wireless mouse"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"inStock"</span>: <span className="text-rose-300">true</span><br/>
                  {"}"}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4 mt-8">Example Response</h3>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between text-xs font-mono text-zinc-500">
                  <span>Response</span>
                  <span className="text-emerald-400">201 Created</span>
                </div>
                <div className="p-5 font-mono text-sm leading-relaxed text-zinc-300 overflow-x-auto">
                  {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"success"</span>: <span className="text-rose-300">true</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"data"</span>: {"{"}<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"_id"</span>: <span className="text-amber-300">"65a123f87b..."</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"name"</span>: <span className="text-amber-300">"Wireless Mouse"</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"price"</span>: <span className="text-emerald-300">899</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"description"</span>: <span className="text-amber-300">"Bluetooth wireless mouse"</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"inStock"</span>: <span className="text-rose-300">true</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"createdAt"</span>: <span className="text-amber-300">"2026-09-06T12:00:00.000Z"</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"updatedAt"</span>: <span className="text-amber-300">"2026-09-06T12:00:00.000Z"</span><br/>
                  &nbsp;&nbsp;{"}"}<br/>
                  {"}"}
                </div>
              </div>
            </section>

            {/* 6. API EXPLORER */}
            <section id="api-explorer" className="scroll-mt-28 mb-20 pt-8 border-t border-zinc-800/50">
              <h2 className="text-3xl font-bold mb-6">API Explorer</h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                The built-in API Explorer allows developers to test runtime endpoints directly from the console without writing external curl scripts or using a third-party REST client.
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400 mb-6">
                <li><strong className="text-zinc-200">Method Selection:</strong> Easily select GET, POST, PATCH, or DELETE.</li>
                <li><strong className="text-zinc-200">Collection Selection:</strong> Dropdown to target the correct schema.</li>
                <li><strong className="text-zinc-200">API Key:</strong> Tests run against your generated keys.</li>
                <li><strong className="text-zinc-200">Request Body:</strong> Integrated JSON editor for payload configuration.</li>
                <li><strong className="text-zinc-200">Response / Status:</strong> Clear visualization of the JSON output and status codes.</li>
              </ul>
            </section>

            {/* 7. LOGS & ANALYTICS */}
            <section id="logs-analytics" className="scroll-mt-28 mb-20 pt-8 border-t border-zinc-800/50">
              <h2 className="text-3xl font-bold mb-6">Logs & Analytics</h2>
              
              <h3 className="text-xl font-bold mb-4 mt-8">Logs</h3>
              <p className="text-zinc-400 mb-4">Runtime API requests are logged for auditing and debugging. The logs capture:</p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400 mb-8 ml-4">
                <li>HTTP method</li>
                <li>Request path</li>
                <li>Status code</li>
                <li>Duration (latency)</li>
                <li>Timestamp</li>
              </ul>

              <h3 className="text-xl font-bold mb-4">Analytics</h3>
              <p className="text-zinc-400 mb-4">The analytics dashboard aggregates log data to provide project insights:</p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400 mb-6 ml-4">
                <li>Total requests</li>
                <li>Success rate</li>
                <li>Error rate</li>
                <li>Average response time</li>
                <li>Requests by method</li>
                <li>Requests by collection</li>
              </ul>
            </section>

            {/* 8. TEAM ACCESS / RBAC */}
            <section id="team-access" className="scroll-mt-28 mb-20 pt-8 border-t border-zinc-800/50">
              <h2 className="text-3xl font-bold mb-6">Team Access / RBAC</h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Backend Forge applies strict Role-Based Access Control (RBAC) to project workspaces.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                  <h4 className="font-bold text-zinc-200 mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Owner
                  </h4>
                  <p className="text-sm text-zinc-400">Full control. Can delete the project.</p>
                </div>
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                  <h4 className="font-bold text-zinc-200 mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Admin
                  </h4>
                  <p className="text-sm text-zinc-400">Manage members, API keys, collections, and view all data.</p>
                </div>
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                  <h4 className="font-bold text-zinc-200 mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> Developer
                  </h4>
                  <p className="text-sm text-zinc-400">Manage collections and use the API Explorer.</p>
                </div>
                <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                  <h4 className="font-bold text-zinc-200 mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-500"></span> Viewer
                  </h4>
                  <p className="text-sm text-zinc-400">Strictly read-only access. Can view project data, logs, and analytics.</p>
                </div>
              </div>
            </section>

            {/* 9. ERROR RESPONSES */}
            <section id="error-responses" className="scroll-mt-28 mb-10 pt-8 border-t border-zinc-800/50">
              <h2 className="text-3xl font-bold mb-6">Error Responses</h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                Errors always return a consistent JSON payload structure, allowing clients to cleanly handle exceptions.
              </p>

              <h3 className="text-xl font-bold mb-4 mt-8">401 Unauthorized</h3>
              <div className="rounded-xl border border-rose-900/50 bg-zinc-950 overflow-hidden shadow-sm mb-6">
                <div className="px-4 py-2 border-b border-rose-900/50 bg-rose-500/5 text-xs font-mono text-zinc-500">Invalid API key</div>
                <div className="p-5 font-mono text-sm leading-relaxed text-zinc-300 overflow-x-auto">
                  {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"success"</span>: <span className="text-rose-300">false</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"error"</span>: {"{"}<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"message"</span>: <span className="text-amber-300">"Invalid API key."</span><br/>
                  &nbsp;&nbsp;{"}"}<br/>
                  {"}"}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4 mt-8">404 Not Found</h3>
              <div className="rounded-xl border border-amber-900/50 bg-zinc-950 overflow-hidden shadow-sm mb-6">
                <div className="px-4 py-2 border-b border-amber-900/50 bg-amber-500/5 text-xs font-mono text-zinc-500">Document not found</div>
                <div className="p-5 font-mono text-sm leading-relaxed text-zinc-300 overflow-x-auto">
                  {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"success"</span>: <span className="text-rose-300">false</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"error"</span>: {"{"}<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"message"</span>: <span className="text-amber-300">"Document not found"</span><br/>
                  &nbsp;&nbsp;{"}"}<br/>
                  {"}"}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4 mt-8">422 Unprocessable Entity</h3>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm mb-6">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-500">Validation failure</div>
                <div className="p-5 font-mono text-sm leading-relaxed text-zinc-300 overflow-x-auto">
                  {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"success"</span>: <span className="text-rose-300">false</span>,<br/>
                  &nbsp;&nbsp;<span className="text-sky-300">"error"</span>: {"{"}<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"message"</span>: <span className="text-amber-300">"Validation failed: Field 'price' is required"</span><br/>
                  &nbsp;&nbsp;{"}"}<br/>
                  {"}"}
                </div>
              </div>

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
