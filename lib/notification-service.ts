import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NotificationPreferences {
  enabled: boolean;
  frequency: "immediate" | "daily" | "off";
  followedTopics: number[];
  mentionNotifications: boolean;
  replyNotifications: boolean;
}

export interface StoredNotification {
  id: string;
  topicId: number;
  topicTitle: string;
  username: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const PREFERENCES_KEY = "notification_preferences";
const NOTIFICATIONS_LOG_KEY = "notification_log";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[NotificationService] Error getting preferences:", error);
  }

  // Return default preferences
  return {
    enabled: true,
    frequency: "immediate",
    followedTopics: [],
    mentionNotifications: true,
    replyNotifications: true,
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...preferences };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("[NotificationService] Error updating preferences:", error);
    throw error;
  }
}

/**
 * Add a topic to the user's followed list
 */
export async function followTopic(topicId: number): Promise<void> {
  try {
    const preferences = await getNotificationPreferences();
    if (!preferences.followedTopics.includes(topicId)) {
      preferences.followedTopics.push(topicId);
      await updateNotificationPreferences(preferences);
    }
  } catch (error) {
    console.error("[NotificationService] Error following topic:", error);
    throw error;
  }
}

/**
 * Remove a topic from the user's followed list
 */
export async function unfollowTopic(topicId: number): Promise<void> {
  try {
    const preferences = await getNotificationPreferences();
    preferences.followedTopics = preferences.followedTopics.filter((id) => id !== topicId);
    await updateNotificationPreferences(preferences);
  } catch (error) {
    console.error("[NotificationService] Error unfollowing topic:", error);
    throw error;
  }
}

/**
 * Check if a topic is being followed
 */
export async function isTopicFollowed(topicId: number): Promise<boolean> {
  try {
    const preferences = await getNotificationPreferences();
    return preferences.followedTopics.includes(topicId);
  } catch (error) {
    console.error("[NotificationService] Error checking if topic is followed:", error);
    return false;
  }
}

/**
 * Get all followed topics
 */
export async function getFollowedTopics(): Promise<number[]> {
  try {
    const preferences = await getNotificationPreferences();
    return preferences.followedTopics;
  } catch (error) {
    console.error("[NotificationService] Error getting followed topics:", error);
    return [];
  }
}

/**
 * Send a local notification
 */
export async function sendNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: "default",
        badge: 1,
      },
      trigger: null, // Send immediately
    });

    return notificationId;
  } catch (error) {
    console.error("[NotificationService] Error sending notification:", error);
    throw error;
  }
}

/**
 * Store a notification in the log
 */
export async function logNotification(notification: StoredNotification): Promise<void> {
  try {
    const log = await getNotificationLog();
    log.unshift(notification);
    // Keep only the last 50 notifications
    const trimmed = log.slice(0, 50);
    await AsyncStorage.setItem(NOTIFICATIONS_LOG_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("[NotificationService] Error logging notification:", error);
    throw error;
  }
}

/**
 * Get notification log
 */
export async function getNotificationLog(): Promise<StoredNotification[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_LOG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[NotificationService] Error getting notification log:", error);
  }

  return [];
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const log = await getNotificationLog();
    const notification = log.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await AsyncStorage.setItem(NOTIFICATIONS_LOG_KEY, JSON.stringify(log));
    }
  } catch (error) {
    console.error("[NotificationService] Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Clear notification log
 */
export async function clearNotificationLog(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_LOG_KEY);
  } catch (error) {
    console.error("[NotificationService] Error clearing notification log:", error);
    throw error;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const log = await getNotificationLog();
    return log.filter((n) => !n.read).length;
  } catch (error) {
    console.error("[NotificationService] Error getting unread count:", error);
    return 0;
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("[NotificationService] Error requesting permissions:", error);
    return false;
  }
}
