export function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export function isVideoUrl(url: string): boolean {
  if (getYouTubeEmbedUrl(url)) return true;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export interface GalleryItem {
  url: string;
  caption?: string;
  type?: 'image' | 'video';
}
