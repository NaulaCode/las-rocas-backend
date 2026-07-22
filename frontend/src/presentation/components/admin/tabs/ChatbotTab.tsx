import { useState } from 'react';
import { ChatbotQuestion } from '../../../../domain/entities/ChatbotQuestion';
import { renderTable, actionButtons, searchInput } from '../AdminTable';
import StatusBadge from '../StatusBadge';
import { useToast } from '../../Toast';
import { container } from '../../../../di/container';

interface Props {
  questions: ChatbotQuestion[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  openCreate: (type: string) => void;
  openEdit: (type: string, item: any) => void;
  setDeleteId: (id: string | null) => void;
  onQuestionsUpdated: () => void;
}

const categories = ['general', 'servicios', 'eventos', 'reservas', 'contacto'];

export default function ChatbotTab({ questions, searchTerm, setSearchTerm, filterValue, setFilterValue, openCreate, openEdit, setDeleteId, onQuestionsUpdated }: Props) {
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await container.chatbot.seedAndReindex();
      toast(`Se agregaron ${result.added} preguntas nuevas. Total: ${result.total}.`, 'success');
      onQuestionsUpdated();
    } catch (err: any) {
      toast(err?.message || 'Error al sembrar preguntas', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      await container.chatbot.reindexEmbeddings();
      toast('Embeddings reindexados correctamente.', 'success');
    } catch (err: any) {
      toast(err?.message || 'Error al reindexar embeddings', 'error');
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">{searchInput(searchTerm, setSearchTerm, 'Buscar pregunta...')}</div>
          <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white">
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleSeed} disabled={seeding}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {seeding ? 'Sembrando...' : 'Sembrar FAQs'}
          </button>
          <button onClick={handleReindex} disabled={reindexing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {reindexing ? 'Reindexando...' : 'Reindexar Embeddings'}
          </button>
          <button onClick={() => openCreate('chatbot')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nueva Pregunta
          </button>
        </div>
      </div>
      {renderTable(
        ['Pregunta', 'Categoría', 'Prioridad', 'Estado', 'Acciones'],
        questions.filter((q) => {
          const matchSearch = !searchTerm || q.question.toLowerCase().includes(searchTerm.toLowerCase());
          const matchFilter = !filterValue || q.category === filterValue;
          return matchSearch && matchFilter;
        }).map((q) => (
          <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
            <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-xs truncate">{q.question}</td>
            <td className="px-4 py-3"><span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{q.category}</span></td>
            <td className="px-4 py-3">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                q.priority >= 8 ? 'bg-red-50 text-red-700' :
                q.priority >= 5 ? 'bg-yellow-50 text-yellow-700' :
                'bg-green-50 text-green-700'
              }`}>
                {q.priority}
              </span>
            </td>
            <td className="px-4 py-3"><StatusBadge active={q.isActive} status={q.isActive ? 'activo' : 'inactivo'} /></td>
            <td className="px-4 py-3">{actionButtons(() => openEdit('chatbot', q), () => setDeleteId(`chatbot:${q.id}`))}</td>
          </tr>
        ))
      )}
    </div>
  );
}
