/**
 * Emoji and Emoticon Parser
 * Handles emoji display and text emoticon conversion
 */

// Common text emoticons to emoji conversion map
const EMOTICON_MAP: Record<string, string> = {
  ':)': '😊',
  ':-)': '😊',
  ':(': '😢',
  ':-(': '😢',
  ':D': '😄',
  ':-D': '😄',
  ':P': '😛',
  ':-P': '😛',
  ':p': '😛',
  ':-p': '😛',
  ':O': '😮',
  ':-O': '😮',
  ':o': '😮',
  ':-o': '😮',
  ';)': '😉',
  ';-)': '😉',
  ':*': '😘',
  ':-*': '😘',
  ':/': '😕',
  ':-/': '😕',
  ':@': '😠',
  ':-@': '😠',
  ':X': '🤐',
  ':-X': '🤐',
  ':x': '🤐',
  ':-x': '🤐',
  ':$': '😳',
  ':-$': '😳',
  ':!': '😲',
  ':-!': '😲',
  ':?': '🤔',
  ':-?': '🤔',
  ':L': '😒',
  ':-L': '😒',
  ':l': '😒',
  ':-l': '😒',
  ':>': '😏',
  ':->': '😏',
  ':<': '😒',
  ':-<': '😒',
  ':^)': '😊',
  ':^(': '😢',
  ':^^': '😄',
  ':&': '🤢',
  ':-&': '🤢',
};

// GIF detection patterns
const GIF_PATTERNS = [
  /!\[.*?\]\((.*?\.gif)\)/gi, // Markdown image syntax
  /<img[^>]+src=["'](.*?\.gif)["'][^>]*>/gi, // HTML img tag
  /https?:\/\/[^\s]+\.gif/gi, // Direct GIF URL
];

/**
 * Convert text emoticons to emoji
 * @param text - Text containing emoticons
 * @returns Text with emoticons converted to emoji
 */
export function convertEmoticonToEmoji(text: string): string {
  let result = text;
  
  // Sort by length (longest first) to avoid partial replacements
  const emoticons = Object.keys(EMOTICON_MAP).sort((a, b) => b.length - a.length);
  
  for (const emoticon of emoticons) {
    // Use word boundaries to avoid partial replacements
    const regex = new RegExp(`\\b${emoticon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    result = result.replace(regex, EMOTICON_MAP[emoticon]);
  }
  
  return result;
}

/**
 * Extract GIF URLs from text or HTML content
 * @param content - Content to search for GIFs
 * @returns Array of GIF URLs
 */
export function extractGIFUrls(content: string): string[] {
  const gifs: string[] = [];
  
  for (const pattern of GIF_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const url = match[1];
      if (url && !gifs.includes(url)) {
        gifs.push(url);
      }
    }
  }
  
  return gifs;
}

/**
 * Check if a URL is a GIF
 * @param url - URL to check
 * @returns True if URL is a GIF
 */
export function isGifUrl(url: string): boolean {
  return /\.gif$/i.test(url);
}

/**
 * Get emoji picker data
 * @returns Array of emoji categories with emoji
 */
export function getEmojiPickerData() {
  return [
    {
      category: 'Smileys',
      emoji: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😌', '😔', '😑', '😐', '😏', '😒', '🙁', '😕', '😲', '😞', '😖', '😢', '😭', '😤', '😠', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
    },
    {
      category: 'Gestures',
      emoji: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🦾', '🦿', '👂', '👃', '🧠', '🦷', '🦴', '🫀', '🫁'],
    },
    {
      category: 'Hearts',
      emoji: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤'],
    },
    {
      category: 'Popular',
      emoji: ['😂', '❤️', '😍', '🤔', '👍', '😊', '🎉', '😘', '💕', '😭', '😱', '😍', '🔥', '💯', '✨', '🙌', '😎', '🤣', '💪', '😜'],
    },
  ];
}

/**
 * Get popular GIF search suggestions
 * @returns Array of popular GIF search terms
 */
export function getPopularGIFSearches(): string[] {
  return [
    'funny',
    'cute',
    'happy',
    'sad',
    'love',
    'dance',
    'cat',
    'dog',
    'reaction',
    'fail',
    'win',
    'excited',
    'confused',
    'angry',
    'tired',
    'sleep',
    'eating',
    'running',
    'jumping',
    'celebration',
  ];
}
