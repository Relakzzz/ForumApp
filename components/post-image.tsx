import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface PostImageProps {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export function PostImage({ url, alt, width = 300, height = 200 }: PostImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const insets = useSafeAreaInsets();

  if (!url) return null;

  const handleImagePress = () => {
    setShowTooltip(false);
    setIsFullscreen(true);
  };

  const handleLongPress = () => {
    if (alt) {
      setShowTooltip(true);
      // Auto-hide tooltip after 2 seconds
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  return (
    <>
      <Pressable
        onPress={handleImagePress}
        onLongPress={handleLongPress}
        delayLongPress={300}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: url }}
          style={{ width, height }}
          contentFit="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          placeholder={require('@/assets/images/icon.png')}
          cachePolicy="memory-disk"
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ThemedText>Loading...</ThemedText>
          </View>
        )}
        {showTooltip && alt && (
          <View style={styles.tooltip}>
            <ThemedText style={styles.tooltipText}>{alt}</ThemedText>
          </View>
        )}
      </Pressable>

      <Modal
        visible={isFullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <ThemedView
          style={[
            styles.fullscreenContainer,
            {
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
              paddingLeft: Math.max(insets.left, 20),
              paddingRight: Math.max(insets.right, 20),
            },
          ]}
        >
          <Pressable
            style={styles.closeButton}
            onPress={() => setIsFullscreen(false)}
          >
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </Pressable>

          <Image
            source={{ uri: url }}
            style={styles.fullscreenImage}
            contentFit="contain"
            cachePolicy="memory-disk"
          />

          {alt && (
            <ThemedText style={styles.altText}>Photo: {alt}</ThemedText>
          )}
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  altText: {
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
