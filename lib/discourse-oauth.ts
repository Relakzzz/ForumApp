/**
 * Discourse OAuth Integration
 * Handles OAuth authentication with Discourse forum
 */

import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

export interface DiscourseUser {
  id: number;
  username: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
  trust_level: number;
  admin: boolean;
  moderator: boolean;
}

export interface DiscourseOAuthConfig {
  forumUrl: string; // e.g., "https://horlogeforum.nl"
  clientId: string;
  clientSecret?: string; // Only needed for server-side token exchange
}

// Discourse OAuth configuration (from environment variables)
const discourseConfig: DiscourseOAuthConfig = {
  forumUrl: process.env.EXPO_PUBLIC_DISCOURSE_URL || "",
  clientId: process.env.EXPO_PUBLIC_DISCOURSE_CLIENT_ID || "",
  clientSecret: process.env.EXPO_PUBLIC_DISCOURSE_CLIENT_SECRET || "",
};

/**
 * Get the Discourse OAuth login URL
 * Constructs the authorization URL for Discourse OAuth flow
 */
export function getDiscourseLoginUrl(): string {
  if (!discourseConfig.forumUrl || !discourseConfig.clientId) {
    throw new Error("Discourse OAuth configuration is missing");
  }

  let redirectUri: string;

  if (Platform.OS === "web") {
    // Web: redirect to API server callback
    redirectUri = `${getApiBaseUrl()}/api/oauth/discourse/callback`;
  } else {
    // Native: use deep link scheme
    const bundleId = "space.manus.horlogeforum_app.t20251220131513";
    const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
    const schemeFromBundleId = `manus${timestamp}`;
    
    redirectUri = Linking.createURL("/oauth/discourse/callback", {
      scheme: schemeFromBundleId,
    });
  }

  const state = generateState();
  
  // Store state for verification in callback
  if (Platform.OS === "web") {
    sessionStorage.setItem("discourse_oauth_state", state);
  }

  const url = new URL(`${discourseConfig.forumUrl}/oauth/authorize`);
  url.searchParams.set("client_id", discourseConfig.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("scopes", "read,write");

  console.log("[DiscourseOAuth] Generated login URL:", url.toString());
  return url.toString();
}

/**
 * Generate a random state string for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Exchange authorization code for access token
 * This is typically done server-side for security
 */
export async function exchangeDiscourseCode(
  code: string,
  state: string,
): Promise<{ accessToken: string; user: DiscourseUser } | null> {
  if (!discourseConfig.forumUrl || !discourseConfig.clientId) {
    throw new Error("Discourse OAuth configuration is missing");
  }

  try {
    console.log("[DiscourseOAuth] Exchanging code for access token...");

    // Call backend API to exchange code (server-side for security)
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/oauth/discourse/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        state,
        redirectUri:
          Platform.OS === "web"
            ? `${baseUrl}/api/oauth/discourse/callback`
            : "manus://oauth/discourse/callback",
      }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[DiscourseOAuth] Token exchange failed:", error);
      return null;
    }

    const data = await response.json();
    console.log("[DiscourseOAuth] Token exchange successful");

    return {
      accessToken: data.accessToken,
      user: data.user,
    };
  } catch (error) {
    console.error("[DiscourseOAuth] Exchange error:", error);
    return null;
  }
}

/**
 * Fetch current user info from Discourse using access token
 */
export async function fetchDiscourseUser(accessToken: string): Promise<DiscourseUser | null> {
  if (!discourseConfig.forumUrl) {
    throw new Error("Discourse forum URL is not configured");
  }

  try {
    console.log("[DiscourseOAuth] Fetching user info from Discourse...");

    const response = await fetch(`${discourseConfig.forumUrl}/api/users/me.json`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "HorlogeForum Mobile App",
      },
    });

    if (!response.ok) {
      console.error("[DiscourseOAuth] Failed to fetch user:", response.status);
      return null;
    }

    const data = await response.json();
    const user = data.user;

    const discourseUser: DiscourseUser = {
      id: user.id,
      username: user.username,
      name: user.name || null,
      avatar_url: user.avatar_template
        ? `${discourseConfig.forumUrl}${user.avatar_template.replace("{size}", "96")}`
        : null,
      email: user.email || null,
      trust_level: user.trust_level || 0,
      admin: user.admin || false,
      moderator: user.moderator || false,
    };

    console.log("[DiscourseOAuth] User info fetched:", {
      id: discourseUser.id,
      username: discourseUser.username,
      trustLevel: discourseUser.trust_level,
    });

    return discourseUser;
  } catch (error) {
    console.error("[DiscourseOAuth] Failed to fetch user:", error);
    return null;
  }
}

/**
 * Verify OAuth state for CSRF protection
 */
export function verifyState(state: string): boolean {
  if (Platform.OS !== "web") {
    return true; // Skip verification on native (handled by OS)
  }

  const storedState = sessionStorage.getItem("discourse_oauth_state");
  sessionStorage.removeItem("discourse_oauth_state");

  if (!storedState || storedState !== state) {
    console.error("[DiscourseOAuth] State verification failed");
    return false;
  }

  console.log("[DiscourseOAuth] State verified successfully");
  return true;
}

/**
 * Check if Discourse OAuth is configured
 */
export function isDiscourseOAuthConfigured(): boolean {
  return !!(discourseConfig.forumUrl && discourseConfig.clientId);
}

/**
 * Get Discourse forum URL
 */
export function getDiscourseForumUrl(): string {
  return discourseConfig.forumUrl;
}
