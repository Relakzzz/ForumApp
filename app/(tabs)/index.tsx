import { FlatList, RefreshControl, StyleSheet, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopicCard } from "@/components/topic-card";
import { useLatestTopics } from "@/hooks/use-forum-data-trpc";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useDiscourseAuth } from "@/hooks/use-discourse-auth";
import { DiscourseLoginButton } from "@/components/discourse-login-button";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const { data: topics, loading, error } = useLatestTopics(page);
  const [refreshing, setRefreshing] = useState(false);
  const tintColor = useThemeColor({}, "tint");
  const { user, login, isLoggingIn, error: authError, isAuthenticated } = useDiscourseAuth();

  // Update all topics when new page is loaded
  useEffect(() => {
    if (topics && topics.length > 0) {
      if (page === 0) {
        setAllTopics(topics);
      } else {
        const newTopics = topics.filter((t) => !allTopics.find((at) => at.id === t.id));
        if (newTopics.length > 0) {
          setAllTopics((prev) => [...prev, ...newTopics]);
        }
      }
    }
  }, [topics, page]);

  const handleLoadMore = useCallback(() => {
    if (!loading && topics && topics.length > 0) {
      setPage((prev) => prev + 1);
    }
  }, [loading, topics]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setAllTopics([]);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <ThemedView style={styles.container}>
      {!isAuthenticated && (
        <View style={styles.loginContainer}>
          <DiscourseLoginButton 
            onPress={login} 
            loading={isLoggingIn} 
            error={authError} 
          />
        </View>
      )}
      
      {loading && page === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <ThemedText type="subtitle">Failed to load topics</ThemedText>
          <ThemedText style={{ marginTop: 8 }}>{error.message}</ThemedText>
        </View>
      ) : (
        <FlatList
          data={allTopics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TopicCard topic={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tintColor} />
          }
          ListHeaderComponent={
            isAuthenticated && user ? (
              <View style={styles.welcomeHeader}>
                <ThemedText type="subtitle">Welcome back, {user.username}!</ThemedText>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centerContainer}>
                <ThemedText type="subtitle">No topics found</ThemedText>
              </View>
            ) : null
          }
          scrollEnabled={true}
          nestedScrollEnabled={true}
          contentContainerStyle={{
            paddingTop: Math.max(insets.top, 0),
            paddingBottom: Math.max(insets.bottom, 20),
          }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loginContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  welcomeHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
});
