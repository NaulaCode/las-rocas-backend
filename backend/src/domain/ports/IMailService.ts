export interface IMailService {
  send(to: string, subject: string, html: string): Promise<void>;
}
