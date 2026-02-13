import { describe, it, expect } from 'vitest';
import {
  chunkText,
  getTextPreview,
  calculateReadingTime,
  formatTextForDisplay,
  countWords,
  getTextStats,
  truncateToLines,
} from '../lib/text-chunker';

describe('Text Chunker', () => {
  describe('chunkText', () => {
    it('should return single chunk for small text', () => {
      const text = 'This is a small text.';
      const chunks = chunkText(text);
      expect(chunks).toHaveLength(1);
      expect(chunks[0].text).toBe(text);
    });

    it('should split large text into multiple chunks', () => {
      const text = 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.\n\n' + 'x'.repeat(3000);
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThan(1);
    });

    it('should preserve paragraph structure', () => {
      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const chunks = chunkText(text);
      expect(chunks[0].text).toContain('First paragraph');
    });

    it('should handle text without paragraph breaks', () => {
      const text = 'Single line text without breaks.';
      const chunks = chunkText(text);
      expect(chunks).toHaveLength(1);
    });

    it('should trim whitespace from chunks', () => {
      const text = '  Paragraph 1.  \n\n  Paragraph 2.  ';
      const chunks = chunkText(text);
      expect(chunks[0].text.trim()).toBe(chunks[0].text);
    });

    it('should assign unique IDs to chunks', () => {
      const text = 'P1\n\n' + 'x'.repeat(3000) + '\n\nP2\n\n' + 'x'.repeat(3000);
      const chunks = chunkText(text);
      const ids = chunks.map(c => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('getTextPreview', () => {
    it('should return full text if shorter than max chars', () => {
      const text = 'Short text';
      const preview = getTextPreview(text, 50);
      expect(preview).toBe(text);
    });

    it('should truncate long text', () => {
      const text = 'This is a very long text that should be truncated because it exceeds the maximum character limit';
      const preview = getTextPreview(text, 30);
      expect(preview.length).toBeLessThanOrEqual(35);
      expect(preview).toContain('...');
    });

    it('should break at word boundaries', () => {
      const text = 'Word1 Word2 Word3 Word4 Word5 Word6 Word7';
      const preview = getTextPreview(text, 20);
      expect(preview).toContain('...');
      expect(preview.length).toBeLessThanOrEqual(25);
    });

    it('should use default max chars if not provided', () => {
      const text = 'x'.repeat(200);
      const preview = getTextPreview(text);
      expect(preview.length).toBeLessThanOrEqual(155);
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const text = 'word '.repeat(200);
      const time = calculateReadingTime(text);
      expect(time).toBeGreaterThanOrEqual(1);
    });

    it('should return minimum 1 minute', () => {
      const text = 'short';
      const time = calculateReadingTime(text);
      expect(time).toBeGreaterThanOrEqual(1);
    });

    it('should round up reading time', () => {
      const text = 'word '.repeat(250);
      const time = calculateReadingTime(text);
      expect(time).toBe(2);
    });
  });

  describe('formatTextForDisplay', () => {
    it('should normalize multiple newlines', () => {
      const text = 'Line 1\n\n\n\nLine 2';
      const formatted = formatTextForDisplay(text);
      expect(formatted).toBe('Line 1\n\nLine 2');
    });

    it('should trim leading and trailing whitespace', () => {
      const text = '  \n  Text content  \n  ';
      const formatted = formatTextForDisplay(text);
      expect(formatted).toBe('Text content');
    });

    it('should preserve single and double newlines', () => {
      const text = 'Line 1\nLine 2\n\nParagraph 2';
      const formatted = formatTextForDisplay(text);
      expect(formatted).toContain('Line 1\nLine 2');
      expect(formatted).toContain('\n\nParagraph 2');
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      const text = 'One two three four five';
      expect(countWords(text)).toBe(5);
    });

    it('should handle multiple spaces', () => {
      const text = 'One  two   three';
      expect(countWords(text)).toBe(3);
    });

    it('should handle newlines', () => {
      const text = 'One\ntwo\nthree';
      expect(countWords(text)).toBe(3);
    });

    it('should return 0 for empty text', () => {
      expect(countWords('')).toBe(0);
    });

    it('should return 0 for whitespace only', () => {
      expect(countWords('   \n\n  ')).toBe(0);
    });
  });

  describe('getTextStats', () => {
    it('should calculate all statistics', () => {
      const text = 'Line 1\nLine 2\n\nParagraph 2';
      const stats = getTextStats(text);
      
      expect(stats).toHaveProperty('words');
      expect(stats).toHaveProperty('chars');
      expect(stats).toHaveProperty('lines');
      expect(stats).toHaveProperty('paragraphs');
      expect(stats).toHaveProperty('readingTime');
    });

    it('should count characters including spaces', () => {
      const text = 'Hello World';
      const stats = getTextStats(text);
      expect(stats.chars).toBe(11);
    });

    it('should count lines correctly', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const stats = getTextStats(text);
      expect(stats.lines).toBe(3);
    });

    it('should count paragraphs correctly', () => {
      const text = 'Para 1\n\nPara 2\n\nPara 3';
      const stats = getTextStats(text);
      expect(stats.paragraphs).toBe(3);
    });
  });

  describe('truncateToLines', () => {
    it('should return full text if under max lines', () => {
      const text = 'Line 1\nLine 2';
      const truncated = truncateToLines(text, 5);
      expect(truncated).toBe(text);
    });

    it('should truncate to max lines', () => {
      const text = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      const truncated = truncateToLines(text, 3);
      expect(truncated).toContain('Line 1');
      expect(truncated).toContain('Line 3');
      expect(truncated).not.toContain('Line 4');
      expect(truncated).toContain('...');
    });

    it('should handle single line', () => {
      const text = 'Single line';
      const truncated = truncateToLines(text, 5);
      expect(truncated).toBe(text);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty text', () => {
      const chunks = chunkText('');
      expect(chunks).toHaveLength(1);
      expect(chunks[0].text).toBe('');
    });

    it('should handle text with only whitespace', () => {
      const chunks = chunkText('   \n\n  ');
      expect(chunks).toHaveLength(1);
    });

    it('should handle very long single paragraph', () => {
      const text = 'x'.repeat(5000);
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThanOrEqual(1);
      expect(chunks.every(c => c.text.length > 0)).toBe(true);
    });

    it('should handle mixed content', () => {
      const text = 'Short\n\n' + 'x'.repeat(2000) + '\n\nEnd';
      const chunks = chunkText(text);
      expect(chunks.length).toBeGreaterThan(0);
    });
  });
});
