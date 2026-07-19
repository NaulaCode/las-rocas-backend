import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'loading';
}

interface ToastCtx {
  toast: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => void;
  dismissToast: (id: number) => void;
  updateToast: (id: number, message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {}, dismissToast: () => {}, updateToast: () => {} });

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'loading' = 'success') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id: number, message: string, type: 'success' | 'error' | 'info') => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, message, type } : t));
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismissToast, updateToast }}>
      {children}
      <div className="fixed top-24 right-6 z-[70] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDone={remove} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: (id: number) => void }) {
  useEffect(() => {
    if (toast.type === 'loading') return;
    const timer = setTimeout(() => onDone(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDone, toast.type]);

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    loading: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons: Record<string, string> = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    loading: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg ${colors[toast.type]} min-w-[300px] max-w-md`}
    >
      {toast.type === 'loading' ? (
        <svg className="w-5 h-5 flex-shrink-0 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[toast.type]} />
        </svg>
      )}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={() => onDone(toast.id)} className="text-current opacity-50 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}
