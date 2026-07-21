import { useEffect, useRef, useCallback } from 'react';

type EventHandler = (data: Record<string, unknown>) => void;

const WS_URL = import.meta.env.VITE_WS_URL || (
  typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
    ? 'wss://las-rocas-backend.onrender.com/ws'
    : 'ws://localhost:3000/ws'
);

export function useWebSocket(handlers: Record<string, EventHandler>) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      console.log('[WS] Conectado');
    };

    ws.onmessage = (event) => {
      try {
        const { event: eventName, data } = JSON.parse(event.data);
        const handler = handlersRef.current[eventName];
        if (handler) handler(data);
      } catch { /* ignore parse errors */ }
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (!mountedRef.current) return;
      console.log('[WS] Desconectado — reconectando en 5s');
      reconnectRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    };
  }, [connect]);
}
