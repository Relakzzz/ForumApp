/**
 * Discourse API Client using tRPC
 * This module provides a client interface to the backend tRPC API
 * which proxies requests to the Discourse API to avoid CORS issues
 */

import { trpc } from "./trpc";

/**
 * Fetch latest topics from the forum
 */
export async function getLatestTopics(page: number = 0, limit: number = 20) {
  try {
    const result = await trpc.discourse.latestTopics.useQuery({ page, limit });
    return result.data?.topic_list?.topics || [];
  } catch (error) {
    console.error("[Discourse Client] Error fetching latest topics:", error);
    throw error;
  }
}

/**
 * Fetch topics from a specific category
 */
export async function getTopicsByCategory(
  categorySlug: string,
  page: number = 0,
  limit: number = 20
) {
  try {
    const result = await trpc.discourse.topicsByCategory.useQuery({
      categorySlug,
      page,
      limit,
    });
    return result.data?.topic_list?.topics || [];
  } catch (error) {
    console.error("[Discourse Client] Error fetching topics by category:", error);
    throw error;
  }
}

/**
 * Fetch a specific topic with all posts
 */
export async function getTopicDetail(topicId: number | string) {
  try {
    const result = await trpc.discourse.topicDetail.useQuery({
      topicId: typeof topicId === "string" ? parseInt(topicId) : topicId,
    });
    return result.data;
  } catch (error) {
    console.error("[Discourse Client] Error fetching topic detail:", error);
    throw error;
  }
}

/**
 * Search for topics
 */
export async function searchTopics(query: string, page: number = 0) {
  try {
    const result = await trpc.discourse.search.useQuery({ query, page });
    return result.data;
  } catch (error) {
    console.error("[Discourse Client] Error searching topics:", error);
    throw error;
  }
}

/**
 * Fetch all categories
 */
export async function getCategories() {
  try {
    const result = await trpc.discourse.categories.useQuery();
    return result.data?.category_list?.categories || [];
  } catch (error) {
    console.error("[Discourse Client] Error fetching categories:", error);
    throw error;
  }
}

/**
 * Fetch user information
 */
export async function getUser(username: string) {
  try {
    const result = await trpc.discourse.user.useQuery({ username });
    return result.data?.user;
  } catch (error) {
    console.error("[Discourse Client] Error fetching user:", error);
    throw error;
  }
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

/**
 * Parse HTML content from Discourse posts (basic sanitization)
 */
export function parsePostContent(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Get avatar URL for a user
 */
export function getAvatarUrl(avatarTemplate: string, size: number = 32): string {
  if (!avatarTemplate) return "";
  return `https://www.horlogeforum.nl${avatarTemplate.replace("{size}", size.toString())}`;
}
