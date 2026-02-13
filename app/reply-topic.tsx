import { useState } from "react";
import { StyleSheet, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthForum } from "@/hooks/use-auth-forum";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useQuotes } from "@/contexts/quote-context";
import { QuoteBlock } from "@/components/quote-block";

export default function ReplyTopicScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthForum();
  const { quotes, clearQuotes, getQuotesFormatted } = useQuotes();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  const topicId = params.topicId as string;
  const topicTitle = params.topicTitle as string;

  const handleSubmitReply = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to reply");
      return;
    }

    if (!content.trim() && quotes.length === 0) {
      Alert.alert("Error", "Please enter your reply or add a quote");
      return;
    }

    setLoading(true);

    try {
      // Combine quotes with content
      const quotesFormatted = getQuotesFormatted();
      const fullContent = quotesFormatted ? `${quotesFormatted}\n\n${content}` : content;
      
      // For now, show a placeholder message since replying via API
      // requires API key authentication which is not available in the mobile app
      Alert.alert(
        "Feature Coming Soon",
        "Replying requires API authentication. Please reply directly on the forum website for now."
      );
      
      // Clear quotes after submission
      clearQuotes();
    } catch (error) {
      console.error("[ReplyTopic] Error:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to submit reply");
    } finally {
      setLoading(false);
    }
  };

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
          You must be logged in to reply to this topic.
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
        <ThemedText type="title">Reply to Topic</ThemedText>
        {topicTitle && (
          <ThemedText type="default" style={styles.topicTitle} numberOfLines={2}>
            {topicTitle}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.form}>
        {quotes.length > 0 && (
          <ThemedView style={styles.quotesSection}>
            <ThemedText type="defaultSemiBold" style={styles.quotesLabel}>
              Quotes ({quotes.length})
            </ThemedText>
            {quotes.map((quote) => (
              <QuoteBlock key={quote.id} quote={quote} editable={true} />
            ))}
          </ThemedView>
        )}
        
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Your Reply
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
          placeholder="Write your reply here..."
          placeholderTextColor={textColor + "80"}
          value={content}
          onChangeText={setContent}
          editable={!loading}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Pressable
          onPress={handleSubmitReply}
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
            <ThemedText style={styles.submitButtonText}>Submit Reply</ThemedText>
          )}
        </Pressable>

        <ThemedView style={styles.infoBox}>
          <ThemedText type="default" style={styles.infoText}>
            Please be respectful and follow the forum rules. Your reply will be visible to all members.
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
    gap: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 16,
  },
  topicTitle: {
    opacity: 0.6,
    fontSize: 14,
  },
  form: {
    gap: 0,
    marginBottom: 24,
  },
  quotesSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quotesLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
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
