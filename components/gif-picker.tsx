import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Modal, TextInput, Image, ActivityIndicator } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { getPopularGIFSearches } from '@/lib/emoji-parser';

interface GIFPickerProps {
  onGIFSelect: (gifUrl: string) => void;
  visible: boolean;
  onClose: () => void;
}

// Mock GIF data - in a real app, this would come from Giphy or Tenor API
const MOCK_GIFS = [
  'https://media.giphy.com/media/g9GUusdUZsKFO/giphy.gif',
  'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif',
  'https://media.giphy.com/media/3o85xIO33l7RlmLR20/giphy.gif',
  'https://media.giphy.com/media/3o6ZtpWz664SPmo5Nm/giphy.gif',
  'https://media.giphy.com/media/l0HlDtKPoYJhFtgQ4/giphy.gif',
  'https://media.giphy.com/media/3o7TKU2VgIZnrIZ8P6/giphy.gif',
];

export function GIFPicker({ onGIFSelect, visible, onClose }: GIFPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const popularSearches = getPopularGIFSearches();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleGIFSelect = (gifUrl: string) => {
    onGIFSelect(gifUrl);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle">Select GIF</ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeText}>✕</ThemedText>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search GIFs..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>

        {/* Popular Searches */}
        {!searchQuery && (
          <View style={styles.popularContainer}>
            <ThemedText type="defaultSemiBold" style={styles.popularTitle}>
              Popular Searches
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.popularSearches}
              contentContainerStyle={styles.popularSearchesContent}
            >
              {popularSearches.map((search, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleSearch(search)}
                  style={styles.searchTag}
                >
                  <ThemedText style={styles.searchTagText}>{search}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* GIF Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <ScrollView style={styles.gifGrid} contentContainerStyle={styles.gifGridContent}>
            {MOCK_GIFS.map((gif, index) => (
              <Pressable
                key={index}
                onPress={() => handleGIFSelect(gif)}
                style={styles.gifItem}
              >
                <Image
                  source={{ uri: gif }}
                  style={styles.gifImage}
                  onError={() => {
                    // Handle image load error
                  }}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000',
  },
  popularContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  popularTitle: {
    marginBottom: 8,
  },
  popularSearches: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  popularSearchesContent: {
    paddingRight: 16,
  },
  searchTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  searchTagText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifGrid: {
    flex: 1,
  },
  gifGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gifItem: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
});
