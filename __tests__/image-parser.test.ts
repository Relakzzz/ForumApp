import { describe, it, expect } from 'vitest';
import { stripHtmlTags, parseImagesFromHtml } from '../lib/image-parser';

describe('Image Parser - stripHtmlTags', () => {
  it('should remove HTML tags', () => {
    const html = '<p>Check this photo:</p><img src="test.jpg" />';
    const result = stripHtmlTags(html);
    
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('</p>');
    expect(result).toContain('Check this photo');
  });

  it('should remove image metadata with timestamp format', () => {
    const html = 'Check this photo: 20260123_1634511920×2560 352 KB';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('Check this photo');
    // Metadata should be removed
    expect(result.trim()).not.toContain('20260123_1634511920×2560 352 KB');
  });

  it('should remove image metadata with filename and size', () => {
    const html = 'Here is an image: image.jpg 1.2 MB';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('Here is an image');
    // Metadata should be removed
    expect(result.trim()).not.toContain('image.jpg 1.2 MB');
  });

  it('should preserve normal text that is not image metadata', () => {
    const html = '<p>This is a normal post with some text. The image is below.</p>';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('This is a normal post with some text');
    expect(result).toContain('The image is below');
  });

  it('should preserve text with numbers that are not metadata', () => {
    const html = '<p>I have 3 cameras and 5 lenses in my collection.</p>';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('I have 3 cameras and 5 lenses');
  });

  it('should handle decimal file sizes', () => {
    const html = 'Photo: image.jpg 1.5 MB and photo.png 2.25 MB';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('Photo');
    // Both metadata should be removed
    expect(result.trim()).not.toContain('image.jpg 1.5 MB');
    expect(result.trim()).not.toContain('photo.png 2.25 MB');
  });

  it('should remove HTML tags and filter metadata', () => {
    const html = '<p>Great photo!</p><img src="test.jpg" /><p>20260123_1634511920×2560 352 KB</p>';
    const result = stripHtmlTags(html);
    
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('</p>');
    expect(result).toContain('Great photo');
    // Metadata should be removed
    expect(result.trim()).not.toContain('20260123_1634511920×2560 352 KB');
  });
});

describe('Image Parser - parseImagesFromHtml', () => {
  it('should extract images from HTML', () => {
    const html = '<img src="https://example.com/image.jpg" alt="Test image" />';
    const images = parseImagesFromHtml(html);
    
    expect(images).toHaveLength(1);
    expect(images[0].url).toBe('https://example.com/image.jpg');
  });

  it('should skip emoji images', () => {
    const html = '<img src="/emoji/smile.png" alt="smile" /><img src="https://example.com/photo.jpg" />';
    const images = parseImagesFromHtml(html);
    
    expect(images).toHaveLength(1);
    expect(images[0].url).toContain('photo.jpg');
  });

  it('should remove duplicate images', () => {
    const html = '<img src="https://example.com/image.jpg" /><img src="https://example.com/image.jpg" />';
    const images = parseImagesFromHtml(html);
    
    expect(images).toHaveLength(1);
  });

  it('should normalize relative image URLs', () => {
    const html = '<img src="/uploads/image.jpg" />';
    const images = parseImagesFromHtml(html);
    
    expect(images[0].url).toBe('https://www.horlogeforum.nl/uploads/image.jpg');
  });
});

  it('should remove IMG_ format metadata', () => {
    const html = 'Check this: IMG_20260108_143048-11920×2400 227 KB';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('Check this');
    expect(result.trim()).not.toContain('IMG_20260108_143048-11920×2400 227 KB');
  });

  it('should remove dash-separated dimension metadata', () => {
    const html = 'Photo: photo-1920x1080 500 KB';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('Photo');
    expect(result.trim()).not.toContain('photo-1920x1080 500 KB');
  });


describe('Image Parser - Long numeric ID metadata', () => {
  it('should remove long numeric ID metadata', () => {
    const html = 'Check this: 176335703935216634950995245793821920×2560 135 KB';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('Check this');
    expect(result.trim()).not.toContain('176335703935216634950995245793821920×2560 135 KB');
  });

  it('should remove multiple long numeric metadata patterns', () => {
    const html = 'Photo 1: 176335703935216634950995245793821920×2560 135 KB and Photo 2: 176335707948730142017258161383591920×2560 123 KB';
    const result = stripHtmlTags(html);
    
    expect(result).toContain('Photo 1');
    expect(result).toContain('Photo 2');
    expect(result).not.toContain('135 KB');
    expect(result).not.toContain('123 KB');
  });
});
