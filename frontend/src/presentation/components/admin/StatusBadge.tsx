const config: Record<string, { bg: string; text: string; dot: string }> = {
  activo: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  inactivo: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  suspendido: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  pendiente: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  confirmada: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  cancelada: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  completada: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  publicado: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  borrador: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function StatusBadge({ status, active }: { status: string; active?: boolean }) {
  const key = active !== undefined ? (active ? 'activo' : 'inactivo') : status;
  const c = config[key] || config.activo;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
