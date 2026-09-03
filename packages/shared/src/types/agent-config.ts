export interface AgentConfig {
  systemPrompt: string;
  persona: string;
  objective: string;
  rules: string[];
  guardrails: string[];
  contextSources: ContextSource[];
  model: string;
  temperature: number;
  cfgVersion: number;
}

export interface ContextSource {
  type: 'product_catalog' | 'faq' | 'custom';
  label: string;
  content: string;
}
