/**
 * YouTube URL Helper Utilities
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - URLs with additional query parameters (&t=..., ?si=..., &feature=...)
 */

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return Boolean(getYouTubeId(url));
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

export function getYouTubeThumbnailUrl(url: string | null | undefined, quality: 'hq' | 'maxres' | 'mq' = 'hq'): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  const qualityMap = {
    maxres: 'maxresdefault.jpg',
    hq: 'hqdefault.jpg',
    mq: 'mqdefault.jpg',
  };
  return `https://img.youtube.com/vi/${id}/${qualityMap[quality] || 'hqdefault.jpg'}`;
}
