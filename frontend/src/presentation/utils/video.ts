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

export function getInstagramEmbedUrl(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/i);
  if (!m) return null;
  return `https://www.instagram.com/p/${m[1]}/embed/`;
}

export function getEmbedUrl(url: string): string | null {
  return getYouTubeEmbedUrl(url) || getFacebookEmbedUrl(url) || getTikTokEmbedUrl(url) || getInstagramEmbedUrl(url);
}

export function isVideoUrl(url: string): boolean {
  if (getEmbedUrl(url)) return true;
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url);
}

export function detectMediaType(url: string): 'image' | 'video' | 'youtube' | 'facebook' | 'tiktok' | 'instagram' {
  if (getYouTubeEmbedUrl(url)) return 'youtube';
  if (getFacebookEmbedUrl(url)) return 'facebook';
  if (getTikTokEmbedUrl(url)) return 'tiktok';
  if (getInstagramEmbedUrl(url)) return 'instagram';
  if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url)) return 'video';
  return 'image';
}

export type EmbedType = 'youtube' | 'facebook' | 'tiktok' | 'instagram' | null;

export function getEmbedType(url: string): EmbedType {
  if (getYouTubeEmbedUrl(url)) return 'youtube';
  if (getFacebookEmbedUrl(url)) return 'facebook';
  if (getTikTokEmbedUrl(url)) return 'tiktok';
  if (getInstagramEmbedUrl(url)) return 'instagram';
  return null;
}

export interface GalleryItem {
  url: string;
  caption?: string;
  type?: 'image' | 'video' | 'youtube' | 'facebook' | 'tiktok' | 'instagram';
}

export type GalleryCategory = 'image' | 'video' | 'social';

export function classifyGalleryItem(item: { url: string; type?: string }): GalleryCategory {
  const type = (item.type || '').toLowerCase();
  if (type === 'youtube' || type === 'facebook' || type === 'tiktok' || type === 'instagram') return 'social';
  if (getEmbedUrl(item.url)) return 'social';
  if (type === 'video' || /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(item.url) || /\/video\/upload\//i.test(item.url)) return 'video';
  return 'image';
}
