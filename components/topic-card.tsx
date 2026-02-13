import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as DiscourseAPI from "@/lib/discourse-api";

interface TopicCardProps {
  topic: DiscourseAPI.Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const router = useRouter();
  const borderColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");
  const pressedColor = useThemeColor({}, "tint");

  const handlePress = () => {
    try {
      console.log("[TopicCard] Navigating to topic:", topic.id);
      router.push({
        pathname: "/topic/[id]",
        params: { id: topic.id.toString() },
      });
    } catch (error) {
      console.error("[TopicCard] Navigation error:", error);
    }
  };

  const relativeTime = DiscourseAPI.formatRelativeTime(topic.bumped_at || topic.created_at);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? pressedColor : backgroundColor,
          borderBottomColor: borderColor,
        },
      ]}
      android_ripple={{ color: pressedColor, foreground: true }}
    >
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>
          {topic.title}
        </ThemedText>

        <View style={styles.metadata}>
          {topic.category_name && (
            <View style={[styles.badge, { backgroundColor: "#A1CEDC" }]}>
              <ThemedText style={[styles.badgeText, { color: "#1D3D47" }]} numberOfLines={1}>
                {topic.category_name}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <ThemedText type="link" style={styles.statValue}>
              {topic.reply_count || 0}
            </ThemedText>
            <ThemedText type="link" style={styles.statLabel}>
              replies
            </ThemedText>
          </View>

          <View style={styles.stat}>
            <ThemedText type="link" style={styles.statValue}>
              {topic.views || 0}
            </ThemedText>
            <ThemedText type="link" style={styles.statLabel}>
              views
            </ThemedText>
          </View>

          <View style={[styles.stat, { flex: 1 }]}>
            <ThemedText type="link" style={styles.statValue} numberOfLines={1}>
              {relativeTime}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginBottom: 1,
    borderBottomWidth: 1,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  metadata: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  stat: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 12,
  },
});
