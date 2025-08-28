

import React from 'react';
import HapioInterface from './HapioInterface';

export default async function AiAgentsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">AI Agents Configuration</h1>
          <p className="text-muted-foreground">
            Configure your AI agent settings
          </p>
        </div>

        <HapioInterface />
      </div>
    </div>
  );
}