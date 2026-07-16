import { ReservationRepository, ReservationFilters } from '../../domain/repositories/ReservationRepository';
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';
import { Reservation, CreateReservationData, UpdateReservationData } from '../../domain/entities/Reservation';
import { NotFoundError, ValidationError } from '../../domain/errors/AppError';
import { IMailService } from '../../domain/ports/IMailService';
import { ILogger } from '../../domain/ports/ILogger';
import { reservationConfirmation, reservationStatusChange, adminNewReservation } from '../../domain/services/emailTemplates';

export class ReservationUseCases {
  constructor(
    private reservationRepository: ReservationRepository,
    private logger: ILogger,
    private organizationRepository?: OrganizationRepository,
    private mailService?: IMailService,
    private serviceRepository?: ServiceRepository,
  ) {}

  async getAll(filters?: ReservationFilters): Promise<Reservation[]> {
    return this.reservationRepository.findAll(filters);
  }

  async getById(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundError('Reserva no encontrada');
    }
    return reservation;
  }

  async getByEmail(email: string): Promise<Reservation[]> {
    return this.reservationRepository.findByEmail(email);
  }

  async getByService(serviceId: string): Promise<Reservation[]> {
    return this.reservationRepository.findByService(serviceId);
  }

  async create(data: CreateReservationData): Promise<Reservation> {
    if (!data.serviceId || !data.userName || !data.userEmail) {
      throw new ValidationError('Servicio, nombre y email son requeridos');
    }
    if (!this.isValidEmail(data.userEmail)) {
      throw new ValidationError('Email inválido');
    }

    if (data.preferredDate && this.serviceRepository) {
      const service = await this.serviceRepository.findById(data.serviceId);
      if (service) {
        const dateStr = typeof data.preferredDate === 'string' ? data.preferredDate : data.preferredDate.toISOString().split('T')[0];
        if (service.availableUntil) {
          const untilStr = typeof service.availableUntil === 'string' ? service.availableUntil : service.availableUntil.toISOString().split('T')[0];
          if (dateStr > untilStr) throw new ValidationError('La fecha seleccionada está fuera del período de disponibilidad del servicio');
        }
        if (service.availableFrom) {
          const fromStr = typeof service.availableFrom === 'string' ? service.availableFrom : service.availableFrom.toISOString().split('T')[0];
          if (dateStr < fromStr) throw new ValidationError('El servicio aún no está disponible en la fecha seleccionada');
        }
        if (service.maxCapacity && data.numberOfPeople) {
          if (data.numberOfPeople > service.maxCapacity) {
            throw new ValidationError(`Máximo ${service.maxCapacity} personas por reserva`);
          }
          const existing = await this.reservationRepository.findByService(data.serviceId);
          let sumOnDate = 0;
          for (const r of existing) {
            if (r.status !== 'pendiente' && r.status !== 'confirmada') continue;
            if (!r.preferredDate || !r.numberOfPeople) continue;
            const rd = r.preferredDate.toISOString().split('T')[0];
            if (rd === dateStr) sumOnDate += r.numberOfPeople;
          }
          if (sumOnDate + data.numberOfPeople > service.maxCapacity) {
            throw new ValidationError('Cupo completo para la fecha seleccionada');
          }
        }
      }
    }

    if (data.preferredDate && this.organizationRepository) {
      const org = await this.organizationRepository.find();
      const blockedDates: Array<{ date: string }> = org?.pageContent?.blockedDates || [];
      const dateStr = typeof data.preferredDate === 'string' ? data.preferredDate : data.preferredDate.toISOString().split('T')[0];
      const isBlocked = blockedDates.some(bd => bd.date === dateStr);
      if (isBlocked) throw new ValidationError('La fecha seleccionada no está disponible');
    }

    const reservation = await this.reservationRepository.create(data);

    if (this.mailService) {
      const html = reservationConfirmation({
        userName: data.userName,
        serviceName: data.serviceName || 'Servicio',
        preferredDate: data.preferredDate,
        numberOfPeople: data.numberOfPeople,
        userPhone: data.userPhone,
        message: data.message,
        id: reservation.id,
        status: 'pendiente',
      });
      this.mailService.send(data.userEmail, 'Solicitud de reserva recibida - Las Rocas', html).catch(e =>
        this.logger.error('Error sending confirmation email', e)
      );
    }

    if (this.mailService && this.organizationRepository) {
      const org = await this.organizationRepository.find();
      if (org?.email) {
        const html = adminNewReservation({
          userName: reservation.userName,
          userEmail: reservation.userEmail,
          userPhone: reservation.userPhone,
          serviceName: reservation.serviceName,
          preferredDate: reservation.preferredDate,
          numberOfPeople: reservation.numberOfPeople,
          message: reservation.message,
          id: reservation.id,
        });
        this.mailService.send(org.email, 'Nueva reserva recibida - Las Rocas', html).catch(e =>
          this.logger.error('Error sending admin notification', e)
        );
      }
    }

    return reservation;
  }

  async update(id: string, data: UpdateReservationData): Promise<Reservation> {
    const reservation = await this.reservationRepository.update(id, data);
    if (!reservation) {
      throw new NotFoundError('Reserva no encontrada');
    }

    if (this.mailService && data.status) {
      if (data.status === 'confirmada') {
        const html = reservationConfirmation({
          userName: reservation.userName,
          serviceName: reservation.serviceName,
          preferredDate: reservation.preferredDate,
          numberOfPeople: reservation.numberOfPeople,
          userPhone: reservation.userPhone,
          message: reservation.message,
          id: reservation.id,
          status: 'confirmada',
        });
        this.mailService.send(reservation.userEmail, 'Reserva confirmada - Las Rocas', html).catch(e =>
          this.logger.error('Error sending confirmation email', e)
        );
      } else {
        const html = reservationStatusChange({
          userName: reservation.userName,
          serviceName: reservation.serviceName,
          status: data.status,
          id: reservation.id,
        });
        this.mailService.send(reservation.userEmail, 'Estado de reserva actualizado - Las Rocas', html).catch(e =>
          this.logger.error('Error sending status email', e)
        );
      }
    }

    return reservation;
  }

  async cancel(id: string, email: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundError('Reserva no encontrada');
    }
    if (reservation.userEmail !== email) {
      throw new ValidationError('El email no coincide con la reserva');
    }
    if (reservation.status === 'cancelada' || reservation.status === 'completada') {
      throw new ValidationError('La reserva ya fue cancelada o completada');
    }
    const updated = await this.reservationRepository.update(id, { status: 'cancelada' });
    if (!updated) throw new NotFoundError('Reserva no encontrada');

    if (this.mailService) {
      const html = reservationStatusChange({
        userName: updated.userName, serviceName: updated.serviceName,
        status: 'cancelada', id: updated.id,
      });
      this.mailService.send(updated.userEmail, 'Reserva cancelada - Las Rocas', html).catch(e =>
        this.logger.error('Error sending cancellation email', e)
      );
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.reservationRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Reserva no encontrada');
    }
  }

  async getAvailability(serviceId: string, date: string, maxCapacity: number = 999): Promise<{ available: boolean; booked: number }> {
    const booked = await this.reservationRepository.getAvailability(serviceId, date);
    return { available: booked < maxCapacity, booked };
  }

  async getMonthAvailability(serviceId: string, year: number, month: number): Promise<Record<string, number>> {
    return this.reservationRepository.getMonthAvailability(serviceId, year, month);
  }

  async getStats(): Promise<Record<string, number>> {
    return this.reservationRepository.countByStatus();
  }

  async getMonthlyReservations(): Promise<{ month: string; count: number }[]> {
    return this.reservationRepository.countByMonth();
  }

  async getTopServices(limit?: number): Promise<{ serviceId: string; serviceName: string; count: number }[]> {
    return this.reservationRepository.getTopServices(limit);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
