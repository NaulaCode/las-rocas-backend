import { IWebSocketNotifier } from '../../domain/ports/IWebSocketNotifier';
import { wsManager } from '../websocket/WebSocketManager';

export class WebSocketNotifierImpl implements IWebSocketNotifier {
  broadcast(event: string, data: any): void {
    wsManager.broadcast(event, data);
  }
}
