/**
 * Redis key templates - mirrored byte-by-byte in Go engine.
 * NEVER change these without updating the Go counterpart.
 */
export const REDIS_KEYS = {
  tenantConfig: (inst: string) => \`tenant:cfg:\${inst}\`,
  chatHistory: (inst: string, jid: string) => \`chat:\${inst}:\${jid}\`,
  chatMeta: (inst: string, jid: string) => \`chatmeta:\${inst}:\${jid}\`,
  humanControl: (inst: string, jid: string) => \`human:\${inst}:\${jid}\`,
  coalescerLock: (inst: string, jid: string) => \`coal:lock:\${inst}:\${jid}\`,
  coalescerBuf: (inst: string, jid: string) => \`coal:buf:\${inst}:\${jid}\`,
  engineDedup: (inst: string, msgId: string) => \`engine:dedup:\${inst}:\${msgId}\`,
  idempotency: (inst: string, reqId: string) => \`idemp:\${inst}:\${reqId}\`,
  presence: (inst: string) => \`presence:\${inst}\`,
  connectionState: (inst: string) => \`conn:\${inst}\`,
} as const;
