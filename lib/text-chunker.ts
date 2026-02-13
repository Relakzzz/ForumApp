/**
 * Text Chunking Utility
 * Breaks large text into manageable chunks while preserving paragraph structure
 */

export interface TextChunk {
  id: string;
  text: string;
  isCollapsed?: boolean;
  charCount: number;
}

// Configuration for text chunking
const CHUNK_CONFIG = {
  // Maximum characters per chunk (roughly 500-800 words)
  MAX_CHARS_PER_CHUNK: 3000,
  // Minimum characters to trigger chunking
  MIN_CHARS_TO_CHUNK: 2000,
  // Try to break at paragraph boundaries (double newline)
  PARAGRAPH_SEPARATOR: '\n\n',
  // Fallback to sentence breaks (period + space)
  SENTENCE_SEPARATOR: '. ',
};

/**
 * Split text into chunks while preserving paragraph structure
 * Chunks are created at paragraph boundaries when possible
 */
export function chunkText(text: string): TextChunk[] {
  // Normalize and trim the text
  const normalizedText = text.trim();
  
  if (!normalizedText || normalizedText.length < CHUNK_CONFIG.MIN_CHARS_TO_CHUNK) {
    // Text is small enough, return as single chunk
    return [
      {
        id: '0',
        text: normalizedText,
        charCount: normalizedText.length,
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let chunkIndex = 0;

  // Split by paragraphs first
  const paragraphs = normalizedText.split(CHUNK_CONFIG.PARAGRAPH_SEPARATOR);

  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim();
    if (!trimmedPara) continue; // Skip empty paragraphs
    
    // If adding this paragraph would exceed the limit, save current chunk
    if (
      currentChunk.length > 0 &&
      currentChunk.length + trimmedPara.length > CHUNK_CONFIG.MAX_CHARS_PER_CHUNK
    ) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        text: currentChunk.trim(),
        charCount: currentChunk.length,
      });
      currentChunk = '';
      chunkIndex++;
    }

    // Add paragraph to current chunk
    if (currentChunk.length > 0) {
      currentChunk += CHUNK_CONFIG.PARAGRAPH_SEPARATOR;
    }
    currentChunk += trimmedPara;
  }

  // Add remaining text as final chunk
  if (currentChunk.length > 0) {
    chunks.push({
      id: `chunk-${chunkIndex}`,
      text: currentChunk.trim(),
      charCount: currentChunk.length,
    });
  }

  return chunks.length > 0 ? chunks : [{ id: '0', text: normalizedText, charCount: normalizedText.length }];
}

/**
 * Get a preview of the text (first N characters)
 */
export function getTextPreview(text: string, maxChars: number = 150): string {
  if (text.length <= maxChars) return text;
  
  // Try to break at a word boundary
  const truncated = text.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxChars * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Calculate reading time in minutes
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(text: string): number {
  const wordCount = countWords(text);
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Format text for display with proper line breaks
 * Preserves paragraph structure but normalizes whitespace
 */
export function formatTextForDisplay(text: string): string {
  return text
    // Normalize multiple newlines to double newline (paragraph break)
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim();
}

/**
 * Highlight search terms in text (case-insensitive)
 * Returns text with search terms marked for highlighting
 */
export function highlightSearchTerms(
  text: string,
  searchTerms: string[]
): { text: string; highlights: Array<{ start: number; end: number }> } {
  const highlights: Array<{ start: number; end: number }> = [];
  let processedText = text;

  for (const term of searchTerms) {
    if (!term) continue;

    const regex = new RegExp(`(${term})`, 'gi');
    let match;

    // Find all occurrences of the search term
    while ((match = regex.exec(text)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return {
    text: processedText,
    highlights: highlights.sort((a, b) => a.start - b.start),
  };
}

/**
 * Truncate text to a maximum number of lines
 */
export function truncateToLines(text: string, maxLines: number): string {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return text;
  
  return lines.slice(0, maxLines).join('\n') + '\n...';
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Get text statistics
 */
export function getTextStats(text: string) {
  const words = countWords(text);
  const chars = text.length;
  const lines = text.split('\n').length;
  const paragraphs = text.split(/\n\n+/).length;
  const readingTime = calculateReadingTime(text);

  return {
    words,
    chars,
    lines,
    paragraphs,
    readingTime,
  };
}
