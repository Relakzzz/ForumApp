import { FlatList, StyleSheet, View, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TopicCard } from "@/components/topic-card";
import { useSearchTopics } from "@/hooks/use-forum-data-trpc";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: results, loading, error } = useSearchTopics(searchQuery);
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "icon");

  const topics = results?.topics || [];

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.searchBar,
          {
            paddingTop: Math.max(insets.top, 16),
            backgroundColor,
            borderBottomColor: borderColor,
          },
        ]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              color: textColor,
              borderColor: borderColor,
            },
          ]}
          placeholder="Search topics..."
          placeholderTextColor={useThemeColor({}, "icon")}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {!searchQuery ? (
        <View style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={styles.emptyText}>
            Enter a search query to find topics
          </ThemedText>
        </View>
      ) : loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <ThemedText type="subtitle">Search failed</ThemedText>
          <ThemedText style={{ marginTop: 8 }}>{error.message}</ThemedText>
        </View>
      ) : topics.length === 0 ? (
        <View style={styles.centerContainer}>
          <ThemedText type="subtitle">No topics found</ThemedText>
          <ThemedText style={{ marginTop: 8 }}>Try a different search term</ThemedText>
        </View>
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TopicCard topic={item} />}
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
  searchBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
