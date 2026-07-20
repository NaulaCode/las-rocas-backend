import { useState, useRef } from 'react';
import { useToast } from '../Toast';
import { container } from '../../../di/container';

const isVideoUrl = (url: string) =>
  /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url) || url.includes('blob:');

export default function ImageUpload({ value, onChange, previewClass }: { value: string; onChange: (url: string) => void; previewClass?: string }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await container.upload.image(file);
      onChange(result.url);
    } catch (err: any) {
      toast(err?.message || 'Error al subir el archivo', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const isVideo = value && isVideoUrl(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm,video/ogg"
          onChange={handleFile}
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-semibold hover:file:bg-primary-100 file:cursor-pointer cursor-pointer"
        />
        {uploading && <span className="text-sm text-gray-400 animate-pulse">Subiendo...</span>}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-sm transition-all"
        placeholder="O pega una URL..."
      />
      {value && (
        isVideo ? (
          <video src={value} className={previewClass || "w-32 h-20 object-cover rounded border"} controls />
        ) : (
          <img src={value} alt="Preview" className={previewClass || "w-32 h-20 object-cover rounded border"} loading="lazy" />
        )
      )}
    </div>
  );
}
