import { motion } from 'framer-motion';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  onClick?: () => void;
}

export default function StatCard({ icon, label, value, color, onClick }: StatCardProps) {
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-xl border border-gray-100 bg-white shadow-sm transition-all text-left w-full ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.button>
  );
}
