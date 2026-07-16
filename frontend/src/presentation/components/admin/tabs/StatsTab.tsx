import { ChatbotStats } from '../../../../domain/entities/ChatbotQuestion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Props {
  chatbotStats: ChatbotStats | null;
  loadingStats: boolean;
  setChatbotStats: (v: ChatbotStats | null) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function StatsTab({ chatbotStats, loadingStats, setChatbotStats }: Props) {
  if (loadingStats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!chatbotStats) {
    return (
      <div className="text-center py-20 text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">No hay estadísticas disponibles</p>
        <p className="text-xs mt-1">Los datos aparecerán cuando el chatbot tenga actividad</p>
      </div>
    );
  }

  const pieData = [
    { name: 'FAQ', value: chatbotStats.faq },
    { name: 'IA', value: chatbotStats.ai },
    { name: 'Fallback', value: chatbotStats.fallback },
  ];

  const confidenceData = [
    { name: 'Alta', value: chatbotStats.byConfidence.alta },
    { name: 'Media', value: chatbotStats.byConfidence.media },
    { name: 'Baja', value: chatbotStats.byConfidence.baja },
  ];

  const total = chatbotStats.total;
  const nonFallback = chatbotStats.faq + chatbotStats.ai;
  const successRate = total > 0 ? Math.round(nonFallback / total * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-gray-800">{total}</p>
          <p className="text-sm text-gray-500 mt-1">Total Consultas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-blue-600">{chatbotStats.faq}</p>
          <p className="text-sm text-gray-500 mt-1">FAQ <span className="text-gray-400">({total > 0 ? Math.round(chatbotStats.faq / total * 100) : 0}%)</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-green-600">{chatbotStats.ai}</p>
          <p className="text-sm text-gray-500 mt-1">IA <span className="text-gray-400">({total > 0 ? Math.round(chatbotStats.ai / total * 100) : 0}%)</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-emerald-600">{successRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Tasa de Acierto</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-orange-600">{chatbotStats.fallback}</p>
          <p className="text-sm text-gray-500 mt-1">Fallback <span className="text-gray-400">({total > 0 ? Math.round(chatbotStats.fallback / total * 100) : 0}%)</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribución de Consultas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Confianza de Respuestas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {chatbotStats.daily && chatbotStats.daily.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tendencia Diaria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chatbotStats.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="faq" stroke="#00C49F" strokeWidth={2} />
              <Line type="monotone" dataKey="ai" stroke="#0088FE" strokeWidth={2} />
              <Line type="monotone" dataKey="fallback" stroke="#FF8042" strokeWidth={2} />
              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chatbotStats.recentLogs && chatbotStats.recentLogs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Registros Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Consulta', 'Respuesta', 'Fuente', 'Fecha'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {chatbotStats.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">{log.query}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.answer}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.source === 'faq' ? 'bg-green-50 text-green-700' :
                        log.source === 'ai' ? 'bg-blue-50 text-blue-700' :
                        'bg-orange-50 text-orange-700'
                      }`}>{log.source}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
