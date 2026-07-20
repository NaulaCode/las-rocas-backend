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

export function getFacebookEmbedUrl(url: string): string | null {
  if (/facebook\.com\/.*(?:video|watch|reel)/i.test(url) || /fb\.watch\//i.test(url)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=734`;
  }
  return null;
}

export function getTikTokEmbedUrl(url: string): string | null {
  const m = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/i);
  if (m) {
    return `https://www.tiktok.com/embed/v2/${m[1]}`;
  }
  return null;
}

export function getEmbedUrl(url: string): string | null {
  return getYouTubeEmbedUrl(url) || getFacebookEmbedUrl(url) || getTikTokEmbedUrl(url);
}

export function isVideoUrl(url: string): boolean {
  if (getEmbedUrl(url)) return true;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export type EmbedType = 'youtube' | 'facebook' | 'tiktok' | null;

export function getEmbedType(url: string): EmbedType {
  if (getYouTubeEmbedUrl(url)) return 'youtube';
  if (getFacebookEmbedUrl(url)) return 'facebook';
  if (getTikTokEmbedUrl(url)) return 'tiktok';
  return null;
}

export interface GalleryItem {
  url: string;
  caption?: string;
  type?: 'image' | 'video' | 'youtube' | 'facebook' | 'tiktok';
}
