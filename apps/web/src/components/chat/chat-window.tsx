'use client';

import { useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/use-socket';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
  mediaType?: string;
  mediaUrl?: string;
}

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const messagesEnd = useRef<HTMLDivElement>(null);
  const { messages, sendMessage } = useSocket(conversationId);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg: Message) => (
          <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
              msg.role === 'assistant' ? 'bg-muted' : 'bg-primary text-white'
            }`}>
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-60">
                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {msg.status === 'read' && ' ✓✓'}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>
    </div>
  );
}
