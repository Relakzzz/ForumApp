import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
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

  const images = [
    {
      url: url,
      props: {
        // Pass props to the underlying Image component if needed
      },
    },
  ];

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
            <ActivityIndicator size="small" color="#fff" />
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
        transparent={true}
        onRequestClose={() => setIsFullscreen(false)}
      >
        <ImageViewer
          imageUrls={images}
          onCancel={() => setIsFullscreen(false)}
          enableSwipeDown={true}
          saveToLocalByLongPress={false}
          renderHeader={() => (
            <Pressable
              style={[styles.closeButton, { top: Math.max(insets.top, 20) }]}
              onPress={() => setIsFullscreen(false)}
            >
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          )}
          renderFooter={() => (
            alt ? (
              <View style={[styles.footer, { marginBottom: Math.max(insets.bottom, 20) }]}>
                <ThemedText style={styles.altText}>{alt}</ThemedText>
              </View>
            ) : null
          )}
          loadingRender={() => <ActivityIndicator size="large" color="#fff" />}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    position: 'absolute',
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
  footer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  altText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
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
