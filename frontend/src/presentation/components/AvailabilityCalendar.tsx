import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { container } from '../../di/container';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface Props {
  serviceId: string;
  maxCapacity?: number;
  availableFrom?: string | null;
  availableUntil?: string | null;
}

export default function AvailabilityCalendar({ serviceId, maxCapacity = 999, availableFrom, availableUntil }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [booked, setBooked] = useState<Record<string, number>>({});
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const [data, org] = await Promise.all([
        container.reservations.getMonthAvailability(serviceId, y, m),
        container.organization.get().catch(() => null),
      ]);
      setBooked(data);
      const bd = org?.pageContent?.blockedDates || [];
      const blocked = new Set<string>();
      const pad = (n: number) => String(n).padStart(2, '0');
      bd.forEach((d: any) => {
        if (d.date && d.date.startsWith(`${y}-${pad(m)}`)) blocked.add(d.date);
      });
      setBlockedDates(blocked);
    } catch {
      setBooked({});
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadMonth(year, month);
  }, [year, month, loadMonth]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const todayStr = today.toISOString().split('T')[0];

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateKey = (d: number) => `${year}-${pad(month)}-${pad(d)}`;

  const getStatus = (d: number) => {
    const key = dateKey(d);
    if (availableFrom && key < availableFrom.slice(0, 10)) return 'unavailable';
    if (availableUntil && key > availableUntil.slice(0, 10)) return 'unavailable';
    if (blockedDates.has(key)) return 'blocked';
    const count = booked[key] || 0;
    if (count === 0) return 'free';
    if (count < maxCapacity) return 'partial';
    return 'full';
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Disponibilidad</h3>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm font-semibold text-gray-700">{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-1">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const status = getStatus(d);
            const isPast = dateKey(d) < todayStr;

            let bg = 'bg-gray-50 text-gray-400';
            let tip = 'No disponible';
            let dot = null;

            if (status === 'blocked') {
              bg = 'bg-gray-200 text-gray-500 cursor-not-allowed line-through';
              tip = 'Bloqueado';
            } else if (status === 'unavailable') {
              bg = 'bg-gray-100 text-gray-300 cursor-not-allowed';
              tip = 'Fuera del período disponible';
            } else if (isPast) {
              bg = 'bg-green-50 text-green-700 hover:bg-green-100';
              tip = 'Disponible';
              dot = <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />;
            } else if (status === 'partial') {
              bg = 'bg-amber-50 text-amber-700 hover:bg-amber-100';
              tip = `${booked[dateKey(d)]}/${maxCapacity} reservada(s)`;
              dot = <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />;
            } else {
              bg = 'bg-red-50 text-red-400 cursor-not-allowed';
              tip = 'Completo';
            }

            return (
              <motion.div
                key={d}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: d * 0.005, duration: 0.2 }}
                title={tip}
                className={`relative aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${bg}`}
              >
                {d}
                {dot}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Disponible</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Parcial</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Completo</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-300" /> Bloqueado</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-200" /> No disponible</span>
      </div>
    </div>
  );
}
