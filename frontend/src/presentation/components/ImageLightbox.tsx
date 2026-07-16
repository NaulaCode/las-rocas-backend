import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  url: string;
  caption?: string;
  type?: string;
}

interface Props {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function isVideo(url: string, type?: string) {
  return type === 'video' || /youtube\.com|youtu\.be/i.test(url);
}

function getEmbedUrl(url: string) {
  if (url.includes('watch?v='))
    return url.replace('watch?v=', 'embed/').split('&')[0];
  if (url.includes('youtu.be/'))
    return url.replace('youtu.be/', 'www.youtube.com/embed/');
  return url;
}

export default function ImageLightbox({ images, index, onClose, onPrev, onNext }: Props) {
  const image = images[index];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('lightbox-open');
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('lightbox-open');
    };
  }, [handleKeyDown]);

  const isVid = isVideo(image.url, image.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
          {index + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-h-[75vh] flex items-center justify-center">
            {isVid ? (
              <div className="relative w-full" style={{ maxWidth: 800, paddingBottom: '56.25%' }}>
                <iframe
                  src={getEmbedUrl(image.url)}
                  className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl"
                  allowFullScreen
                  title={image.caption || ''}
                />
              </div>
            ) : (
              <img
                src={image.url}
                alt={image.caption || ''}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>
          {image.caption && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/80 text-base mt-4 text-center max-w-lg"
            >
              {image.caption}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
