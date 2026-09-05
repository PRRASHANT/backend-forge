import React from 'react';
import Projects from './Projects';

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground text-sm mt-1">Here is the overview of your workspaces.</p>
      </div>
      <Projects />
    </div>
  );
}
