import React from "react";
import { StyleSheet, Pressable, View, ActivityIndicator } from "react-native";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface DiscourseLoginButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  error?: Error | null;
}

export function DiscourseLoginButton({
  onPress,
  loading = false,
  disabled = false,
  error,
}: DiscourseLoginButtonProps) {
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: tintColor,
            opacity: disabled || loading ? 0.6 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Login with Discourse</ThemedText>
        )}
      </Pressable>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: "#ff4444" }]}>
            {error.message}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
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
  errorContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  errorText: {
    fontSize: 13,
    textAlign: "center",
  },
});
