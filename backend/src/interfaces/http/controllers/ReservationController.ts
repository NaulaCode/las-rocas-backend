import { Request, Response, NextFunction } from 'express';
import { ReservationUseCases } from '../../../application/use-cases/ReservationUseCases';
import { ServiceUseCases } from '../../../application/use-cases/ServiceUseCases';
import { IWebSocketNotifier } from '../../../domain/ports/IWebSocketNotifier';
import { IAuditLogger } from '../../../domain/ports/IAuditLogger';

export class ReservationController {
  constructor(
    private reservationUseCases: ReservationUseCases,
    private auditLogger: IAuditLogger,
    private wsNotifier: IWebSocketNotifier,
    private serviceUseCases?: ServiceUseCases,
  ) {}

  async getByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.params.email as string;
      const reservations = await this.reservationUseCases.getByEmail(email);
      res.status(200).json({ status: 'success', data: reservations });
    } catch (error) { next(error); }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, serviceId, startDate, endDate } = req.query;
      const reservations = await this.reservationUseCases.getAll({
        status: status as string | undefined,
        serviceId: serviceId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      res.status(200).json({ status: 'success', data: reservations });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const reservation = await this.reservationUseCases.getById(id);
      res.status(200).json({ status: 'success', data: reservation });
    } catch (error) { next(error); }
  }

  async create(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.body, createdById: (req as any).user?.userId };
      const reservation = await this.reservationUseCases.create(data);
      this.auditLogger.log({ userId: data.createdById || '00000000-0000-0000-0000-000000000000', userEmail: req.body.userEmail ?? 'anonimo', action: 'CREATE', entityType: 'reservation', entityId: reservation.id, details: { serviceName: reservation.serviceName, userName: reservation.userName, numberOfPeople: reservation.numberOfPeople } });
      this.wsNotifier.broadcast('new-reservation', {
        id: reservation.id, userName: reservation.userName, serviceName: reservation.serviceName,
        preferredDate: reservation.preferredDate, numberOfPeople: reservation.numberOfPeople, message: 'Nueva reserva recibida',
      });
      res.status(201).json({ status: 'success', message: 'Reserva creada correctamente', data: reservation });
    } catch (error) { next(error); }
  }

  async update(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = { ...req.body, managedById: req.user?.userId };
      const reservation = await this.reservationUseCases.update(id, data);
      if (data.status) {
        this.wsNotifier.broadcast('reservation-status-changed', {
          id: reservation.id, status: reservation.status, userName: reservation.userName,
        });
      }
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'UPDATE', entityType: 'reservation', entityId: id, details: data });
      res.status(200).json({ status: 'success', data: reservation });
    } catch (error) { next(error); }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, email } = req.body;
      const reservation = await this.reservationUseCases.cancel(id, email);
      this.wsNotifier.broadcast('reservation-status-changed', { id: reservation.id, status: 'cancelada', userName: reservation.userName });
      res.status(200).json({ status: 'success', message: 'Reserva cancelada correctamente', data: reservation });
    } catch (error) { next(error); }
  }

  async delete(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.reservationUseCases.delete(id);
      this.auditLogger.log({ userId: req.user.userId, userEmail: req.user.email, action: 'DELETE', entityType: 'reservation', entityId: id });
      res.status(200).json({ status: 'success', message: 'Reserva eliminada correctamente' });
    } catch (error) { next(error); }
  }

  async getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId, date } = req.query;
      if (!serviceId || !date) { res.status(400).json({ status: 'error', message: 'serviceId y date son requeridos' }); return; }
      let maxCapacity = 999;
      if (this.serviceUseCases) {
        try {
          const service = await this.serviceUseCases.getById(serviceId as string);
          maxCapacity = service.maxCapacity ?? 999;
        } catch { /* use default */ }
      }
      const result = await this.reservationUseCases.getAvailability(serviceId as string, date as string, maxCapacity);
      res.status(200).json({ status: 'success', data: { ...result, maxCapacity } });
    } catch (error) { next(error); }
  }

  async getMonthAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId, year, month } = req.query;
      if (!serviceId || !year || !month) {
        res.status(400).json({ status: 'error', message: 'serviceId, year y month son requeridos' });
        return;
      }
      const result = await this.reservationUseCases.getMonthAvailability(
        serviceId as string, parseInt(year as string, 10), parseInt(month as string, 10),
      );
      res.status(200).json({ status: 'success', data: result });
    } catch (error) { next(error); }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.reservationUseCases.getStats();
      res.status(200).json({ status: 'success', data: stats });
    } catch (error) { next(error); }
  }

  async getMonthly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.reservationUseCases.getMonthlyReservations();
      res.status(200).json({ status: 'success', data });
    } catch (error) { next(error); }
  }

  async getTopServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const data = await this.reservationUseCases.getTopServices(limit);
      res.status(200).json({ status: 'success', data });
    } catch (error) { next(error); }
  }
}
