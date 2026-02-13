import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Shimmer animation for skeleton loader
 */
function ShimmerPlaceholder({ width = '100%', height = 16 }: { width?: DimensionValue; height?: number }) {
  const opacity = useSharedValue(0.3);
  const borderColor = useThemeColor({}, 'icon');

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: borderColor,
          borderRadius: 4,
          marginBottom: 8,
        } as any,
        animatedStyle,
      ]}
    />
  );
}

/**
 * Skeleton loader for a single post
 */
export function PostSkeletonLoader() {
  return (
    <View style={styles.post}>
      {/* Header with avatar and username */}
      <View style={styles.postHeader}>
        <ShimmerPlaceholder width={40} height={40} />
        <View style={{ flex: 1 }}>
          <ShimmerPlaceholder width="60%" height={14} />
          <ShimmerPlaceholder width="40%" height={12} />
        </View>
      </View>

      {/* Post content lines */}
      <View style={styles.postContent}>
        <ShimmerPlaceholder width="100%" height={14} />
        <ShimmerPlaceholder width="100%" height={14} />
        <ShimmerPlaceholder width="85%" height={14} />
        <ShimmerPlaceholder width="100%" height={14} />
        <ShimmerPlaceholder width="70%" height={14} />
      </View>

      {/* Quote button placeholder */}
      <View style={styles.quoteButtonPlaceholder}>
        <ShimmerPlaceholder width={80} height={28} />
      </View>
    </View>
  );
}

/**
 * Skeleton loader for the topic header
 */
export function TopicHeaderSkeletonLoader() {
  return (
    <View style={styles.header}>
      {/* Title */}
      <ShimmerPlaceholder width="100%" height={24} />
      <ShimmerPlaceholder width="90%" height={20} />

      {/* Topic info */}
      <View style={{ marginTop: 12 }}>
        <ShimmerPlaceholder width="70%" height={12} />
        <ShimmerPlaceholder width="60%" height={12} />
      </View>
    </View>
  );
}

/**
 * Full skeleton loader for topic detail screen
 */
export function TopicDetailSkeletonLoader() {
  return (
    <View style={styles.container}>
      <TopicHeaderSkeletonLoader />
      <PostSkeletonLoader />
      <PostSkeletonLoader />
      <PostSkeletonLoader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  post: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  postContent: {
    marginLeft: 48,
    marginBottom: 12,
  },
  quoteButtonPlaceholder: {
    marginTop: 8,
    marginLeft: 48,
  },
});
