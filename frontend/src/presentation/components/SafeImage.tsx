import { useState } from 'react';

const FALLBACK_IMAGE = '/images/placeholder.svg';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function SafeImage({ src, alt, fallback = FALLBACK_IMAGE, className, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className ?? ''}`}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallback);
        }
      }}
      {...props}
    />
  );
}
