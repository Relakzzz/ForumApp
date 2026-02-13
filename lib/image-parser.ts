/**
 * Parse images from Discourse post HTML content
 */

export interface ParsedImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Map of common emoji image URLs to their text equivalents
 */
const EMOJI_IMAGE_MAP: Record<string, string> = {
  // Common emoji patterns from Discourse
  'crown': '👑',
  'heart': '❤️',
  'smile': '😊',
  'laughing': '😄',
  'wink': '😉',
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'fire': '🔥',
  'star': '⭐',
  'tada': '🎉',
  'rocket': '🚀',
  'thinking': '🤔',
  'eyes': '👀',
  'pray': '🙏',
  'clap': '👏',
};

/**
 * Check if an image URL is an emoji image
 */
function isEmojiImage(url: string, alt?: string): boolean {
  if (!url) return false;
  
  // Check if URL contains common emoji CDN patterns
  const emojiPatterns = [
    '/emoji/',
    '/images/emoji/',
    'emoji.png',
    'emoji.svg',
    'cdn/emoji',
  ];
  
  if (emojiPatterns.some(pattern => url.includes(pattern))) {
    return true;
  }
  
  // Check if alt text matches emoji names
  if (alt) {
    const lowerAlt = alt.toLowerCase();
    return Object.keys(EMOJI_IMAGE_MAP).some(key => lowerAlt.includes(key));
  }
  
  return false;
}

/**
 * Get emoji text from image URL or alt text
 */
function getEmojiFromImage(url: string, alt?: string): string | null {
  if (!alt) return null;
  
  const lowerAlt = alt.toLowerCase().trim();
  
  // Direct lookup
  if (EMOJI_IMAGE_MAP[lowerAlt]) {
    return EMOJI_IMAGE_MAP[lowerAlt];
  }
  
  // Check if any key is contained in the alt text
  for (const [key, emoji] of Object.entries(EMOJI_IMAGE_MAP)) {
    if (lowerAlt.includes(key)) {
      return emoji;
    }
  }
  
  return null;
}

/**
 * Extract image URLs and metadata from HTML content
 * Filters out emoji images and converts them to text
 */
export function parseImagesFromHtml(html: string): ParsedImage[] {
  if (!html) return [];

  const images: ParsedImage[] = [];
  
  // Match img tags with src attributes
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*(?:width="(\d+)")?[^>]*(?:height="(\d+)")?[^>]*>/gi;
  
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    const alt = match[2];
    const width = match[3] ? parseInt(match[3], 10) : undefined;
    const height = match[4] ? parseInt(match[4], 10) : undefined;

    // Skip emoji images - they'll be converted to text
    if (isEmojiImage(url, alt)) {
      continue;
    }

    // Only add if URL is valid and not a tracking pixel
    if (url && url.length > 0 && !isTrackingPixel(url)) {
      images.push({
        url: normalizeImageUrl(url),
        alt,
        width,
        height,
      });
    }
  }

  // Also match image links (Discourse sometimes wraps images in links)
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*><img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[2];
    const alt = match[3];
    
    // Skip emoji images
    if (isEmojiImage(url, alt)) {
      continue;
    }
    
    if (url && !isTrackingPixel(url)) {
      images.push({
        url: normalizeImageUrl(url),
      });
    }
  }

  // Remove duplicates
  return Array.from(new Map(images.map(img => [img.url, img])).values());
}

/**
 * Convert emoji images in HTML to text emoji
 */
export function convertEmojiImagesToText(html: string): string {
  if (!html) return '';
  
  // Replace emoji img tags with text emoji
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
  
  return html.replace(imgRegex, (match, url, alt) => {
    if (isEmojiImage(url, alt)) {
      const emoji = getEmojiFromImage(url, alt);
      return emoji || match;
    }
    return match;
  });
}

/**
 * Check if URL is a tracking pixel (usually very small)
 */
function isTrackingPixel(url: string): boolean {
  // Common tracking pixel patterns
  if (url.includes('pixel') || url.includes('beacon') || url.includes('track')) {
    return true;
  }
  
  // Check for common tracking domains
  const trackingDomains = ['analytics', 'doubleclick', 'facebook.com/tr', 'google-analytics'];
  return trackingDomains.some(domain => url.includes(domain));
}

/**
 * Normalize image URL to ensure it's absolute
 */
function normalizeImageUrl(url: string): string {
  // If already absolute, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If relative, prepend the forum domain
  if (url.startsWith('/')) {
    return `https://www.horlogeforum.nl${url}`;
  }

  // If it's a protocol-relative URL
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  // Otherwise assume it's relative to the forum domain
  return `https://www.horlogeforum.nl/${url}`;
}

/**
 * Extract text content from HTML, removing tags but converting emoji images to text
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  console.log('[stripHtmlTags] Input HTML:', html.substring(0, 200));
  // First convert emoji images to text
  let content = convertEmojiImagesToText(html);
  
  // Remove img tags completely (we extract images separately in parseImagesFromHtml)
  content = content.replace(/<img[^>]*>/g, '');
  
  // Remove meta divs that contain image metadata (filename, dimensions, size)
  content = content.replace(/<div\s+class="meta"[^>]*>.*?<\/div>/gs, '');
  
  // Remove all other HTML tags
  content = content.replace(/<[^>]*>/g, '');
  
  // Clean up HTML entities
  content = content
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  
  // Remove image metadata patterns - comprehensive master regex
  // Catches all known formats: long IDs, dates, IMG_ format, filenames with dimensions
  // Examples: 176335703935216634950995245793821920×2560 135 KB, 20260123_1634511920×2560 352 KB
  content = content.replace(/[\d_-]*\d+[×x]\d+\s+\d+(?:\.\d+)?\s*(?:KB|MB|GB)\b/gi, '');
  content = content.replace(/\b[\w.-]+\.(?:jpg|jpeg|png|gif|webp|bmp)\s+\d+(?:\.\d+)?\s*(?:KB|MB|GB)\b/gi, '');
  
  // Clean up any extra whitespace that resulted from removals
  content = content.replace(/\s+/g, ' ').trim();
  
  return content;
}
