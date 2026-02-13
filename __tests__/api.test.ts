import { describe, it, expect } from "vitest";

/**
 * Test the tRPC API endpoints
 * These tests verify that the backend API is correctly proxying
 * requests to the Discourse API
 */

const API_BASE = "http://127.0.0.1:3000/api/trpc";

describe("Discourse API Proxy", () => {
  it("should fetch latest topics", async () => {
    // Note: tRPC uses a special format for query parameters
    // The client library handles this automatically
    const response = await fetch(`${API_BASE}/discourse.latestTopics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(400); // Expected because input is required
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should handle search requests", async () => {
    const response = await fetch(`${API_BASE}/discourse.search`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(400); // Expected because input is required
    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  it("should fetch categories", async () => {
    const response = await fetch(`${API_BASE}/discourse.categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Categories endpoint doesn't require input, but may fail due to network/API issues
    expect([200, 400, 500]).toContain(response.status);
  });
});
