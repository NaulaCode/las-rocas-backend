import { describe, it, expect, vi, beforeAll } from 'vitest';
import type { TouristicService } from '../../domain/entities/TouristicService';

const mockService: TouristicService = {
  id: '1',
  name: 'Tour Aventura',
  description: 'Descripción del tour',
  category: 'aventura',
  price: 25,
  duration: '3 horas',
  location: 'Comuna San Miguel',
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mockReservation = {
  id: 'r1',
  serviceId: '1',
  serviceName: 'Tour Aventura',
  userName: 'Juan Pérez',
  userEmail: 'juan@test.com',
  numberOfPeople: 2,
  preferredDate: '2026-07-15',
  status: 'pendiente',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
};

let pdfModule: any;

beforeAll(async () => {
  pdfModule = await import('./pdf');
});

describe('PDF utilities', () => {
  it('downloadBlob creates a blob URL and triggers download', () => {
    const { downloadBlob } = pdfModule;
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.createElement('div'));
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.createElement('div'));

    downloadBlob(new Blob(['test']), 'test.pdf');
    expect(createSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    createSpy.mockRestore();
    revokeSpy.mockRestore();
  });

  it('exportServicesPDF exports services data', () => {
    const { exportServicesPDF } = pdfModule;
    const result = exportServicesPDF([mockService]);
    expect(result).toBeInstanceOf(Blob);
  });

  it('exportServicesPDF handles empty array', () => {
    const { exportServicesPDF } = pdfModule;
    const result = exportServicesPDF([]);
    expect(result).toBeInstanceOf(Blob);
  });

  it('exportReservationsPDF exports reservation data', () => {
    const { exportReservationsPDF } = pdfModule;
    const result = exportReservationsPDF([mockReservation], [mockService]);
    expect(result).toBeInstanceOf(Blob);
  });

  it('exportReservationsPDF handles empty array', () => {
    const { exportReservationsPDF } = pdfModule;
    const result = exportReservationsPDF([], []);
    expect(result).toBeInstanceOf(Blob);
  });

  it('generateReservationPDF creates reservation detail', () => {
    const { generateReservationPDF } = pdfModule;
    const t = (key: string) => key;
    const result = generateReservationPDF(mockReservation, t);
    expect(result).toBeInstanceOf(Blob);
  });
});
