export interface IWebSocketNotifier {
  broadcast(event: string, data: any): void;
}
