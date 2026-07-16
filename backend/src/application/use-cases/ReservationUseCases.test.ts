import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Mock repositories for testing validation logic
function createMockRepos(overrides: Record<string, any> = {}) {
  const defaults = {
    findById: async () => null,
    findAll: async () => [],
    findByService: async (_id: string) => [],
    findByEmail: async () => [],
    create: async (data: any) => ({ ...data, id: 'mock-id', status: 'pendiente' as const }),
    update: async (_id: string, data: any) => data,
    delete: async () => true,
    countByStatus: async () => ({}),
    getAvailability: async (_sid: string, _d: string) => 0,
    getMonthAvailability: async () => ({}),
    countByMonth: async () => [],
    getTopServices: async () => [],
  };

  const orgDefaults = {
    find: async () => ({
      id: 'org-1',
      name: 'Las Rocas',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      pageContent: { blockedDates: [{ date: '2026-12-25' }] },
    }),
    update: async (_data: any) => null,
  };

  const svcDefaults = {
    findById: async (_id: string) => ({
      id: 'svc-1',
      name: 'Test Service',
      description: 'Test description',
      category: 'tour',
      isActive: true,
      maxCapacity: 10,
      availableFrom: new Date('2026-01-01'),
      availableUntil: new Date('2026-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findAll: async () => [],
    findByCategory: async () => [],
    create: async (d: any) => d,
    update: async (_id: string, d: any) => d,
    delete: async () => true,
    existsById: async () => true,
  };

  return {
    reservationRepo: { ...defaults, ...overrides },
    organizationRepo: { ...orgDefaults, ...overrides },
    serviceRepo: { ...svcDefaults, ...overrides },
  };
}

const mockLogger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
};

describe('ReservationUseCases - create validation', () => {
  it('rejects when numberOfPeople exceeds maxCapacity', async () => {
    const { ReservationUseCases } = await import('./ReservationUseCases');
    const repos = createMockRepos();
    const uc = new ReservationUseCases(repos.reservationRepo, mockLogger, repos.organizationRepo, undefined, repos.serviceRepo);

    await assert.rejects(
      () => uc.create({ serviceId: 'svc-1', userName: 'Test', userEmail: 'test@test.com', numberOfPeople: 15, preferredDate: new Date('2026-06-15') }),
      (err: Error) => err.message === 'Máximo 10 personas por reserva'
    );
  });

  it('rejects when date is blocked in organization settings', async () => {
    const { ReservationUseCases } = await import('./ReservationUseCases');
    const repos = createMockRepos();
    const uc = new ReservationUseCases(repos.reservationRepo, mockLogger, repos.organizationRepo, undefined, repos.serviceRepo);

    await assert.rejects(
      () => uc.create({
        serviceId: 'svc-1', userName: 'Test', userEmail: 'test@test.com',
        numberOfPeople: 2, preferredDate: new Date('2026-12-25'),
      }),
      (err: Error) => err.message === 'La fecha seleccionada no está disponible'
    );
  });

  it('rejects when date is outside available range', async () => {
    const { ReservationUseCases } = await import('./ReservationUseCases');
    const repos = createMockRepos();
    const uc = new ReservationUseCases(repos.reservationRepo, mockLogger, repos.organizationRepo, undefined, repos.serviceRepo);

    await assert.rejects(
      () => uc.create({
        serviceId: 'svc-1', userName: 'Test', userEmail: 'test@test.com',
        numberOfPeople: 2, preferredDate: new Date('2027-06-01'),
      }),
      (err: Error) => err.message === 'La fecha seleccionada está fuera del período de disponibilidad del servicio'
    );
  });

  it('rejects when date is full (sum of people exceeds capacity)', async () => {
    const { ReservationUseCases } = await import('./ReservationUseCases');
    const existing: any[] = [
      { serviceId: 'svc-1', preferredDate: new Date('2026-06-15'), numberOfPeople: 8, status: 'confirmada' },
    ];
    const repos = createMockRepos({ findByService: async () => existing });
    const uc = new ReservationUseCases(repos.reservationRepo, mockLogger, repos.organizationRepo, undefined, repos.serviceRepo);

    await assert.rejects(
      () => uc.create({
        serviceId: 'svc-1', userName: 'Test', userEmail: 'test@test.com',
        numberOfPeople: 5, preferredDate: new Date('2026-06-15'),
      }),
      (err: Error) => err.message === 'Cupo completo para la fecha seleccionada'
    );
  });

  it('validates required fields', async () => {
    const { ReservationUseCases } = await import('./ReservationUseCases');
    const repos = createMockRepos();
    const uc = new ReservationUseCases(repos.reservationRepo, mockLogger, repos.organizationRepo, undefined, repos.serviceRepo);

    await assert.rejects(
      () => uc.create({ serviceId: '', userName: '', userEmail: '' }),
      (err: Error) => err.message === 'Servicio, nombre y email son requeridos'
    );
  });

  it('accepts valid reservation', async () => {
    const { ReservationUseCases } = await import('./ReservationUseCases');
    const repos = createMockRepos();
    const uc = new ReservationUseCases(repos.reservationRepo, mockLogger, repos.organizationRepo, undefined, repos.serviceRepo);

    const result = await uc.create({
      serviceId: 'svc-1', userName: 'Test', userEmail: 'test@test.com',
      numberOfPeople: 3, preferredDate: new Date('2026-06-15'),
    });

    assert.equal(result.userName, 'Test');
    assert.equal(result.status, 'pendiente');
  });
});
