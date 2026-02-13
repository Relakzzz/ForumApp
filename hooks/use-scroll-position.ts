import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useCallback } from 'react';

interface ScrollPosition {
  offset: number;
  timestamp: number;
}

const SCROLL_POSITION_KEY = 'scroll_position_';

/**
 * Hook to manage scroll position persistence for topics
 * Saves scroll position when navigating away and restores it when returning
 */
export function useScrollPosition(topicId: number | null) {
  const scrollPositionRef = useRef<number>(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save scroll position to AsyncStorage
  const saveScrollPosition = useCallback(async (offset: number) => {
    if (!topicId) return;

    try {
      const key = `${SCROLL_POSITION_KEY}${topicId}`;
      const position: ScrollPosition = {
        offset,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(position));
      console.log(`[useScrollPosition] Saved scroll position for topic ${topicId}:`, offset);
    } catch (error) {
      console.error('[useScrollPosition] Error saving scroll position:', error);
    }
  }, [topicId]);

  // Load scroll position from AsyncStorage
  const loadScrollPosition = useCallback(async (): Promise<number | null> => {
    if (!topicId) return null;

    try {
      const key = `${SCROLL_POSITION_KEY}${topicId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const position: ScrollPosition = JSON.parse(data);
        console.log(`[useScrollPosition] Loaded scroll position for topic ${topicId}:`, position.offset);
        return position.offset;
      }
    } catch (error) {
      console.error('[useScrollPosition] Error loading scroll position:', error);
    }
    return null;
  }, [topicId]);

  // Clear scroll position from AsyncStorage
  const clearScrollPosition = useCallback(async () => {
    if (!topicId) return;

    try {
      const key = `${SCROLL_POSITION_KEY}${topicId}`;
      await AsyncStorage.removeItem(key);
      console.log(`[useScrollPosition] Cleared scroll position for topic ${topicId}`);
    } catch (error) {
      console.error('[useScrollPosition] Error clearing scroll position:', error);
    }
  }, [topicId]);

  // Debounced save function to avoid excessive writes
  const debouncedSaveScrollPosition = useCallback((offset: number) => {
    scrollPositionRef.current = offset;

    // Clear existing timeout
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 500ms of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveScrollPosition(offset);
    }, 500);
  }, [saveScrollPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveScrollPosition: debouncedSaveScrollPosition,
    loadScrollPosition,
    clearScrollPosition,
  };
}
