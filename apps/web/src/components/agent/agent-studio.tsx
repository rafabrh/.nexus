'use client';

import { useState } from 'react';

interface AgentConfig {
  systemPrompt: string;
  persona: string;
  objective: string;
  rules: string[];
  guardrails: string[];
  model: string;
  temperature: number;
}

export function AgentStudio() {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/agent-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agent Studio</h1>
        <button onClick={handleSave} disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
          {saving ? 'Salvando...' : 'Salvar configuracao'}
        </button>
      </header>
      {/* Prompt layers editor, model selector, temperature slider, playground */}
    </div>
  );
}
