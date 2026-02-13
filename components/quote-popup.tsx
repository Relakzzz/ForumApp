import React from 'react';
import { View, Pressable, StyleSheet, Modal, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { useQuotes, type Quote } from '@/contexts/quote-context';

interface QuotePopupProps {
  visible: boolean;
  selectedText: string;
  postId: number;
  authorName: string;
  authorUsername: string;
  timestamp: string;
  topicId: number;
  onClose: () => void;
}

export function QuotePopup({
  visible,
  selectedText,
  postId,
  authorName,
  authorUsername,
  timestamp,
  topicId,
  onClose,
}: QuotePopupProps) {
  const { addQuote } = useQuotes();

  const handleQuote = () => {
    if (!selectedText.trim()) {
      Alert.alert('Error', 'Please select some text to quote');
      return;
    }

    const quote: Quote = {
      id: `${postId}-${Date.now()}`,
      postId,
      authorName,
      authorUsername,
      selectedText,
      timestamp,
      topicId,
    };

    addQuote(quote);
    onClose();
    Alert.alert('Success', 'Quote added! You can now reply with this quote.');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.popup}>
          <ThemedText type="subtitle" style={styles.title}>
            Quote this text?
          </ThemedText>

          <View style={styles.preview}>
            <ThemedText type="default" numberOfLines={3}>
              "{selectedText}"
            </ThemedText>
          </View>

          <ThemedText type="default" style={styles.author}>
            — {authorName} (@{authorUsername})
          </ThemedText>

          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </Pressable>

            <Pressable style={[styles.button, styles.quoteButton]} onPress={handleQuote}>
              <ThemedText style={styles.quoteButtonText}>Add Quote</ThemedText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    maxWidth: 400,
  },
  title: {
    marginBottom: 12,
  },
  preview: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  quoteButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#333',
    fontWeight: '600',
  },
  quoteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
