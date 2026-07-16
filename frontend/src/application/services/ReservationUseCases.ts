import { IReservationRepository, MonthlyReservation, TopService, ReservationFilters } from '../../domain/ports/IReservationRepository';
import { Reservation, CreateReservationDTO, UpdateReservationDTO } from '../../domain/entities/Reservation';

export class ReservationUseCases {
  constructor(private repo: IReservationRepository) {}

  getAll(filters?: ReservationFilters): Promise<Reservation[]> {
    return this.repo.getAll(filters);
  }

  getById(id: string): Promise<Reservation> {
    return this.repo.getById(id);
  }

  getByEmail(email: string): Promise<Reservation[]> {
    return this.repo.getByEmail(email);
  }

  create(data: CreateReservationDTO): Promise<Reservation> {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateReservationDTO): Promise<Reservation> {
    return this.repo.update(id, data);
  }

  updateStatus(id: string, status: string): Promise<Reservation> {
    return this.repo.updateStatus(id, status);
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  getPending(): Promise<Reservation[]> {
    return this.repo.getAll().then(rs => rs.filter(r => r.status === 'pendiente'));
  }

  cancel(id: string, email: string): Promise<Reservation> {
    return this.repo.cancel(id, email);
  }

  getAvailability(serviceId: string, date: string): Promise<{ available: boolean; booked: number }> {
    return this.repo.getAvailability(serviceId, date);
  }

  getMonthAvailability(serviceId: string, year: number, month: number): Promise<Record<string, number>> {
    return this.repo.getMonthAvailability(serviceId, year, month);
  }

  getMonthly(): Promise<MonthlyReservation[]> {
    return this.repo.getMonthly();
  }

  getTopServices(limit?: number): Promise<TopService[]> {
    return this.repo.getTopServices(limit);
  }
}
