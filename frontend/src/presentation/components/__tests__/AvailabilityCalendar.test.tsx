import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AvailabilityCalendar from '../AvailabilityCalendar';

vi.mock('../../../di/container', () => ({
  container: {
    reservations: {
      getMonthAvailability: vi.fn().mockResolvedValue({}),
    },
    organization: {
      get: vi.fn().mockResolvedValue({
        pageContent: { blockedDates: [] },
      }),
    },
  },
}));

describe('AvailabilityCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AvailabilityCalendar serviceId="svc-1" />);
    expect(container.querySelector('.grid')).toBeTruthy();
  });

  it('displays the title', () => {
    render(<AvailabilityCalendar serviceId="svc-1" />);
    expect(screen.getByText('Disponibilidad')).toBeInTheDocument();
  });

  it('shows week day headers', async () => {
    render(<AvailabilityCalendar serviceId="svc-1" />);
    await waitFor(() => {
      expect(screen.getByText('Dom')).toBeInTheDocument();
    });
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('Mié')).toBeInTheDocument();
    expect(screen.getByText('Jue')).toBeInTheDocument();
    expect(screen.getByText('Vie')).toBeInTheDocument();
    expect(screen.getByText('Sáb')).toBeInTheDocument();
  });

  it('displays the legend', async () => {
    render(<AvailabilityCalendar serviceId="svc-1" />);
    await waitFor(() => {
      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });
    expect(screen.getByText('Parcial')).toBeInTheDocument();
    expect(screen.getByText('Completo')).toBeInTheDocument();
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    expect(screen.getByText('No disponible')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<AvailabilityCalendar serviceId="svc-1" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
