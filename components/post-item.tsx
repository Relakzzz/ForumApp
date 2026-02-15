import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface PostItemProps {
  post: {
    id: number;
    topic_id: number;
    topic_title: string;
    cooked: string;
    created_at: string;
  };
  formatDate: (date: string) => string;
}

export function PostItem({ post, formatDate }: PostItemProps) {
  const router = useRouter();
  const borderColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");
  const pressedColor = useThemeColor({}, "tint");

  const handlePress = () => {
    router.push({
      pathname: "/topic/[id]",
      params: { id: post.topic_id.toString() },
    });
  };

  const cleanContent = post.cooked?.replace(/<[^>]*>/g, "") || "";

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.05)",
          borderColor: borderColor,
        },
      ]}
    >
      <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>
        {post.topic_title}
      </ThemedText>
      <ThemedText type="default" style={styles.preview} numberOfLines={2}>
        {cleanContent}
      </ThemedText>
      <ThemedText type="default" style={styles.date}>
        {formatDate(post.created_at)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 15,
  },
  preview: {
    opacity: 0.6,
    marginTop: 4,
    fontSize: 14,
  },
  date: {
    opacity: 0.4,
    fontSize: 12,
    marginTop: 4,
  },
});
