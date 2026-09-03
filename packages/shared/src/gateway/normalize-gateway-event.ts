import type { NexusEventV1 } from '../types/nexus-event-v1';

export function normalizeGatewayEvent(raw: any): NexusEventV1 {
  const data = raw.data ?? raw;
  return {
    event: raw.event,
    instance: raw.instance ?? raw.instanceName,
    messageId: data.key?.id ?? data.messageId ?? '',
    remoteJid: resolveCanonicalJid(data.key?.remoteJid ?? data.remoteJid ?? ''),
    pushName: data.pushName ?? '',
    body: extractBody(data),
    timestamp: data.messageTimestamp ?? Math.floor(Date.now() / 1000),
    isGroup: (data.key?.remoteJid ?? '').endsWith('@g.us'),
    mediaType: data.message?.imageMessage ? 'image'
      : data.message?.audioMessage ? 'audio'
      : data.message?.videoMessage ? 'video'
      : data.message?.documentMessage ? 'document'
      : undefined,
    mediaUrl: data.message?.imageMessage?.url
      ?? data.message?.audioMessage?.url
      ?? data.message?.videoMessage?.url
      ?? data.message?.documentMessage?.url,
  };
}

function resolveCanonicalJid(jid: string): string {
  return jid.replace(/@lid$/, '@s.whatsapp.net');
}

function extractBody(data: any): string {
  return data.message?.conversation
    ?? data.message?.extendedTextMessage?.text
    ?? data.body
    ?? '';
}
