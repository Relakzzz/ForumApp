import { useState } from "react";
import { StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthForum } from "@/hooks/use-auth-forum";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useDiscourseAuth } from "@/hooks/use-discourse-auth";
import { DiscourseLoginButton } from "@/components/discourse-login-button";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, loading } = useAuthForum();
  const { login: loginWithDiscourse, isLoggingIn, error: authError } = useDiscourseAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setError("");
    const result = await login(username, password);

    if (result.success) {
      router.replace("/(tabs)/profile");
    } else {
      setError(result.error || "Login failed");
      Alert.alert("Login Error", result.error || "Login failed. Please try again.");
    }
  };

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
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Login
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          Sign in to your Horlogeforum account
        </ThemedText>

        <ThemedView style={styles.form}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Username
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
            placeholder="Enter your username"
            placeholderTextColor={textColor + "80"}
            value={username}
            onChangeText={setUsername}
            editable={!loading}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ThemedText type="defaultSemiBold" style={[styles.label, { marginTop: 16 }]}>
            Password
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
            placeholder="Enter your password"
            placeholderTextColor={textColor + "80"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error && (
            <ThemedText style={[styles.errorText, { color: "#FF3B30" }]}>
              {error}
            </ThemedText>
          )}

          <Pressable
            onPress={handleLogin}
            disabled={loading || isLoggingIn}
            style={({ pressed }) => [
              styles.loginButton,
              {
                backgroundColor: tintColor,
                opacity: pressed || loading || isLoggingIn ? 0.8 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
            )}
          </Pressable>

          <ThemedView style={styles.dividerContainer}>
            <ThemedView style={[styles.divider, { backgroundColor: textColor + "20" }]} />
            <ThemedText style={styles.dividerText}>OR</ThemedText>
            <ThemedView style={[styles.divider, { backgroundColor: textColor + "20" }]} />
          </ThemedView>

          <DiscourseLoginButton 
            onPress={loginWithDiscourse} 
            loading={isLoggingIn} 
            error={authError} 
          />

          <ThemedText type="default" style={styles.disclaimer}>
            You need a valid Horlogeforum account to post and reply. Browsing the forum is available without logging in.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  form: {
    gap: 0,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    marginTop: 8,
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 18,
    marginTop: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    opacity: 0.5,
  },
});
