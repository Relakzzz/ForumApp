import { useState, useEffect } from "react";
import { StyleSheet, TextInput, Pressable, ActivityIndicator, ScrollView, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthForum } from "@/hooks/use-auth-forum";
import { useThemeColor } from "@/hooks/use-theme-color";
import { trpc } from "@/lib/trpc";

const FORUM_URL = "https://www.horlogeforum.nl";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export default function CreateTopicScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthForum();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "icon");

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await fetch("/api/trpc/discourse.categories").then((res) => res.json());
      if (result.result?.data?.category_list?.categories) {
        setCategories(result.result.data.category_list.categories);
        if (result.result.data.category_list.categories.length > 0) {
          setSelectedCategory(result.result.data.category_list.categories[0].id);
        }
      }
    } catch (error) {
      console.error("[CreateTopic] Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    }
  };

  const handleCreateTopic = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a topic");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a topic title");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please enter topic content");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    setLoading(true);

    try {
      // For now, we'll show a placeholder message since creating topics via API
      // requires API key authentication which is not available in the mobile app
      Alert.alert(
        "Feature Coming Soon",
        "Topic creation requires API authentication. Please create topics directly on the forum website for now."
      );
    } catch (error) {
      console.error("[CreateTopic] Error:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to create topic");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name || "Select Category";

  if (!user) {
    return (
      <ThemedView
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
            paddingLeft: Math.max(insets.left, 20),
            paddingRight: Math.max(insets.right, 20),
          },
        ]}
      >
        <ThemedText type="title" style={styles.errorTitle}>
          Sign In Required
        </ThemedText>
        <ThemedText type="default" style={styles.errorText}>
          You must be logged in to create a new topic.
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: tintColor, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </Pressable>
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
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </Pressable>
        <ThemedText type="title">Create Topic</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Category
        </ThemedText>
        <Pressable
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          style={[
            styles.categoryButton,
            {
              borderColor: tintColor,
              backgroundColor: backgroundColor,
            },
          ]}
        >
          <ThemedText>{selectedCategoryName}</ThemedText>
          <ThemedText style={styles.chevron}>›</ThemedText>
        </Pressable>

        {showCategoryPicker && (
          <ThemedView style={[styles.categoryList, { borderColor }]}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setShowCategoryPicker(false);
                }}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemSelected,
                  { borderBottomColor: borderColor },
                ]}
              >
                <ThemedText
                  style={selectedCategory === category.id ? { fontWeight: "600" } : {}}
                >
                  {category.name}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        )}

        <ThemedText type="defaultSemiBold" style={[styles.label, { marginTop: 16 }]}>
          Title
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              borderColor: tintColor,
              backgroundColor: backgroundColor,
            },
          ]}
          placeholder="Enter topic title"
          placeholderTextColor={textColor + "80"}
          value={title}
          onChangeText={setTitle}
          editable={!loading}
          maxLength={255}
        />
        <ThemedText type="default" style={styles.charCount}>
          {title.length}/255
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={[styles.label, { marginTop: 16 }]}>
          Content
        </ThemedText>
        <TextInput
          style={[
            styles.contentInput,
            {
              color: textColor,
              borderColor: tintColor,
              backgroundColor: backgroundColor,
            },
          ]}
          placeholder="Write your topic content here..."
          placeholderTextColor={textColor + "80"}
          value={content}
          onChangeText={setContent}
          editable={!loading}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Pressable
          onPress={handleCreateTopic}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: tintColor,
              opacity: pressed || loading ? 0.8 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Create Topic</ThemedText>
          )}
        </Pressable>

        <ThemedView style={styles.infoBox}>
          <ThemedText type="default" style={styles.infoText}>
            Topics are moderated by the community. Please follow the forum rules and be respectful to other members.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
  form: {
    gap: 0,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  chevron: {
    fontSize: 20,
  },
  categoryList: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryItemSelected: {
    backgroundColor: "rgba(161, 206, 220, 0.1)",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 120,
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(161, 206, 220, 0.1)",
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.7,
  },
  errorTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.6,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
