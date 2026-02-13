import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { chunkText, getTextPreview, getTextStats } from '@/lib/text-chunker';
import { ThemedText } from './themed-text';
import { EmojiText } from './emoji-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface TextChunksProps {
  text: string;
  maxCharsPerChunk?: number;
}

export function TextChunks({ text }: TextChunksProps) {
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'icon');
  
  // Chunk the text
  const chunks = chunkText(text);
  
  // Track which chunks are expanded
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(
    new Set(chunks.length === 1 ? [chunks[0].id] : [])
  );

  const toggleChunk = (chunkId: string) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId);
    } else {
      newExpanded.add(chunkId);
    }
    setExpandedChunks(newExpanded);
  };

  // If only one chunk, display it directly
  if (chunks.length === 1) {
    return (
      <EmojiText style={styles.text}>
        {chunks[0].text}
      </EmojiText>
    );
  }

  // Multiple chunks - display with expand/collapse
  const stats = getTextStats(text);

  return (
    <View>
      {/* Summary header for long posts */}
      <View style={[styles.summaryHeader, { borderBottomColor: borderColor }]}>
        <ThemedText style={styles.summaryText}>
          Long post ({stats.words} words, {Math.ceil(stats.chars / 1000)}K characters)
        </ThemedText>
        <ThemedText style={[styles.readingTime, { color: tintColor }]}>
          ~{stats.readingTime} min read
        </ThemedText>
      </View>

      {/* Render each chunk */}
      {chunks.map((chunk, index) => {
        const isExpanded = expandedChunks.has(chunk.id);
        const preview = getTextPreview(chunk.text, 150);

        return (
          <View key={chunk.id} style={styles.chunkContainer}>
            {/* Chunk header with expand/collapse button */}
            <Pressable
              onPress={() => toggleChunk(chunk.id)}
              style={[
                styles.chunkHeader,
                { borderBottomColor: borderColor },
              ]}
            >
              <View style={styles.chunkTitleContainer}>
                <ThemedText style={styles.chunkNumber}>
                  Part {index + 1}
                </ThemedText>
                <ThemedText style={[styles.chunkSize, { color: borderColor }]}>
                  ({chunk.charCount} chars)
                </ThemedText>
              </View>
              <ThemedText style={[styles.expandIcon, { color: tintColor }]}>
                {isExpanded ? '▼' : '▶'}
              </ThemedText>
            </Pressable>

            {/* Chunk content */}
            {isExpanded ? (
              <EmojiText style={[styles.text, styles.chunkContent]}>
                {chunk.text}
              </EmojiText>
            ) : (
              <View style={styles.previewContainer}>
                <View style={styles.previewText}>
                  <EmojiText style={[styles.text, styles.preview]}>
                    {preview}
                  </EmojiText>
                </View>
                <Pressable
                  onPress={() => toggleChunk(chunk.id)}
                  style={[styles.expandButton, { backgroundColor: tintColor }]}
                >
                  <ThemedText style={styles.expandButtonText}>
                    Read More
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  summaryHeader: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  readingTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  chunkContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chunkHeader: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  chunkTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chunkNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  chunkSize: {
    fontSize: 11,
    opacity: 0.6,
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: '600',
  },
  chunkContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 0,
  },
  previewContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  previewText: {
    maxHeight: 80,
    overflow: 'hidden',
    marginBottom: 10,
  },
  preview: {
    opacity: 0.8,
    marginBottom: 0,
  },
  expandButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  expandButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
