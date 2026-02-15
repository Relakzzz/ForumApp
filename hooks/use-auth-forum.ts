/**
 * Custom hook for managing forum authentication state
 */

import { useEffect, useState } from "react";

const FORUM_URL = "https://www.horlogeforum.nl";
const USER_KEY = "discourse_user";

export interface DiscourseUser {
  id: number;
  username: string;
  name: string;
  avatar_template: string;
  created_at: string;
  post_count: number;
  topic_count: number;
  trust_level: number;
  admin: boolean;
  moderator: boolean;
}

export interface UseAuthForumReturn {
  user: DiscourseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

async function getStoredUser(): Promise<DiscourseUser | null> {
  try {
    const AsyncStorage = await import("@react-native-async-storage/async-storage").then((m) => m.default);
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson);
  } catch (error) {
    console.error("[Auth] Error getting stored user:", error);
    return null;
  }
}

async function isAuthenticated(): Promise<boolean> {
  const user = await getStoredUser();
  return user !== null;
}

async function loginUser(username: string, password: string): Promise<{ success: boolean; user?: DiscourseUser; error?: string }> {
  try {
    // Step 1: Get CSRF token
    const csrfResponse = await fetch(`${FORUM_URL}/session/csrf.json`);
    if (!csrfResponse.ok) {
      throw new Error("Failed to get CSRF token");
    }
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrf;

    // Step 2: Authenticate
    const loginResponse = await fetch(`${FORUM_URL}/session.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({
        login: username,
        password: password,
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      return {
        success: false,
        error: errorData.error || "Login failed",
      };
    }

    // Step 3: Get user info
    const userResponse = await fetch(`${FORUM_URL}/u/${username}.json`);
    if (!userResponse.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userData = await userResponse.json();
    const user: DiscourseUser = {
      id: userData.user.id,
      username: userData.user.username,
      name: userData.user.name,
      avatar_template: userData.user.avatar_template,
      created_at: userData.user.created_at,
      post_count: userData.user.post_count,
      topic_count: userData.user.topic_count,
      trust_level: userData.user.trust_level,
      admin: userData.user.admin,
      moderator: userData.user.moderator,
    };

    // Step 4: Store user data
    const AsyncStorage = await import("@react-native-async-storage/async-storage").then((m) => m.default);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}

async function logoutUser(): Promise<void> {
  try {
    const AsyncStorage = await import("@react-native-async-storage/async-storage").then((m) => m.default);
    await AsyncStorage.removeItem(USER_KEY);

    await fetch(`${FORUM_URL}/session.json`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
  }
}

export function useAuthForum(): UseAuthForumReturn {
  const [user, setUser] = useState<DiscourseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log("[useAuthForum] Initializing session...");
        const storedUser = await getStoredUser();
        
        if (storedUser) {
          console.log("[useAuthForum] Found stored user:", storedUser.username);
          setUser(storedUser);
          setIsAuth(true);
          
          // Background validation: refresh user info from API
          try {
            const response = await fetch(`${FORUM_URL}/u/${storedUser.username}.json`);
            if (response.ok) {
              const userData = await response.json();
              const updatedUser: DiscourseUser = {
                id: userData.user.id,
                username: userData.user.username,
                name: userData.user.name,
                avatar_template: userData.user.avatar_template,
                created_at: userData.user.created_at,
                post_count: userData.user.post_count,
                topic_count: userData.user.topic_count,
                trust_level: userData.user.trust_level,
                admin: userData.user.admin,
                moderator: userData.user.moderator,
              };
              
              // Update state and storage if info changed
              setUser(updatedUser);
              const AsyncStorage = await import("@react-native-async-storage/async-storage").then((m) => m.default);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
              console.log("[useAuthForum] Session validated and updated");
            } else if (response.status === 403 || response.status === 401) {
              // Session expired on server
              console.log("[useAuthForum] Session expired on server, logging out");
              await handleLogout();
            }
          } catch (apiError) {
            console.log("[useAuthForum] Background validation failed (offline?), keeping local session");
          }
        } else {
          console.log("[useAuthForum] No stored session found");
          setUser(null);
          setIsAuth(false);
        }
      } catch (error) {
        console.error("[useAuthForum] Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      const result = await loginUser(username, password);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuth(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      setIsAuth(false);
    } catch (error) {
      console.error("[useAuthForum] Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: isAuth,
    login: handleLogin,
    logout: handleLogout,
  };
}
