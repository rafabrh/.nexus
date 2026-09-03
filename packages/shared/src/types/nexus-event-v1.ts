export interface NexusEventV1 {
  event: string;
  instance: string;
  messageId: string;
  remoteJid: string;
  pushName: string;
  body: string;
  timestamp: number;
  isGroup: boolean;
  mediaType?: 'image' | 'audio' | 'video' | 'document' | 'sticker';
  mediaUrl?: string;
}
