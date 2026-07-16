import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { log } from '../../shared/logger/logger';

type EventPayload = Record<string, unknown>;

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients = new Set<WebSocket>();

  initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      log.info(`🟢 Cliente WebSocket conectado (total: ${this.clients.size})`);

      ws.on('close', () => {
        this.clients.delete(ws);
        log.info(`🔴 Cliente WebSocket desconectado (total: ${this.clients.size})`);
      });

      ws.on('error', (err) => {
        log.error('Error en WebSocket:', err);
        this.clients.delete(ws);
      });
    });

    log.info('📡 Servidor WebSocket iniciado en /ws');
  }

  broadcast(event: string, data: EventPayload): void {
    if (!this.wss) return;
    const message = JSON.stringify({ event, data });
    let sent = 0;
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sent++;
      }
    });
    if (sent > 0) {
      log.debug(`📤 Evento "${event}" enviado a ${sent} cliente(s)`);
    }
  }

  get connectedClients(): number {
    return this.clients.size;
  }
}

export const wsManager = new WebSocketManager();
