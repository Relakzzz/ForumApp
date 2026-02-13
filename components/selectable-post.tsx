import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { QuotePopup } from './quote-popup';

interface SelectablePostProps {
  postId: number;
  topicId: number;
  authorName: string;
  authorUsername: string;
  timestamp: string;
  content: React.ReactNode;
  onSelectText?: (text: string) => void;
}

export function SelectablePost({
  postId,
  topicId,
  authorName,
  authorUsername,
  timestamp,
  content,
  onSelectText,
}: SelectablePostProps) {
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const handleTextSelection = (event: any) => {
    try {
      // Get selected text from the event
      const text = event.nativeEvent?.text || '';
      if (text && text.trim().length > 0) {
        setSelectedText(text);
        setShowQuotePopup(true);
        onSelectText?.(text);
      }
    } catch (error) {
      console.log('Text selection not available on this platform');
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold">{authorName}</ThemedText>
          <ThemedText type="default" style={styles.timestamp}>
            {timestamp}
          </ThemedText>
        </View>

        <Pressable
          onLongPress={handleTextSelection}
          delayLongPress={500}
          style={styles.contentContainer}
        >
          {content}
        </Pressable>

        <Pressable
          style={styles.quoteButton}
          onPress={() => {
            setSelectedText('');
            setShowQuotePopup(true);
          }}
        >
          <ThemedText style={styles.quoteButtonText}>Quote Post</ThemedText>
        </Pressable>
      </View>

      <QuotePopup
        visible={showQuotePopup}
        selectedText={selectedText}
        postId={postId}
        authorName={authorName}
        authorUsername={authorUsername}
        timestamp={timestamp}
        topicId={topicId}
        onClose={() => {
          setShowQuotePopup(false);
          setSelectedText('');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  contentContainer: {
    marginBottom: 8,
  },
  quoteButton: {
    backgroundColor: '#e8f0ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  quoteButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
