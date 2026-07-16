import { useState, useEffect } from 'react';
import { container } from '../../../../di/container';
import type { Review } from '../../../../domain/entities/Review';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    container.reviews.getAll().then(setReviews).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

  const pending = reviews.filter(r => !r.isApproved);
  const approved = reviews.filter(r => r.isApproved);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Reseñas de Usuarios</h2>
      {pending.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-amber-600 mb-2">Pendientes de Aprobación ({pending.length})</h3>
          <div className="space-y-3">
            {pending.map(r => <ReviewCard key={r.id} review={r} onApprove={async () => { await container.reviews.approve(r.id); load(); }} onDelete={async () => { await container.reviews.delete(r.id); load(); }} />)}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Aprobadas ({approved.length})</h3>
        {approved.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            <p className="text-sm font-medium">No hay reseñas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map(r => <ReviewCard key={r.id} review={r} onDelete={async () => { await container.reviews.delete(r.id); load(); }} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review, onApprove, onDelete }: { review: Review; onApprove?: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-800">{review.name}</span>
            {review.serviceName && <span className="text-xs text-gray-400">· {review.serviceName}</span>}
            <span className="text-xs text-gray-400">· {new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            ))}
          </div>
          <p className="text-sm text-gray-600">{review.text}</p>
          {review.role && <p className="text-xs text-gray-400 mt-1">{review.role}</p>}
        </div>
        <div className="flex gap-2 ml-3 flex-shrink-0">
          {!review.isApproved && onApprove && (
            <button onClick={onApprove} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">Aprobar</button>
          )}
          <button onClick={onDelete} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}
