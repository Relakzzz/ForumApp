/**
 * Discourse API Service
 * Handles all API calls to the Horlogeforum.nl Discourse instance
 */

const DISCOURSE_URL = "https://www.horlogeforum.nl";
const API_BASE = `${DISCOURSE_URL}/api`;

export interface DiscourseError {
  errors?: string[];
  error_type?: string;
}

export interface Topic {
  id: number;
  title: string;
  slug: string;
  posts_count: number;
  reply_count: number;
  views: number;
  created_at: string;
  bumped_at: string;
  category_id: number;
  category_name?: string;
  pinned: boolean;
  closed: boolean;
  archived: boolean;
  user_id: number;
  username?: string;
  avatar_template?: string;
  last_posted_at?: string;
  last_poster_username?: string;
}

export interface TopicDetail extends Topic {
  post_stream: {
    posts: Post[];
    stream: number[];
  };
}

export interface Post {
  id: number;
  name: string;
  username: string;
  avatar_template: string;
  created_at: string;
  cooked: string;
  post_number: number;
  post_type: number;
  updated_at: string;
  reply_to_post_number?: number;
  reply_count: number;
  reads: number;
  score: number;
  yours: boolean;
  topic_id: number;
  topic_slug: string;
  display_username: string;
  primary_group_name?: string;
  flair_name?: string;
  flair_url?: string;
  flair_bg_color?: string;
  flair_color?: string;
  trust_level: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  topic_count: number;
  post_count: number;
  color: string;
  text_color: string;
  parent_category_id?: number;
  read_restricted: boolean;
  notification_level?: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  avatar_template: string;
  title?: string;
  badge_count: number;
  time_read: number;
  recent_timeread: number;
  trust_level: number;
  moderator: boolean;
  admin: boolean;
  created_at: string;
  bio_raw?: string;
  bio_cooked?: string;
  website?: string;
  location?: string;
  post_count: number;
  topic_count: number;
}

export interface SearchResult {
  posts: Array<Post & { topic_id: number; topic_title: string }>;
  topics: Topic[];
  users: User[];
  categories: Category[];
}

/**
 * Fetch latest topics from the forum
 */
export async function getLatestTopics(page: number = 0, limit: number = 20): Promise<Topic[]> {
  try {
    const response = await fetch(`${API_BASE}/latest.json?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.topic_list?.topics || [];
  } catch (error) {
    console.error("[Discourse API] Error fetching latest topics:", error);
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
): Promise<Topic[]> {
  try {
    const response = await fetch(
      `${API_BASE}/category/${categorySlug}.json?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.topic_list?.topics || [];
  } catch (error) {
    console.error("[Discourse API] Error fetching topics by category:", error);
    throw error;
  }
}

/**
 * Fetch a specific topic with all posts
 */
export async function getTopicDetail(topicId: number | string): Promise<TopicDetail> {
  try {
    const response = await fetch(`${API_BASE}/t/${topicId}.json`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Discourse API] Error fetching topic detail:", error);
    throw error;
  }
}

/**
 * Search for topics
 */
export async function searchTopics(query: string, page: number = 0): Promise<SearchResult> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${API_BASE}/search.json?q=${encodedQuery}&page=${page}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Discourse API] Error searching topics:", error);
    throw error;
  }
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE}/categories.json`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.category_list?.categories || [];
  } catch (error) {
    console.error("[Discourse API] Error fetching categories:", error);
    throw error;
  }
}

/**
 * Fetch user information
 */
export async function getUser(username: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE}/users/${username}.json`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("[Discourse API] Error fetching user:", error);
    throw error;
  }
}

/**
 * Get current user (requires authentication)
 */
export async function getCurrentUser(apiKey: string, apiUsername: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE}/users/${apiUsername}.json`, {
      headers: {
        "Api-Key": apiKey,
        "Api-Username": apiUsername,
      },
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("[Discourse API] Error fetching current user:", error);
    throw error;
  }
}

/**
 * Create a new post/reply (requires authentication)
 */
export async function createPost(
  topicId: number,
  raw: string,
  apiKey: string,
  apiUsername: string
): Promise<Post> {
  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
        "Api-Username": apiUsername,
      },
      body: JSON.stringify({
        topic_id: topicId,
        raw: raw,
      }),
    });
    if (!response.ok) {
      const error = (await response.json()) as DiscourseError;
      throw new Error(error.errors?.[0] || error.error_type || "Failed to create post");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Discourse API] Error creating post:", error);
    throw error;
  }
}

/**
 * Get avatar URL for a user
 */
export function getAvatarUrl(avatarTemplate: string, size: number = 32): string {
  if (!avatarTemplate) return "";
  return `${DISCOURSE_URL}${avatarTemplate.replace("{size}", size.toString())}`;
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
  // Remove HTML tags for plain text display
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}


/**
 * Fetch specific posts from a topic by their post IDs
 */
export async function getTopicPosts(topicId: number | string, postIds: number[]): Promise<TopicDetail> {
  try {
    const postIdsParam = postIds.join(",");
    const response = await fetch(`${API_BASE}/t/${topicId}/posts.json?post_ids=${postIdsParam}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Discourse API] Error fetching topic posts:", error);
    throw error;
  }
}
