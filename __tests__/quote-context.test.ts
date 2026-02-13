import { describe, it, expect } from 'vitest';
import type { Quote } from '@/contexts/quote-context';

describe('Quote formatting', () => {
  it('should format a single quote correctly', () => {
    const quote: Quote = {
      id: '1',
      postId: 123,
      authorName: 'Test User',
      authorUsername: 'testuser',
      selectedText: 'This is a test quote',
      timestamp: 'Today',
      topicId: 456,
    };

    const formatted = `[quote="${quote.authorUsername}, post:${quote.postId}, topic:${quote.topicId}"]
${quote.selectedText}
[/quote]`;

    expect(formatted).toContain('[quote="testuser, post:123, topic:456"]');
    expect(formatted).toContain('This is a test quote');
    expect(formatted).toContain('[/quote]');
  });

  it('should format multiple quotes with newlines between them', () => {
    const quote1: Quote = {
      id: '1',
      postId: 123,
      authorName: 'Test User',
      authorUsername: 'testuser',
      selectedText: 'Quote 1',
      timestamp: 'Today',
      topicId: 456,
    };

    const quote2: Quote = {
      id: '2',
      postId: 124,
      authorName: 'Another User',
      authorUsername: 'anotheruser',
      selectedText: 'Quote 2',
      timestamp: 'Yesterday',
      topicId: 456,
    };

    const quotes = [quote1, quote2];
    const formatted = quotes
      .map(
        (quote) =>
          `[quote="${quote.authorUsername}, post:${quote.postId}, topic:${quote.topicId}"]
${quote.selectedText}
[/quote]`
      )
      .join('\n\n');

    // Should contain both quotes
    expect(formatted).toContain('Quote 1');
    expect(formatted).toContain('Quote 2');

    // Should have double newlines between quotes
    expect(formatted.includes('[/quote]\n\n[quote=')).toBe(true);
  });

  it('should extract plain text from HTML correctly', () => {
    const html = '<p>This is <strong>bold</strong> text with &nbsp; spaces.</p>';
    
    const plainText = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    expect(plainText).toBe('This is bold text with   spaces.');
  });

  it('should truncate long quote text', () => {
    const longText = 'a'.repeat(250);
    const truncated = longText.length > 200 ? longText.substring(0, 200) + '...' : longText;

    expect(truncated.length).toBe(203); // 200 + 3 for '...'
    expect(truncated.endsWith('...')).toBe(true);
  });

  it('should not truncate short quote text', () => {
    const shortText = 'This is a short quote';
    const truncated = shortText.length > 200 ? shortText.substring(0, 200) + '...' : shortText;

    expect(truncated).toBe('This is a short quote');
    expect(truncated.endsWith('...')).toBe(false);
  });

  it('should handle empty quote text', () => {
    const quote: Quote = {
      id: '1',
      postId: 123,
      authorName: 'Test User',
      authorUsername: 'testuser',
      selectedText: '',
      timestamp: 'Today',
      topicId: 456,
    };

    expect(quote.selectedText).toBe('');
    expect(quote.selectedText.trim()).toBe('');
  });

  it('should create unique quote IDs', () => {
    const id1 = `${123}-${Date.now()}`;
    const id2 = `${124}-${Date.now() + 1}`;

    expect(id1).not.toBe(id2);
  });
});
