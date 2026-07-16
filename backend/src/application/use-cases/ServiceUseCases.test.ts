import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

const mockRepo = () => {
  let services: any[] = [];
  return {
    findAll: async (activeOnly?: boolean) =>
      activeOnly ? services.filter(s => s.isActive) : services,
    findById: async (id: string) => services.find(s => s.id === id) || null,
    findByCategory: async (cat: string) => services.filter(s => s.category === cat && s.isActive),
    create: async (d: any) => {
      const s = { ...d, id: 'svc-' + Date.now(), isActive: true, createdAt: new Date(), updatedAt: new Date() };
      services.push(s);
      return s;
    },
    update: async (id: string, d: any) => {
      const idx = services.findIndex(s => s.id === id);
      if (idx === -1) return null;
      services[idx] = { ...services[idx], ...d, updatedAt: new Date() };
      return services[idx];
    },
    delete: async (id: string) => {
      const before = services.length;
      services = services.filter(s => s.id !== id);
      return services.length < before;
    },
    existsById: async (id: string) => services.some(s => s.id === id),
  };
};

describe('ServiceUseCases', () => {
  let ServiceUseCases: any;
  let repo: any;
  let uc: any;

  before(async () => {
    ServiceUseCases = (await import('./ServiceUseCases')).ServiceUseCases;
    repo = mockRepo();
    uc = new ServiceUseCases(repo);
  });

  it('creates a service with valid data', async () => {
    const s = await uc.create({ name: 'Tour Aventura', description: 'Desc', category: 'aventura' });
    assert.equal(s.name, 'Tour Aventura');
    assert.equal(s.isActive, true);
  });

  it('rejects create without name', async () => {
    await assert.rejects(
      () => uc.create({ name: '', description: 'Desc', category: 'aventura' }),
      (err: Error) => err.message === 'Nombre, descripción y categoría son requeridos'
    );
  });

  it('rejects create without description', async () => {
    await assert.rejects(
      () => uc.create({ name: 'Test', description: '', category: 'aventura' }),
      (err: Error) => err.message === 'Nombre, descripción y categoría son requeridos'
    );
  });

  it('rejects create without category', async () => {
    await assert.rejects(
      () => uc.create({ name: 'Test', description: 'Desc', category: '' }),
      (err: Error) => err.message === 'Nombre, descripción y categoría son requeridos'
    );
  });

  it('gets all services', async () => {
    const all = await uc.getAll();
    assert.equal(all.length, 1);
  });

  it('gets active services only', async () => {
    await uc.create({ name: 'Inactivo', description: 'Desc', category: 'otro' });
    const all = await uc.getAll(true);
    assert.equal(all.length, 2);
  });

  it('finds service by id', async () => {
    const s = await uc.getById((await uc.getAll())[0].id);
    assert.equal(s.name, 'Tour Aventura');
  });

  it('throws NotFoundError for missing service', async () => {
    await assert.rejects(
      () => uc.getById('no-existe'),
      (err: Error) => err.message === 'Servicio no encontrado'
    );
  });

  it('finds by category', async () => {
    const aventura = await uc.getByCategory('aventura');
    assert.ok(aventura.length >= 1);
  });

  it('updates a service', async () => {
    const s = await uc.create({ name: 'Original', description: 'Desc', category: 'cultura' });
    const updated = await uc.update(s.id, { name: 'Actualizado' });
    assert.equal(updated.name, 'Actualizado');
  });

  it('deletes a service', async () => {
    const s = await uc.create({ name: 'Temp', description: 'Desc', category: 'otro' });
    await uc.delete(s.id);
    await assert.rejects(
      () => uc.getById(s.id),
      (err: Error) => err.message === 'Servicio no encontrado'
    );
  });
});
