import { useState, useEffect, useCallback } from "react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  followTopic,
  unfollowTopic,
  isTopicFollowed,
  getFollowedTopics,
  getNotificationLog,
  markNotificationAsRead,
  getUnreadNotificationCount,
  type NotificationPreferences,
  type StoredNotification,
} from "@/lib/notification-service";

export function useNotifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [followedTopics, setFollowedTopics] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
      setFollowedTopics(prefs.followedTopics);

      const log = await getNotificationLog();
      setNotifications(log);

      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("[useNotifications] Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      try {
        await updateNotificationPreferences(updates);
        const updated = await getNotificationPreferences();
        setPreferences(updated);
      } catch (error) {
        console.error("[useNotifications] Error updating preferences:", error);
        throw error;
      }
    },
    []
  );

  const follow = useCallback(async (topicId: number) => {
    try {
      await followTopic(topicId);
      setFollowedTopics((prev) => [...new Set([...prev, topicId])]);
    } catch (error) {
      console.error("[useNotifications] Error following topic:", error);
      throw error;
    }
  }, []);

  const unfollow = useCallback(async (topicId: number) => {
    try {
      await unfollowTopic(topicId);
      setFollowedTopics((prev) => prev.filter((id) => id !== topicId));
    } catch (error) {
      console.error("[useNotifications] Error unfollowing topic:", error);
      throw error;
    }
  }, []);

  const isFollowing = useCallback(
    (topicId: number) => followedTopics.includes(topicId),
    [followedTopics]
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("[useNotifications] Error marking as read:", error);
      throw error;
    }
  }, []);

  return {
    preferences,
    followedTopics,
    notifications,
    unreadCount,
    loading,
    updatePreferences,
    follow,
    unfollow,
    isFollowing,
    markAsRead,
    reload: loadPreferences,
  };
}
