import { Reservation, CreateReservationDTO, UpdateReservationDTO } from '../entities/Reservation';

export interface MonthlyReservation {
  month: string;
  count: number;
}

export interface TopService {
  serviceId: string;
  serviceName: string;
  count: number;
}

export interface ReservationFilters {
  status?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
}

export interface IReservationRepository {
  getAll(filters?: ReservationFilters): Promise<Reservation[]>;
  getById(id: string): Promise<Reservation>;
  getByEmail(email: string): Promise<Reservation[]>;
  create(data: CreateReservationDTO): Promise<Reservation>;
  update(id: string, data: UpdateReservationDTO): Promise<Reservation>;
  updateStatus(id: string, status: string): Promise<Reservation>;
  delete(id: string): Promise<void>;
  cancel(id: string, email: string): Promise<Reservation>;
  getAvailability(serviceId: string, date: string): Promise<{ available: boolean; booked: number }>;
  getMonthAvailability(serviceId: string, year: number, month: number): Promise<Record<string, number>>;
  getMonthly(): Promise<MonthlyReservation[]>;
  getTopServices(limit?: number): Promise<TopService[]>;
}
