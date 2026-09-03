import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('message:new', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('message:status', (update) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === update.id ? { ...m, status: update.status } : m)),
      );
    });

    socket.emit('join', { conversationId });

    return () => { socket?.disconnect(); };
  }, [conversationId]);

  const sendMessage = (text: string) => {
    socket?.emit('message:send', { conversationId, text });
  };

  return { messages, connected, sendMessage };
}
