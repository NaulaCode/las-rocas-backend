import nodemailer from 'nodemailer';
import { IMailService } from '../../domain/ports/IMailService';
import { config } from '../../shared/config/config';
import { logger } from '../../shared/logger/logger';
import * as fs from 'fs';
import * as path from 'path';

export class NodemailerMailService implements IMailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;
    if (config.mail.host) {
      this.transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.secure,
        auth: { user: config.mail.user, pass: config.mail.pass },
      });
    } else {
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    }
    return this.transporter;
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: `"Las Rocas" <${config.mail.from || 'noreply@lasrocas'}>`,
        to,
        subject,
        html,
      });
      const previewDir = path.join(__dirname, '../../../../emails_preview');
      if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });
      const filename = `email_${Date.now()}.html`;
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
      fs.writeFileSync(path.join(previewDir, filename), fullHtml);
      logger.info(`Email saved: ${path.join(previewDir, filename)}`);
      if (info.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) logger.info(`Preview URL: ${previewUrl}`);
      }
    } catch (error) {
      logger.error(`Error sending email to ${to}: ${(error as Error).message}`);
    }
  }
}
