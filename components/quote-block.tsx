import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { useQuotes, type Quote } from '@/contexts/quote-context';

interface QuoteBlockProps {
  quote: Quote;
  editable?: boolean;
}

export function QuoteBlock({ quote, editable = true }: QuoteBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(quote.selectedText);
  const { removeQuote, updateQuote } = useQuotes();

  const handleSaveEdit = () => {
    if (!editedText.trim()) {
      Alert.alert('Error', 'Quote text cannot be empty');
      return;
    }
    updateQuote(quote.id, editedText);
    setIsEditing(false);
  };

  const handleRemove = () => {
    removeQuote(quote.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.quoteBlock}>
        <View style={styles.quoteHeader}>
          <ThemedText type="defaultSemiBold" style={styles.author}>
            {quote.authorName}
          </ThemedText>
          <ThemedText type="default" style={styles.timestamp}>
            {quote.timestamp}
          </ThemedText>
        </View>

        {isEditing ? (
          <TextInput
            style={styles.editInput}
            multiline
            value={editedText}
            onChangeText={setEditedText}
            placeholder="Edit quote..."
          />
        ) : (
          <ThemedText type="default" style={styles.quoteText}>
            {editedText}
          </ThemedText>
        )}

        {editable && (
          <View style={styles.actionContainer}>
            {isEditing ? (
              <>
                <Pressable
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setEditedText(quote.selectedText);
                    setIsEditing(false);
                  }}
                >
                  <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveEdit}
                >
                  <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => setIsEditing(true)}
                >
                  <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={handleRemove}
                >
                  <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                </Pressable>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  quoteBlock: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  quoteHeader: {
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  editInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
    minHeight: 60,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#e8f0ff',
  },
  removeButton: {
    backgroundColor: '#ffe8e8',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  removeButtonText: {
    fontSize: 12,
    color: '#ff3b30',
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
