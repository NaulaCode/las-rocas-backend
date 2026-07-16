import { IReservationRepository, MonthlyReservation, TopService, ReservationFilters } from '../../../domain/ports/IReservationRepository';
import { Reservation, CreateReservationDTO, UpdateReservationDTO } from '../../../domain/entities/Reservation';
import { apiClient } from '../ApiClient';

export class ReservationRepositoryImpl implements IReservationRepository {
  getAll(filters?: ReservationFilters): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.serviceId) params.set('serviceId', filters.serviceId);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    const qs = params.toString();
    return apiClient.get<Reservation[]>(`/reservations${qs ? `?${qs}` : ''}`);
  }

  getById(id: string): Promise<Reservation> {
    return apiClient.get<Reservation>(`/reservations/${id}`);
  }

  getByEmail(email: string): Promise<Reservation[]> {
    return apiClient.get<Reservation[]>(`/reservations/by-email/${email}`);
  }

  create(data: CreateReservationDTO): Promise<Reservation> {
    return apiClient.post<Reservation>('/reservations', data);
  }

  update(id: string, data: UpdateReservationDTO): Promise<Reservation> {
    return apiClient.put<Reservation>(`/reservations/${id}`, data);
  }

  updateStatus(id: string, status: string): Promise<Reservation> {
    return apiClient.put<Reservation>(`/reservations/${id}`, { status });
  }

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/reservations/${id}`);
  }

  cancel(id: string, email: string): Promise<Reservation> {
    return apiClient.post<Reservation>('/reservations/cancel', { id, email });
  }

  getAvailability(serviceId: string, date: string): Promise<{ available: boolean; booked: number }> {
    return apiClient.get<{ available: boolean; booked: number }>(`/reservations/availability?serviceId=${serviceId}&date=${date}`);
  }

  getMonthAvailability(serviceId: string, year: number, month: number): Promise<Record<string, number>> {
    return apiClient.get<Record<string, number>>(`/reservations/availability/month?serviceId=${serviceId}&year=${year}&month=${month}`);
  }

  getMonthly(): Promise<MonthlyReservation[]> {
    return apiClient.get<MonthlyReservation[]>('/reservations/monthly');
  }

  getTopServices(limit: number = 10): Promise<TopService[]> {
    return apiClient.get<TopService[]>(`/reservations/top-services?limit=${limit}`);
  }
}
