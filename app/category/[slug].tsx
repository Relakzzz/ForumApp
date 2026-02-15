import { FlatList, RefreshControl, StyleSheet, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopicCard } from "@/components/topic-card";
import { useTopicsByCategory, useCategories } from "@/hooks/use-forum-data-trpc";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  
  const { data: topics, loading, error } = useTopicsByCategory(slug || "", page);
  const { data: categories } = useCategories();
  
  const category = categories?.find(c => c.slug === slug);
  const categoryName = category?.name || slug;

  const [refreshing, setRefreshing] = useState(false);
  const tintColor = useThemeColor({}, "tint");

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
    } else if (topics && topics.length === 0 && page === 0) {
      setAllTopics([]);
    }
  }, [topics, page]);

  const handleLoadMore = useCallback(() => {
    if (!loading && topics && topics.length > 0) {
      setPage((prev) => prev + 1);
    }
  }, [loading, topics]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: categoryName,
          headerShown: true,
          headerBackTitle: "Back"
        }} 
      />
      
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
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centerContainer}>
                <ThemedText type="subtitle">No topics found in this category</ThemedText>
              </View>
            ) : null
          }
          contentContainerStyle={{
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
});
