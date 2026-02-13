import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Modal, Text } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { getEmojiPickerData } from '@/lib/emoji-parser';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  visible: boolean;
  onClose: () => void;
}

export function EmojiPicker({ onEmojiSelect, visible, onClose }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const emojiData = getEmojiPickerData();
  const currentCategory = emojiData[selectedCategory];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle">Select Emoji</ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeText}>✕</ThemedText>
          </Pressable>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {emojiData.map((category, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedCategory(index)}
              style={[
                styles.categoryTab,
                selectedCategory === index && styles.categoryTabActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryTabText,
                  selectedCategory === index && styles.categoryTabTextActive,
                ]}
              >
                {category.category.charAt(0)}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Emoji Grid */}
        <ScrollView style={styles.emojiGrid} contentContainerStyle={styles.emojiGridContent}>
          {currentCategory.emoji.map((emoji, index) => (
            <Pressable
              key={index}
              onPress={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
              style={styles.emojiButton}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryTabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryTabsContent: {
    paddingHorizontal: 8,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  categoryTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  categoryTabText: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#007AFF',
  },
  emojiGrid: {
    flex: 1,
  },
  emojiGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  emojiButton: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 4,
  },
  emojiText: {
    fontSize: 32,
  },
});
