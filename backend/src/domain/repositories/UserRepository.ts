import { User, CreateUserData, UpdateUserData } from '../entities/User';

// Interfaz (puerto) - define QUÉ operaciones existen
// La implementación real está en infrastructure/repositories
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}