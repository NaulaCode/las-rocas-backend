import cron from 'node-cron';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';
import { IMailService } from '../../domain/ports/IMailService';
import { reservationReminder } from '../../domain/services/emailTemplates';
import { logger } from '../../shared/logger/logger';

export class ReminderScheduler {
  constructor(
    private reservationRepository: ReservationRepository,
    private mailService?: IMailService,
  ) {}

  start(): void {
    if (!this.mailService) {
      logger.warn('⚠️  Mail service not configured — reminder emails disabled');
      return;
    }

    const mail = this.mailService;

    cron.schedule('0 8 * * *', async () => {
      logger.info('🔔 Running reservation reminder scheduler...');
      try {
        if (!mail) return;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const reservations = await this.reservationRepository.findAll({
          startDate: dateStr,
          endDate: dateStr,
          status: 'confirmada',
        });

        if (reservations.length === 0) {
          logger.info('No reservations to remind for tomorrow');
          return;
        }

        for (const r of reservations) {
          if (!r.preferredDate) continue;
          const html = reservationReminder({
            userName: r.userName,
            serviceName: r.serviceName,
            preferredDate: r.preferredDate,
            numberOfPeople: r.numberOfPeople,
            id: r.id,
          });
          await mail.send(
            r.userEmail,
            'Recordatorio: tu reserva en Las Rocas es mañana',
            html,
          );
          logger.info(`Reminder sent to ${r.userEmail} for ${r.serviceName}`);
        }
      } catch (error) {
        logger.error(`Reminder scheduler error: ${(error as Error).message}`);
      }
    });

    logger.info('⏰ Reminder scheduler started (daily at 08:00)');
  }
}
