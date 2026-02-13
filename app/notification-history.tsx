import { useState, useEffect } from "react";
import { StyleSheet, FlatList, Pressable, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNotifications } from "@/hooks/use-notifications";
import { clearNotificationLog } from "@/lib/notification-service";

export default function NotificationHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications, loading, reload, markAsRead } = useNotifications();
  const [clearing, setClearing] = useState(false);

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "icon");

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearNotificationLog();
      await reload();
    } catch (error) {
      console.error("[NotificationHistory] Error clearing notifications:", error);
    } finally {
      setClearing(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("[NotificationHistory] Error marking as read:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: any) => (
    <Pressable
      onPress={() => handleMarkAsRead(item.id)}
      style={[
        styles.notificationItem,
        {
          borderBottomColor: borderColor,
          backgroundColor: item.read ? "transparent" : tintColor + "10",
        },
      ]}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>
            {item.topicTitle}
          </ThemedText>
          {!item.read && (
            <View style={[styles.unreadBadge, { backgroundColor: tintColor }]} />
          )}
        </View>
        <ThemedText type="default" style={styles.notificationUsername}>
          {item.username}
        </ThemedText>
        <ThemedText type="default" style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </ThemedText>
        <ThemedText type="default" style={styles.notificationTime}>
          {formatDate(item.timestamp)}
        </ThemedText>
      </View>
    </Pressable>
  );

  const renderEmpty = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No Notifications
      </ThemedText>
      <ThemedText type="default" style={styles.emptyText}>
        You don't have any notifications yet. Follow topics to get started!
      </ThemedText>
    </ThemedView>
  );

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <ThemedText style={styles.backText}>← Back</ThemedText>
      </Pressable>
      <ThemedText type="title">Notifications</ThemedText>
      {notifications.length > 0 && (
        <Pressable
          onPress={handleClearAll}
          disabled={clearing}
          style={({ pressed }) => [
            styles.clearButton,
            { opacity: pressed || clearing ? 0.6 : 1 },
          ]}
        >
          {clearing ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : (
            <ThemedText style={[styles.clearButtonText, { color: tintColor }]}>
              Clear All
            </ThemedText>
          )}
        </Pressable>
      )}
    </ThemedView>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderNotification}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    marginRight: -8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  notificationItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationContent: {
    gap: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  notificationUsername: {
    fontSize: 12,
    opacity: 0.6,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
  },
  notificationTime: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
});
