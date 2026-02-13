import { useState, useEffect } from "react";
import { StyleSheet, Pressable, ScrollView, Image, ActivityIndicator, Switch, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthForum } from "@/hooks/use-auth-forum";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNotifications } from "@/hooks/use-notifications";

const FORUM_URL = "https://www.horlogeforum.nl";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuthForum();
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");

  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
  }, [colorScheme]);

  useFocusEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentPosts();
    }
  });

  const fetchRecentPosts = async () => {
    if (!user) return;
    try {
      setPostsLoading(true);
      const response = await fetch(`${FORUM_URL}/posts.json?username=${user.username}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setRecentPosts(data.latest_posts || []);
      }
    } catch (error) {
      console.error("[Profile] Error fetching recent posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(tabs)");
  };

  const getAvatarUrl = (template: string) => {
    if (!template) return "";
    return `${FORUM_URL}${template.replace("{size}", "96")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      {isAuthenticated && user ? (
        <>
          <ThemedView style={styles.header}>
            {user.avatar_template && (
              <Image source={{ uri: getAvatarUrl(user.avatar_template) }} style={styles.avatar} />
            )}
            <ThemedView style={styles.userInfo}>
              <ThemedText type="title">{user.name || user.username}</ThemedText>
              <ThemedText type="default" style={styles.username}>
                @{user.username}
              </ThemedText>
              <ThemedText type="default" style={styles.memberSince}>
                Member since {formatDate(user.created_at)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={[styles.statsContainer, { borderColor }]}>
            <ThemedView style={styles.statItem}>
              <ThemedText type="title" style={styles.statNumber}>
                {user.post_count}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Posts
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="title" style={styles.statNumber}>
                {user.topic_count}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Topics
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="title" style={styles.statNumber}>
                {user.trust_level}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Trust Level
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {recentPosts.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Recent Posts
              </ThemedText>
              {postsLoading ? (
                <ActivityIndicator color={tintColor} />
              ) : (
                recentPosts.map((post) => (
                  <ThemedView key={post.id} style={styles.postItem}>
                    <ThemedText type="defaultSemiBold" numberOfLines={2}>
                      {post.topic_title}
                    </ThemedText>
                    <ThemedText type="default" style={styles.postPreview} numberOfLines={2}>
                      {post.cooked?.replace(/<[^>]*>/g, "") || ""}
                    </ThemedText>
                    <ThemedText type="default" style={styles.postDate}>
                      {formatDate(post.created_at)}
                    </ThemedText>
                  </ThemedView>
                ))
              )}
            </ThemedView>
          )}

          <ThemedView style={styles.actions}>
            <Pressable
              onPress={() => Alert.alert("Coming Soon", "Topic creation feature coming in next update")}
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                { backgroundColor: tintColor, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <ThemedText style={styles.buttonText}>Create Topic</ThemedText>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                { borderColor, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <ThemedText style={[styles.buttonText, { color: "#FF3B30" }]}>Logout</ThemedText>
            </Pressable>
          </ThemedView>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Appearance
            </ThemedText>

            <View
              style={[
                styles.settingRow,
                {
                  borderBottomColor: borderColor,
                },
              ]}
            >
              <ThemedText>Dark Mode</ThemedText>
              <Switch
                value={isDarkMode}
                onValueChange={() => {}}
                trackColor={{ false: "#767577", true: tintColor }}
                thumbColor={isDarkMode ? tintColor : "#f4f3f4"}
              />
            </View>
          </View>
        </>
      ) : (
        <ThemedView style={styles.loginContainer}>
          <ThemedText type="title" style={styles.loginTitle}>
            Sign In Required
          </ThemedText>
          <ThemedText type="default" style={styles.loginSubtitle}>
            Log in to your Horlogeforum account to post topics, reply to discussions, and access your profile.
          </ThemedText>

          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: tintColor, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
          </Pressable>

          <ThemedText type="default" style={styles.loginInfo}>
            You can browse the forum without logging in. Sign in to participate in discussions.
          </ThemedText>

          <View style={[styles.section, { marginTop: 40 }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Appearance
            </ThemedText>

            <View
              style={[
                styles.settingRow,
                {
                  borderBottomColor: borderColor,
                },
              ]}
            >
              <ThemedText>Dark Mode</ThemedText>
              <Switch
                value={isDarkMode}
                onValueChange={() => {}}
                trackColor={{ false: "#767577", true: tintColor }}
                thumbColor={isDarkMode ? tintColor : "#f4f3f4"}
              />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              About
            </ThemedText>

            <View
              style={[
                styles.settingRow,
                {
                  borderBottomColor: borderColor,
                },
              ]}
            >
              <ThemedText>App Version</ThemedText>
              <ThemedText type="link">1.0.0</ThemedText>
            </View>

            <View
              style={[
                styles.settingRow,
                {
                  borderBottomColor: borderColor,
                },
              ]}
            >
              <ThemedText>Forum</ThemedText>
              <ThemedText type="link">horlogeforum.nl</ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Information
            </ThemedText>

            <View style={styles.infoBox}>
              <ThemedText style={styles.infoText}>
                Horlogeforum is an independent mobile app for the Horlogeforum.nl community. This app is not officially
                affiliated with Horlogeforum.nl.
              </ThemedText>
            </View>

            <View style={styles.infoBox}>
              <ThemedText style={styles.infoText}>
                This app uses the Discourse API to fetch forum data. All data is fetched in real-time from the official
                forum server.
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    opacity: 0.6,
    marginTop: 4,
  },
  memberSince: {
    opacity: 0.5,
    fontSize: 12,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  postItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  postPreview: {
    opacity: 0.6,
    marginTop: 4,
    fontSize: 14,
  },
  postDate: {
    opacity: 0.4,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  loginContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loginTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  loginSubtitle: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.6,
    lineHeight: 20,
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginBottom: 24,
    minWidth: 200,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  loginInfo: {
    textAlign: "center",
    opacity: 0.5,
    fontSize: 12,
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  infoBox: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(161, 206, 220, 0.1)",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
