import { Reservation, CreateReservationData, UpdateReservationData } from '../entities/Reservation';

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

export interface ReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  findAll(filters?: ReservationFilters): Promise<Reservation[]>;
  findByService(serviceId: string): Promise<Reservation[]>;
  findByEmail(email: string): Promise<Reservation[]>;
  create(data: CreateReservationData): Promise<Reservation>;
  update(id: string, data: UpdateReservationData): Promise<Reservation | null>;
  delete(id: string): Promise<boolean>;
  countByStatus(): Promise<Record<string, number>>;
  getAvailability(serviceId: string, date: string): Promise<number>;
  getMonthAvailability(serviceId: string, year: number, month: number): Promise<Record<string, number>>;
  countByMonth(): Promise<MonthlyReservation[]>;
  getTopServices(limit?: number): Promise<TopService[]>;
}