export type ReservationStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Reservation {
  id: string;
  serviceId: string;
  serviceName: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  numberOfPeople?: number;
  preferredDate?: Date;
  message?: string;
  status: ReservationStatus;
  createdById?: string;
  managedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationData {
  serviceId: string;
  serviceName?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  numberOfPeople?: number;
  preferredDate?: Date;
  message?: string;
  createdById?: string;
}

export interface UpdateReservationData {
  serviceId?: string;
  serviceName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  numberOfPeople?: number;
  preferredDate?: string;
  message?: string;
  status?: ReservationStatus;
  managedById?: string;
}