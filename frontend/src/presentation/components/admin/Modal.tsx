import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  title: string;
  submitLabel?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, onSave, title, submitLabel = 'Guardar', children }: ModalProps) {
  const [saving, setSaving] = useState(false);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); setSaving(true); try { await onSave(); } finally { setSaving(false); } }} className="p-5 space-y-4">
              {children}
              <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium">
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Guardando...
                    </span>
                  ) : submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
