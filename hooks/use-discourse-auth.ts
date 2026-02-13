import * as Auth from "@/lib/auth";
import * as DiscourseOAuth from "@/lib/discourse-oauth";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { useRouter } from "expo-router";

type UseDiscourseAuthOptions = {
  autoFetch?: boolean;
};

export function useDiscourseAuth(options?: UseDiscourseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    console.log("[useDiscourseAuth] fetchUser called");
    try {
      setLoading(true);
      setError(null);

      const sessionToken = await Auth.getSessionToken();
      console.log("[useDiscourseAuth] Session token:", sessionToken ? "present" : "missing");

      if (!sessionToken) {
        console.log("[useDiscourseAuth] No session token, user is not authenticated");
        setUser(null);
        return;
      }

      // Use cached user info
      const cachedUser = await Auth.getUserInfo();
      console.log("[useDiscourseAuth] Cached user:", cachedUser);

      if (cachedUser) {
        console.log("[useDiscourseAuth] Using cached user info");
        setUser(cachedUser);
      } else {
        console.log("[useDiscourseAuth] No cached user, setting user to null");
        setUser(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user");
      console.error("[useDiscourseAuth] fetchUser error:", error);
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    if (!DiscourseOAuth.isDiscourseOAuthConfigured()) {
      console.error("[useDiscourseAuth] Discourse OAuth is not configured");
      setError(new Error("Discourse OAuth is not configured"));
      return;
    }

    try {
      console.log("[useDiscourseAuth] Starting Discourse OAuth login...");
      setIsLoggingIn(true);
      setError(null);

      const loginUrl = DiscourseOAuth.getDiscourseLoginUrl();
      console.log("[useDiscourseAuth] Generated login URL");

      // On web, use direct redirect
      if (Platform.OS === "web") {
        console.log("[useDiscourseAuth] Web platform: redirecting to OAuth...");
        window.location.href = loginUrl;
        return;
      }

      // On native, use WebBrowser
      console.log("[useDiscourseAuth] Opening OAuth URL in browser...");
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, undefined, {
        preferEphemeralSession: false,
        showInRecents: true,
      });

      console.log("[useDiscourseAuth] WebBrowser result:", result.type);

      if (result.type === "cancel") {
        console.log("[useDiscourseAuth] OAuth cancelled by user");
        setError(new Error("OAuth cancelled by user"));
      } else if (result.type === "dismiss") {
        console.log("[useDiscourseAuth] OAuth dismissed");
        setError(new Error("OAuth dismissed"));
      } else if (result.type === "success" && result.url) {
        console.log("[useDiscourseAuth] OAuth session successful");
        // Parse the URL and navigate to callback
        try {
          let url: URL;
          if (result.url.startsWith("exp://") || result.url.startsWith("exps://")) {
            const urlStr = result.url.replace(/^exp(s)?:\/\//, "http://");
            url = new URL(urlStr);
          } else {
            url = new URL(result.url);
          }

          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const error = url.searchParams.get("error");

          console.log("[useDiscourseAuth] Extracted params:", {
            hasCode: !!code,
            hasState: !!state,
            error,
          });

          if (error) {
            console.error("[useDiscourseAuth] OAuth error:", error);
            setError(new Error(error));
            return;
          }

          if (code && state) {
            console.log("[useDiscourseAuth] Navigating to callback route...");
            router.push({
              pathname: "/oauth/discourse/callback" as any,
              params: { code, state },
            });
          } else {
            console.error("[useDiscourseAuth] Missing code or state in callback URL");
            setError(new Error("Missing code or state in callback URL"));
          }
        } catch (err) {
          console.error("[useDiscourseAuth] Failed to parse callback URL:", err);
          setError(err instanceof Error ? err : new Error("Failed to parse callback URL"));
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Login failed");
      console.error("[useDiscourseAuth] Login error:", error);
      setError(error);
    } finally {
      setIsLoggingIn(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      console.log("[useDiscourseAuth] Logging out...");
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      setUser(null);
      setError(null);
      console.log("[useDiscourseAuth] Logout successful");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Logout failed");
      console.error("[useDiscourseAuth] Logout error:", error);
      setError(error);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    console.log("[useDiscourseAuth] useEffect triggered, autoFetch:", autoFetch);
    if (autoFetch) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isLoggingIn,
    login,
    logout,
    refresh: fetchUser,
  };
}
