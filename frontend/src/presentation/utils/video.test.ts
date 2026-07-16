import { describe, it, expect } from 'vitest';
import { getYouTubeEmbedUrl, isVideoUrl } from './video';

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

describe('isVideoUrl', () => {
  it('detects YouTube URL', () => {
    expect(isVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
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
