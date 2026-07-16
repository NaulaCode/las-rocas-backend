import { z } from 'zod';

export const emailField = z.string().email('Email inválido');

export const createServiceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().min(1, 'La categoría es requerida'),
  image: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  price: z.number().positive('El precio debe ser positivo').optional(),
  duration: z.string().optional(),
  location: z.string().optional(),
  schedule: z.string().optional(),
  isActive: z.boolean().optional(),
  maxCapacity: z.number().int().positive('La capacidad debe ser positiva').optional(),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
  availableUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createReservationSchema = z.object({
  serviceId: z.string().min(1, 'El servicio es requerido'),
  serviceName: z.string().optional(),
  userName: z.string().min(1, 'El nombre es requerido'),
  userEmail: emailField,
  userPhone: z.string().optional(),
  numberOfPeople: z.number().int().positive('Debe ser al menos 1 persona').optional(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)').optional(),
  message: z.string().optional(),
});

export const updateReservationSchema = z.object({
  serviceId: z.string().optional(),
  serviceName: z.string().optional(),
  userName: z.string().optional(),
  userEmail: emailField.optional(),
  userPhone: z.string().optional(),
  numberOfPeople: z.number().int().positive().optional(),
  preferredDate: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada']).optional(),
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada']),
});

export const cancelReservationSchema = z.object({
  id: z.string().min(1),
  email: emailField,
});

export const createNewsSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(300),
  content: z.string().min(1, 'El contenido es requerido'),
  summary: z.string().optional(),
  type: z.enum(['noticia', 'evento', 'festividad', 'actividad']).optional(),
  image: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const updateNewsSchema = createNewsSchema.partial();

export const createUserSchema = z.object({
  email: emailField,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  role: z.enum(['super_admin', 'admin', 'board']).optional(),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const createAttractionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.enum(['natural', 'cultural', 'aventura', 'gastronomico', 'historico', 'playa', 'montana', 'otro']),
  image: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  location: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  schedule: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  duration: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateAttractionSchema = createAttractionSchema.partial();

export const createContactMessageSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: emailField,
  phone: z.string().optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'El mensaje es requerido'),
});

export const createReviewSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: emailField,
  text: z.string().min(1, 'La reseña es requerida').max(1000),
  rating: z.number().int().min(1, 'Debe dar al menos 1 estrella').max(5, 'Máximo 5 estrellas'),
  serviceId: z.string().uuid().optional(),
  serviceName: z.string().optional(),
  role: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().max(200).optional(),
  description: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  history: z.string().optional(),
  phone: z.string().optional(),
  email: emailField.optional().or(z.literal('')),
  address: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  pageContent: z.record(z.string(), z.any()).optional(),
});
