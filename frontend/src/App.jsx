import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Docs from './pages/Docs';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectWorkspaceLayout from './layouts/ProjectWorkspaceLayout';
import ProjectOverview from './pages/ProjectOverview';
import Collections from './pages/Collections';
import ApiKeys from './pages/ApiKeys';
import ApiExplorer from './pages/ApiExplorer';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';
import Members from './pages/Members';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="dark min-h-screen bg-background text-foreground font-sans">
        <Toaster position="top-right" />
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            
            {/* Project Workspace Routes */}
            <Route path="/projects/:projectId" element={<ProjectWorkspaceLayout />}>
              <Route index element={<ProjectOverview />} />
              <Route path="collections" element={<Collections />} />
              <Route path="api-explorer" element={<ApiExplorer />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="logs" element={<Logs />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="members" element={<Members />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
