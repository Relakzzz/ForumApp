import { describe, it, expect, beforeEach } from "vitest";
import * as DiscourseOAuth from "../lib/discourse-oauth";

// Mock environment variables
beforeEach(() => {
  process.env.EXPO_PUBLIC_DISCOURSE_URL = "https://discourse.example.com";
  process.env.EXPO_PUBLIC_DISCOURSE_CLIENT_ID = "test-client-id";
});

describe("Discourse OAuth", () => {
  describe("isDiscourseOAuthConfigured", () => {
    it("should return true when configured", () => {
      const configured = DiscourseOAuth.isDiscourseOAuthConfigured();
      expect(configured).toBe(true);
    });

    it("should return false when not configured", () => {
      process.env.EXPO_PUBLIC_DISCOURSE_URL = "";
      const configured = DiscourseOAuth.isDiscourseOAuthConfigured();
      expect(configured).toBe(false);
    });
  });

  describe("getDiscourseForumUrl", () => {
    it("should return the forum URL", () => {
      const url = DiscourseOAuth.getDiscourseForumUrl();
      expect(url).toBe("https://discourse.example.com");
    });
  });

  describe("getDiscourseLoginUrl", () => {
    it("should throw error when not configured", () => {
      process.env.EXPO_PUBLIC_DISCOURSE_URL = "";
      process.env.EXPO_PUBLIC_DISCOURSE_CLIENT_ID = "";

      expect(() => {
        DiscourseOAuth.getDiscourseLoginUrl();
      }).toThrow("Discourse OAuth configuration is missing");
    });

    it("should generate valid login URL", () => {
      const url = DiscourseOAuth.getDiscourseLoginUrl();
      expect(url).toContain("https://discourse.example.com/oauth/authorize");
      expect(url).toContain("client_id=test-client-id");
      expect(url).toContain("response_type=code");
      expect(url).toContain("scopes=read,write");
    });

    it("should include redirect_uri in login URL", () => {
      const url = DiscourseOAuth.getDiscourseLoginUrl();
      expect(url).toContain("redirect_uri=");
    });

    it("should include state parameter for CSRF protection", () => {
      const url = DiscourseOAuth.getDiscourseLoginUrl();
      expect(url).toContain("state=");
    });
  });

  describe("verifyState", () => {
    it("should return true on native platform", () => {
      const result = DiscourseOAuth.verifyState("any-state");
      expect(result).toBe(true);
    });
  });

  describe("DiscourseUser type", () => {
    it("should have required properties", () => {
      const user: DiscourseOAuth.DiscourseUser = {
        id: 1,
        username: "testuser",
        name: "Test User",
        avatar_url: "https://example.com/avatar.png",
        email: "test@example.com",
        trust_level: 1,
        admin: false,
        moderator: false,
      };

      expect(user.id).toBe(1);
      expect(user.username).toBe("testuser");
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
      expect(user.trust_level).toBe(1);
      expect(user.admin).toBe(false);
      expect(user.moderator).toBe(false);
    });

    it("should allow null values for optional fields", () => {
      const user: DiscourseOAuth.DiscourseUser = {
        id: 1,
        username: "testuser",
        name: null,
        avatar_url: null,
        email: null,
        trust_level: 0,
        admin: false,
        moderator: false,
      };

      expect(user.name).toBeNull();
      expect(user.avatar_url).toBeNull();
      expect(user.email).toBeNull();
    });
  });

  describe("DiscourseOAuthConfig type", () => {
    it("should have required properties", () => {
      const config: DiscourseOAuth.DiscourseOAuthConfig = {
        forumUrl: "https://discourse.example.com",
        clientId: "test-id",
        clientSecret: "test-secret",
      };

      expect(config.forumUrl).toBe("https://discourse.example.com");
      expect(config.clientId).toBe("test-id");
      expect(config.clientSecret).toBe("test-secret");
    });

    it("should allow optional clientSecret", () => {
      const config: DiscourseOAuth.DiscourseOAuthConfig = {
        forumUrl: "https://discourse.example.com",
        clientId: "test-id",
      };

      expect(config.forumUrl).toBe("https://discourse.example.com");
      expect(config.clientId).toBe("test-id");
      expect(config.clientSecret).toBeUndefined();
    });
  });

  describe("OAuth flow", () => {
    it("should support complete OAuth flow", async () => {
      const loginUrl = DiscourseOAuth.getDiscourseLoginUrl();
      expect(loginUrl).toContain("oauth/authorize");

      const code = "test-auth-code";
      const state = new URL(loginUrl).searchParams.get("state");
      expect(state).toBeTruthy();

      const stateValid = DiscourseOAuth.verifyState(state!);
      expect(stateValid).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should handle missing configuration gracefully", () => {
      process.env.EXPO_PUBLIC_DISCOURSE_URL = "";

      expect(() => {
        DiscourseOAuth.getDiscourseLoginUrl();
      }).toThrow();
    });

    it("should handle missing client ID gracefully", () => {
      process.env.EXPO_PUBLIC_DISCOURSE_CLIENT_ID = "";

      expect(() => {
        DiscourseOAuth.getDiscourseLoginUrl();
      }).toThrow();
    });
  });
});
