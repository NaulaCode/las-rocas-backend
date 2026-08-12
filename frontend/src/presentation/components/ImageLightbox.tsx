import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getYouTubeEmbedUrl, getFacebookEmbedUrl, getTikTokEmbedUrl } from '../utils/video';

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

function isEmbedVideo(url: string, type?: string) {
  return type === 'youtube' || type === 'facebook' || type === 'tiktok' || !!getYouTubeEmbedUrl(url) || !!getFacebookEmbedUrl(url) || !!getTikTokEmbedUrl(url);
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url);
}

function embedSrc(url: string) {
  return getYouTubeEmbedUrl(url) || getFacebookEmbedUrl(url) || getTikTokEmbedUrl(url) || url;
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

  const isVid = isEmbedVideo(image.url, image.type) || isDirectVideoUrl(image.url) || image.type === 'video';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 bg-black/90 z-[60] flex p-2 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 border border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:bg-black/60 hover:scale-105 transition-all z-10"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="absolute top-3 sm:top-6 left-1/2 -translate-x-1/2 bg-black/40 border border-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 sm:px-3 sm:py-1.5 text-white/90 text-xs sm:text-sm font-medium whitespace-nowrap">
          {index + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 border border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:bg-black/60 transition-all hover:scale-110"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 border border-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg hover:bg-black/60 transition-all hover:scale-110"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center m-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-h-[60vh] sm:max-h-[75vh] flex items-center justify-center">
            {isVid ? (
              isEmbedVideo(image.url, image.type) ? (
                <div className="relative w-full" style={{ maxWidth: 800, paddingBottom: '56.25%' }}>
                  <iframe
                    src={embedSrc(image.url)}
                    className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl"
                    allowFullScreen
                    title={image.caption || ''}
                  />
                </div>
              ) : (
                <video
                  src={image.url}
                  className="max-w-full max-h-[60vh] sm:max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                  controls
                  playsInline
                />
              )
            ) : (
              <img
                src={image.url}
                alt={image.caption || ''}
                className="max-w-full max-h-[60vh] sm:max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>
          {image.caption && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/80 text-sm sm:text-base mt-3 sm:mt-4 text-center max-w-lg px-2"
            >
              {image.caption}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
