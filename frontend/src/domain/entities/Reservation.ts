export type ReservationStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Reservation {
  id: string;
  serviceId: string;
  serviceName: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  numberOfPeople: number;
  preferredDate?: string;
  message?: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationDTO {
  serviceId: string;
  serviceName?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  numberOfPeople?: number;
  preferredDate?: string;
  message?: string;
  turnstileToken?: string;
}

export interface UpdateReservationDTO {
  serviceId?: string;
  serviceName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  numberOfPeople?: number;
  preferredDate?: string;
  message?: string;
  status?: ReservationStatus;
}
