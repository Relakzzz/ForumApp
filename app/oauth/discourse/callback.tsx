import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import * as Auth from "@/lib/auth";
import * as DiscourseOAuth from "@/lib/discourse-oauth";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DiscourseOAuthCallback() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
  }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log("[DiscourseOAuthCallback] Callback handler triggered");
      console.log("[DiscourseOAuthCallback] Params received:", {
        code: params.code ? "present" : "missing",
        state: params.state ? "present" : "missing",
        error: params.error,
      });

      try {
        // Check for error
        if (params.error) {
          console.error("[DiscourseOAuthCallback] Error parameter found:", params.error);
          setStatus("error");
          setErrorMessage(params.error || "OAuth error occurred");
          return;
        }

        // Get URL from params or Linking
        let url: string | null = null;

        // Try to get from local search params first
        if (params.code || params.state) {
          console.log("[DiscourseOAuthCallback] Found params in route params");
          const urlParams = new URLSearchParams();
          if (params.code) urlParams.set("code", params.code);
          if (params.state) urlParams.set("state", params.state);
          url = `?${urlParams.toString()}`;
          console.log("[DiscourseOAuthCallback] Constructed URL from params");
        } else {
          console.log("[DiscourseOAuthCallback] No params found, checking Linking.getInitialURL()...");
          const initialUrl = await Linking.getInitialURL();
          console.log("[DiscourseOAuthCallback] Linking.getInitialURL():", initialUrl);
          if (initialUrl) {
            url = initialUrl;
          }
        }

        // Extract code and state
        let code: string | null = null;
        let state: string | null = null;

        if (params.code && params.state) {
          console.log("[DiscourseOAuthCallback] Using code and state from route params");
          code = params.code;
          state = params.state;
        } else if (url) {
          console.log("[DiscourseOAuthCallback] Parsing code and state from URL");
          try {
            const urlObj = new URL(url);
            code = urlObj.searchParams.get("code");
            state = urlObj.searchParams.get("state");
            console.log("[DiscourseOAuthCallback] Extracted from URL:", {
              hasCode: !!code,
              hasState: !!state,
            });
          } catch (e) {
            console.log("[DiscourseOAuthCallback] Failed to parse as full URL, trying regex");
            const match = url.match(/[?&](code|state)=([^&]+)/g);
            if (match) {
              match.forEach((param) => {
                const [key, value] = param.substring(1).split("=");
                if (key === "code") code = decodeURIComponent(value);
                if (key === "state") state = decodeURIComponent(value);
              });
            }
          }
        }

        if (!code || !state) {
          console.error("[DiscourseOAuthCallback] Missing code or state parameter");
          setStatus("error");
          setErrorMessage("Missing code or state parameter");
          return;
        }

        // Verify state for CSRF protection
        if (!DiscourseOAuth.verifyState(state)) {
          console.error("[DiscourseOAuthCallback] State verification failed");
          setStatus("error");
          setErrorMessage("Invalid state parameter");
          return;
        }

        // Exchange code for access token
        console.log("[DiscourseOAuthCallback] Exchanging code for access token...");
        const result = await DiscourseOAuth.exchangeDiscourseCode(code, state);

        if (!result) {
          console.error("[DiscourseOAuthCallback] Failed to exchange code");
          setStatus("error");
          setErrorMessage("Failed to exchange authorization code");
          return;
        }

        console.log("[DiscourseOAuthCallback] Code exchange successful");

        // Store access token and user info
        await Auth.setSessionToken(result.accessToken);
        console.log("[DiscourseOAuthCallback] Access token stored");

        // Convert Discourse user to app user format
        const userInfo: Auth.User = {
          id: result.user.id,
          openId: result.user.username,
          name: result.user.name,
          email: result.user.email,
          loginMethod: "discourse",
          lastSignedIn: new Date(),
        };

        await Auth.setUserInfo(userInfo);
        console.log("[DiscourseOAuthCallback] User info stored:", {
          id: userInfo.id,
          openId: userInfo.openId,
          name: userInfo.name,
        });

        setStatus("success");
        console.log("[DiscourseOAuthCallback] Authentication successful, redirecting to home...");

        // Redirect to home after a short delay
        setTimeout(() => {
          console.log("[DiscourseOAuthCallback] Executing redirect...");
          router.replace("/(tabs)");
        }, 1000);
      } catch (error) {
        console.error("[DiscourseOAuthCallback] Callback error:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to complete authentication",
        );
      }
    };

    handleCallback();
  }, [params.code, params.state, params.error, router]);

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
      {status === "processing" && (
        <>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.text}>Completing Discourse authentication...</ThemedText>
        </>
      )}
      {status === "success" && (
        <>
          <ThemedText style={styles.text}>Authentication successful!</ThemedText>
          <ThemedText style={styles.text}>Redirecting...</ThemedText>
        </>
      )}
      {status === "error" && (
        <>
          <ThemedText type="subtitle" style={styles.errorText}>
            Authentication failed
          </ThemedText>
          <ThemedText style={styles.text}>{errorMessage}</ThemedText>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  text: {
    marginTop: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#ff4444",
    marginBottom: 8,
  },
});
