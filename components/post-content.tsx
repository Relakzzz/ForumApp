import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

import { parseImagesFromHtml, stripHtmlTags } from '@/lib/image-parser';
import { convertEmoticonToEmoji, extractGIFUrls } from '@/lib/emoji-parser';
import { ThemedText } from './themed-text';
import { EmojiText } from './emoji-text';
import { PostImage } from './post-image';

interface PostContentProps {
  html: string;
  cooked?: string;
}

export function PostContent({ html, cooked }: PostContentProps) {
  // Use cooked (rendered) HTML if available, otherwise use raw HTML
  const content = cooked || html;

  if (!content) {
    return (
      <ThemedText style={styles.emptyText}>
        [Post content not available]
      </ThemedText>
    );
  }

  // Extract images from the HTML
  const images = parseImagesFromHtml(content);
  
  // Extract text content
  const textContent = stripHtmlTags(content);
  
  // Convert emoticons to emoji
  const textWithEmoji = convertEmoticonToEmoji(textContent);
  
  // Extract GIFs from content
  const gifs = extractGIFUrls(content);

  return (
    <View style={styles.container}>
      {/* Display text content with emoji */}
      {textWithEmoji && (
        <EmojiText style={styles.text}>
          {textWithEmoji}
        </EmojiText>
      )}

      {/* Display images */}
      {images.map((image, index) => (
        <PostImage
          key={`${image.url}-${index}`}
          url={image.url}
          alt={image.alt}
          width={image.width || 280}
          height={image.height || 200}
        />
      ))}
      
      {/* Display GIFs */}
      {gifs.map((gif, index) => (
        <View key={`gif-${index}`} style={styles.gifContainer}>
          <Image
            source={{ uri: gif }}
            style={styles.gif}
            resizeMode="cover"
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.6,
  },
  gifContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gif: {
    width: '100%',
    height: 200,
  },
});
