import { useEffect, useRef, useCallback } from 'react';

type EventHandler = (data: Record<string, unknown>) => void;

export function useWebSocket(handlers: Record<string, EventHandler>) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Conectado');
    };

    ws.onmessage = (event) => {
      try {
        const { event: eventName, data } = JSON.parse(event.data);
        const handler = handlersRef.current[eventName];
        if (handler) {
          handler(data);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      console.log('[WS] Desconectado — reconectando en 5s');
      wsRef.current = null;
      setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
