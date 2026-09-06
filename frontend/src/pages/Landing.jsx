import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, Database, Code, Key, Activity, BarChart3, Users, Zap, Shield, Blocks, Terminal } from 'lucide-react';

export default function Landing() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      
      {/* PUBLIC NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img src="/backend-forge-logo.svg" alt="Backend Forge" className="w-7 h-7" />
              <span className="font-extrabold tracking-tight text-zinc-100">BACKEND FORGE</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <button onClick={() => scrollToSection('features')} className="hover:text-zinc-100 transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-zinc-100 transition-colors">How It Works</button>
              <Link to="/docs" className="hover:text-zinc-100 transition-colors">Docs</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign In</Link>
            <Button asChild className="bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm font-medium">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-start overflow-x-clip bg-zinc-950 pt-4 lg:pt-4 pb-16 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />
        
        {/* Subtle shared background field to connect left and right visually */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between lg:gap-x-12 xl:gap-x-24 w-full mt-0">

          {/* Left Hero Content */}
          <div className="w-full lg:w-[42%] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-20 py-8 lg:py-0">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 tracking-wide uppercase">
              Backend-as-a-Service
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              Build backends <br className="hidden lg:block" />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">without rebuilding</span> <br className="hidden lg:block" />
              the basics.
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-[480px]">
              Define your data model, expose secure REST APIs, manage API keys, test endpoints, and monitor usage — all from one platform.
            </p>
            
            {/* Supporting Value Rows */}
            <div className="flex flex-col gap-6 py-2">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20 text-indigo-400 shrink-0 shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-zinc-200 font-semibold text-sm">Dynamic Schemas</h3>
                  <p className="text-zinc-400 text-sm mt-0.5 leading-relaxed">Define collections and validation rules instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0 shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-zinc-200 font-semibold text-sm">Instant APIs</h3>
                  <p className="text-zinc-400 text-sm mt-0.5 leading-relaxed">Get production-ready CRUD endpoints.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 text-rose-400 shrink-0 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-zinc-200 font-semibold text-sm">Secure by Default</h3>
                  <p className="text-zinc-400 text-sm mt-0.5 leading-relaxed">API keys, authentication, and granular RBAC.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild size="lg" className="shadow-lg font-semibold px-0 bg-white hover:bg-zinc-100 text-black border-0">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 w-full h-full px-8">
                  Start Building <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-white font-medium">
                <Link to="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
          
          {/* Hero Composite Visual */}
          <div className="w-full lg:w-[60%] xl:w-[850px] relative animate-in fade-in zoom-in-95 duration-1000 delay-150 fill-mode-both mt-12 lg:mt-0 lg:-mr-20 xl:-mr-48">
            {/* Ambient Backlight */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Main Application Window */}
            <div className="relative rounded-2xl border border-zinc-800/80 bg-[#0a0a0a]/90 backdrop-blur-xl shadow-2xl shadow-black/80 w-full mx-auto overflow-hidden flex flex-col h-[500px] lg:h-[580px]">
              
              {/* Window Header */}
              <div className="h-12 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center px-4 justify-between shrink-0">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] font-medium text-zinc-500 tracking-widest uppercase">Backend Forge Console</div>
                <div className="w-10" />
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Fake Sidebar */}
                <div className="w-16 md:w-56 lg:w-64 border-r border-zinc-800/50 bg-zinc-900/20 p-3 lg:p-4 flex-col gap-1.5 shrink-0 hidden sm:flex">
                  <div className="h-8 rounded bg-zinc-800/50 w-full mb-3" />
                  <div className="rounded bg-indigo-500/10 text-indigo-400 text-[13px] flex items-center px-3 py-2 font-medium border border-indigo-500/20 shadow-sm cursor-default">
                    <Terminal className="w-4 h-4 mr-2.5" /> API Explorer
                  </div>
                  <div className="rounded hover:bg-zinc-800/30 text-zinc-500 text-[13px] flex items-center px-3 py-2 transition-colors cursor-default">
                    <Database className="w-4 h-4 mr-2.5" /> Data Collections
                  </div>
                  <div className="rounded hover:bg-zinc-800/30 text-zinc-500 text-[13px] flex items-center px-3 py-2 transition-colors cursor-default">
                    <Key className="w-4 h-4 mr-2.5" /> API Keys
                  </div>
                  <div className="rounded hover:bg-zinc-800/30 text-zinc-500 text-[13px] flex items-center px-3 py-2 transition-colors cursor-default">
                    <Activity className="w-4 h-4 mr-2.5" /> Logs
                  </div>
                  <div className="rounded hover:bg-zinc-800/30 text-zinc-500 text-[13px] flex items-center px-3 py-2 transition-colors cursor-default">
                    <Blocks className="w-4 h-4 mr-2.5" /> Settings
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-5 md:p-8 lg:p-10 relative bg-[#060606]">
                  {/* API Request Panel */}
                  <div className="w-full relative z-10 mx-auto lg:mx-0">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] lg:text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">POST</span>
                        <span className="text-[13px] lg:text-[14px] font-mono text-zinc-300">/api/v1/proj_9x8.../products</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 text-xs lg:text-[13px] font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded cursor-default border border-indigo-500/20">
                        JSON <span className="text-[10px] ml-1">▼</span>
                      </div>
                    </div>
                    
                    <div className="font-mono text-[13px] lg:text-[14px] leading-relaxed text-zinc-400 mb-8">
                      <div className="mb-2 lg:mb-3 text-zinc-500 text-[11px] lg:text-xs uppercase tracking-wider">Headers</div>
                      <div className="pl-4 border-l-2 border-zinc-800 mb-6 lg:mb-8">
                        <span className="text-indigo-400">X-API-Key:</span> bf_sk_••••••••<br/>
                        <span className="text-indigo-400">Content-Type:</span> application/json
                      </div>
                      
                      <div className="mb-2 lg:mb-3 text-zinc-500 text-[11px] lg:text-xs uppercase tracking-wider">Request Body</div>
                      <div className="pl-4 border-l-2 border-zinc-800 text-zinc-300 mb-8">
                        <span className="text-zinc-500">{"{"}</span><br/>
                        &nbsp;&nbsp;<span className="text-sky-300">"name"</span>: <span className="text-amber-300">"Wireless Mouse"</span>,<br/>
                        &nbsp;&nbsp;<span className="text-sky-300">"price"</span>: <span className="text-emerald-300">899</span>,<br/>
                        &nbsp;&nbsp;<span className="text-sky-300">"inStock"</span>: <span className="text-rose-300">true</span><br/>
                        <span className="text-zinc-500">{"}"}</span>
                      </div>
                      
                      <button className="hidden sm:flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] lg:text-[14px] font-semibold px-6 py-2 rounded-md transition-colors shadow-sm cursor-default">
                        Send Request
                      </button>
                    </div>
                  </div>
                  
                  {/* Floating Response Panel */}
                  <div className="absolute bottom-6 right-6 lg:bottom-12 lg:-right-10 rounded-xl border border-emerald-500/20 bg-[#0a0a0a] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] shadow-emerald-900/20 w-[270px] md:w-[340px] lg:w-[380px] animate-in slide-in-from-right-8 fade-in duration-1000 delay-[600ms] fill-mode-both z-20">
                    <div className="px-4 py-2 border-b border-zinc-800/80 bg-emerald-500/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[11px] font-mono text-emerald-400 font-bold tracking-wide">201 CREATED</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 hidden sm:block">12ms</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50 bg-[#060606]">
                      <span className="text-zinc-300 relative">Response<div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-zinc-300" /></span>
                      <span className="hover:text-zinc-400 cursor-default">Headers</span>
                      <span className="hover:text-zinc-400 cursor-default">Logs</span>
                    </div>
                    <div className="p-4 font-mono text-[12px] leading-relaxed text-zinc-300">
                      <span className="text-zinc-500">{"{"}</span><br/>
                      &nbsp;&nbsp;<span className="text-sky-300">"id"</span>: <span className="text-amber-300">"doc_1a2b"</span>,<br/>
                      &nbsp;&nbsp;<span className="text-sky-300">"status"</span>: <span className="text-emerald-300">"success"</span><br/>
                      <span className="text-zinc-500">{"}"}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Build Deploy Scale Pipeline Animation */}
            <div className="mt-32 flex items-center justify-between w-full px-2 lg:px-4 text-lg lg:text-xl font-mono font-bold tracking-[0.2em] uppercase opacity-90 animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] motion-safe:animate-pulse" />
                <span className="text-indigo-400">BUILD</span>
              </div>
              <div className="flex-1 h-[2px] lg:h-[3px] bg-indigo-500/50 rounded-full motion-safe:animate-pulse mx-4 lg:mx-6" />
              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] motion-safe:animate-pulse" />
                <span className="text-emerald-400">DEPLOY</span>
              </div>
              <div className="flex-1 h-[2px] lg:h-[3px] bg-emerald-500/50 rounded-full motion-safe:animate-pulse mx-4 lg:mx-6" />
              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)] motion-safe:animate-pulse" />
                <span className="text-violet-400">SCALE</span>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* WHY BACKEND FORGE (Combined What & Why) */}
      <section className="py-24 bg-zinc-950 border-t border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">What is Backend Forge?</h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Backend Forge is a hosted Backend-as-a-Service that allows developers to define collections and schemas and immediately access runtime CRUD APIs without repeatedly writing boilerplate backend code.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Without */}
            <div className="p-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <span className="font-bold text-xl">✕</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-300">Without Backend Forge</h3>
              </div>
              <p className="text-zinc-500 mb-6">Writing the same boilerplate for every new project:</p>
              <ul className="space-y-4">
                {['Writing CRUD controllers from scratch', 'Manually configuring routing', 'Building custom schema validation layers', 'Implementing API authentication middleware', 'Setting up request logging systems'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-400">
                    <span className="text-rose-500/70 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* With */}
            <div className="p-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <span className="font-bold text-xl">✓</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100">With Backend Forge</h3>
                </div>
                <p className="text-zinc-300 mb-6">A proven, reusable platform handling the infrastructure:</p>
                <ul className="space-y-4">
                  {['Define collections and strict schemas', 'Instant runtime CRUD APIs automatically', 'Secure project-specific API keys', 'Built-in API Explorer and Request Logs', 'Granular team access and RBAC'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300">
                      <span className="text-indigo-400 mt-1">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-zinc-900/20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">Everything you need to scale</h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">Production-ready features built into every project by default.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2">Dynamic Schemas</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Define collections and field validation rules. Your database adapts instantly.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2">Instant REST APIs</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Runtime CRUD endpoints are generated and available immediately from your schema.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2">API Key Auth</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Secure project runtime APIs with zero-config, project-specific keys.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2">API Explorer</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Test generated endpoints directly from the console before writing client code.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2">Request Logs</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Inspect runtime API requests, methods, status codes, and exact latency.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2">Analytics</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Monitor request volume, success rates, errors, and average response times.</p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900 transition-colors md:col-span-2 lg:col-span-3 lg:w-1/3 mx-auto">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-2">Team Access / RBAC</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Manage project members securely with granular, role-based permissions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">How it works</h2>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">From idea to production API in minutes.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Create a Project", desc: "Initialize a secure workspace for your backend." },
              { num: "02", title: "Define a Collection", desc: "Name your entity (e.g. Products, Users, Posts)." },
              { num: "03", title: "Configure Schema", desc: "Add fields and strong data validation rules." },
              { num: "04", title: "Generate an API Key", desc: "Create a secure token for client access." },
              { num: "05", title: "Call REST API", desc: "Consume your instant CRUD endpoints." },
              { num: "06", title: "Monitor Logs", desc: "Watch traffic and performance in real-time." }
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-3xl font-black text-zinc-800">{step.num}</div>
                <div>
                  <h4 className="text-base font-bold text-zinc-200 mb-1">{step.title}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API DEMONSTRATION */}
      <section className="py-24 bg-zinc-900/20 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Instant, predictable responses.</h2>
            <p className="text-zinc-400 leading-relaxed">
              Every collection automatically exposes standard REST verbs (GET, POST, PATCH, DELETE). Data is validated against your schema before saving, guaranteeing data integrity without writing a single line of server-side validation.
            </p>
          </div>
          
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
            <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center text-xs font-mono text-zinc-500">
              <span>Response: 201 Created</span>
              <span>12ms</span>
            </div>
            <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto text-zinc-300">
              <span className="text-zinc-500">{"{"}</span><br/>
              &nbsp;&nbsp;<span className="text-sky-300">"status"</span>: <span className="text-emerald-300">"success"</span>,<br/>
              &nbsp;&nbsp;<span className="text-sky-300">"data"</span>: <span className="text-zinc-500">{"{"}</span><br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"_id"</span>: <span className="text-amber-300">"doc_82js93ndk29"</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"name"</span>: <span className="text-amber-300">"Wireless Mouse"</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"price"</span>: <span className="text-emerald-300">899</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"inStock"</span>: <span className="text-rose-300">true</span>,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">"createdAt"</span>: <span className="text-amber-300">"2026-09-06T12:00:00Z"</span><br/>
              &nbsp;&nbsp;<span className="text-zinc-500">{"}"}</span><br/>
              <span className="text-zinc-500">{"}"}</span>
            </div>
          </div>
        </div>
      </section>


      {/* FINAL CTA */}
      <section className="py-32 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Ready to build your backend?</h2>
          <p className="text-xl text-zinc-400">
            Create a project, define your schema, and start calling your API today.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm font-semibold h-12 px-8">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <img src="/backend-forge-logo.svg" alt="Backend Forge" className="w-6 h-6 grayscale opacity-50" />
              <div>
                <div className="font-bold text-zinc-300 text-sm tracking-tight">BACKEND FORGE</div>
                <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest mt-0.5">Build. Deploy. Scale.</div>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500 font-medium">
              <button onClick={() => scrollToSection('features')} className="hover:text-zinc-300 transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-zinc-300 transition-colors">How It Works</button>
              <Link to="/docs" className="hover:text-zinc-300 transition-colors">Docs</Link>
              <Link to="/login" className="hover:text-zinc-300 transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-zinc-900/50 text-xs text-zinc-600">
            <div>&copy; {new Date().getFullYear()} Backend Forge. All rights reserved.</div>
            <div>Built by Prashant</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
