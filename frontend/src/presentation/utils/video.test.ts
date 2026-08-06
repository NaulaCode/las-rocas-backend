import { describe, it, expect } from 'vitest';
import { getYouTubeEmbedUrl, getInstagramEmbedUrl, getFacebookEmbedUrl, getEmbedType, isVideoUrl, classifyGalleryItem } from './video';

describe('getYouTubeEmbedUrl', () => {
  it('extracts ID from youtube.com/watch', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('extracts ID from youtu.be', () => {
    expect(getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('handles raw 11-char ID', () => {
    expect(getYouTubeEmbedUrl('dQw4w9WgXcQ'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('returns null for non-YouTube URL', () => {
    expect(getYouTubeEmbedUrl('https://example.com/video.mp4')).toBeNull();
  });
});

describe('getInstagramEmbedUrl', () => {
  it('builds embed for a post', () => {
    expect(getInstagramEmbedUrl('https://www.instagram.com/p/AbCdEf1234/'))
      .toBe('https://www.instagram.com/p/AbCdEf1234/embed/');
  });

  it('builds embed for a reel using the canonical /p/ path', () => {
    expect(getInstagramEmbedUrl('https://www.instagram.com/reel/AbCdEf1234/'))
      .toBe('https://www.instagram.com/p/AbCdEf1234/embed/');
  });

  it('extracts the shortcode even when the URL has query params', () => {
    expect(getInstagramEmbedUrl('https://www.instagram.com/reel/AbCdEf1234/?igsh=Ym04amloMmYwaG8w'))
      .toBe('https://www.instagram.com/p/AbCdEf1234/embed/');
  });

  it('returns null for non-Instagram URL', () => {
    expect(getInstagramEmbedUrl('https://example.com/photo.jpg')).toBeNull();
  });
});

describe('getFacebookEmbedUrl', () => {
  it('builds a post embed for a facebook share/post URL', () => {
    expect(getFacebookEmbedUrl('https://www.facebook.com/share/p/19JxLnJNpm/?mibextid=wwXIfr'))
      .toBe('https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fshare%2Fp%2F19JxLnJNpm%2F%3Fmibextid%3DwwXIfr&show_text=false&width=500');
  });

  it('builds a video embed for a facebook video/reel URL', () => {
    expect(getFacebookEmbedUrl('https://www.facebook.com/reel/123456'))
      .toContain('plugins/video.php');
  });

  it('returns null for a non-Facebook URL', () => {
    expect(getFacebookEmbedUrl('https://example.com/photo.jpg')).toBeNull();
  });
});

describe('getEmbedType', () => {
  it('detects Instagram URL', () => {
    expect(getEmbedType('https://www.instagram.com/p/AbCdEf1234/')).toBe('instagram');
  });
});

describe('classifyGalleryItem', () => {
  it('classifies image item', () => {
    expect(classifyGalleryItem({ url: 'https://example.com/photo.jpg', type: 'image' })).toBe('image');
  });

  it('classifies direct video item', () => {
    expect(classifyGalleryItem({ url: 'https://example.com/video.mp4', type: 'video' })).toBe('video');
  });

  it('classifies Instagram post as social', () => {
    expect(classifyGalleryItem({ url: 'https://www.instagram.com/p/AbCdEf1234/' })).toBe('social');
  });

  it('classifies TikTok as social', () => {
    expect(classifyGalleryItem({ url: 'https://www.tiktok.com/@user/video/1234567890', type: 'tiktok' })).toBe('social');
  });

  it('classifies YouTube embed as social', () => {
    expect(classifyGalleryItem({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })).toBe('social');
  });
});

describe('isVideoUrl', () => {
  it('detects YouTube URL', () => {
    expect(isVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
  });

  it('detects Instagram post URL', () => {
    expect(isVideoUrl('https://www.instagram.com/p/AbCdEf1234/')).toBe(true);
  });

  it('detects .mp4 URL', () => {
    expect(isVideoUrl('https://example.com/video.mp4')).toBe(true);
  });

  it('detects .webm URL', () => {
    expect(isVideoUrl('https://example.com/video.webm')).toBe(true);
  });

  it('returns false for image URL', () => {
    expect(isVideoUrl('https://example.com/photo.jpg')).toBe(false);
  });
});
