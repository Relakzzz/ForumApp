import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import * as DiscourseAPI from "@/lib/discourse-api";

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching latest topics via tRPC
 */
export function useLatestTopics(page: number = 0) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.Topic[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const { data, isLoading, error } = trpc.discourse.latestTopics.useQuery(
    { page, limit: 20 },
    {
      enabled: true,
      retry: 1,
    }
  );

  useEffect(() => {
    if (isLoading) {
      setState({ data: null, loading: true, error: null });
    } else if (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    } else if (data) {
      const topics = data.topic_list?.topics || [];
      setState({ data: topics, loading: false, error: null });
    }
  }, [data, isLoading, error]);

  return state;
}

/**
 * Hook for fetching topics by category via tRPC
 */
export function useTopicsByCategory(categorySlug: string, page: number = 0) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.Topic[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const { data, isLoading, error } = trpc.discourse.topicsByCategory.useQuery(
    { categorySlug, page, limit: 20 },
    {
      enabled: !!categorySlug,
      retry: 1,
    }
  );

  useEffect(() => {
    if (isLoading) {
      setState({ data: null, loading: true, error: null });
    } else if (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    } else if (data) {
      const topics = data.topic_list?.topics || [];
      setState({ data: topics, loading: false, error: null });
    }
  }, [data, isLoading, error]);

  return state;
}

/**
 * Hook for fetching a specific topic detail via tRPC
 */
export function useTopicDetail(topicId: number | string | null) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.TopicDetail>>({
    data: null,
    loading: true,
    error: null,
  });

  const { data, isLoading, error } = trpc.discourse.topicDetail.useQuery(
    { topicId: typeof topicId === "string" ? parseInt(topicId) : topicId || 0 },
    {
      enabled: !!topicId,
      retry: 1,
    }
  );

  useEffect(() => {
    if (!topicId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    if (isLoading) {
      setState({ data: null, loading: true, error: null });
    } else if (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    } else if (data) {
      setState({ data, loading: false, error: null });
    }
  }, [data, isLoading, error, topicId]);

  return state;
}

/**
 * Hook for searching topics via tRPC
 */
export function useSearchTopics(query: string, page: number = 0) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.SearchResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const { data, isLoading, error } = trpc.discourse.search.useQuery(
    { query, page },
    {
      enabled: !!query.trim(),
      retry: 1,
    }
  );

  useEffect(() => {
    if (!query.trim()) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    if (isLoading) {
      setState({ data: null, loading: true, error: null });
    } else if (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    } else if (data) {
      setState({ data, loading: false, error: null });
    }
  }, [data, isLoading, error, query]);

  return state;
}

/**
 * Hook for fetching categories via tRPC
 */
export function useCategories() {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.Category[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const { data, isLoading, error } = trpc.discourse.categories.useQuery(undefined, {
    retry: 1,
  });

  useEffect(() => {
    if (isLoading) {
      setState({ data: null, loading: true, error: null });
    } else if (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    } else if (data) {
      const categories = data.category_list?.categories || [];
      setState({ data: categories, loading: false, error: null });
    }
  }, [data, isLoading, error]);

  return state;
}

/**
 * Hook for fetching a user via tRPC
 */
export function useUser(username: string | null) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.User>>({
    data: null,
    loading: true,
    error: null,
  });

  const { data, isLoading, error } = trpc.discourse.user.useQuery(
    { username: username || "" },
    {
      enabled: !!username,
      retry: 1,
    }
  );

  useEffect(() => {
    if (!username) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    if (isLoading) {
      setState({ data: null, loading: true, error: null });
    } else if (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    } else if (data) {
      setState({ data: data.user, loading: false, error: null });
    }
  }, [data, isLoading, error, username]);

  return state;
}

/**
 * Hook for fetching paginated topic posts using page-based pagination
 * Supports loading more posts as user scrolls
 */
export function useTopicDetailPaginated(topicId: number | string | null) {
  const [allPosts, setAllPosts] = useState<DiscourseAPI.Post[]>([]);
  const [topicMeta, setTopicMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  // Fetch initial topic data (page 0)
  const { data: initialData, isLoading: initialLoading, error: initialError } = trpc.discourse.topicDetail.useQuery(
    { topicId: typeof topicId === "string" ? parseInt(topicId) : topicId || 0 },
    {
      enabled: !!topicId,
      retry: 1,
    }
  );

  useEffect(() => {
    if (!topicId) {
      setAllPosts([]);
      setTopicMeta(null);
      setLoading(false);
      return;
    }

    if (initialLoading) {
      setLoading(true);
    } else if (initialError) {
      setError(initialError instanceof Error ? initialError : new Error("Unknown error"));
      setLoading(false);
    } else if (initialData) {
      console.log("[useTopicDetailPaginated] Initial load complete", {
        postsCount: initialData.post_stream?.posts?.length,
        totalPosts: initialData.posts_count,
      });
      setTopicMeta(initialData);
      const posts = initialData.post_stream?.posts || [];
      const total = initialData.posts_count || 0;
      
      setAllPosts(posts);
      setTotalPosts(total);
      setCurrentPage(1);  // Set to 1 since initial load is page 1, next load will be page 2
      setLoading(false);
    }
  }, [initialData, initialLoading, initialError, topicId]);

  // Memoized function to load more posts
  const loadMorePosts = useCallback(async () => {
    // Get current state values
    const nextPage = currentPage + 1;
    const postsLoaded = allPosts.length;
    
    console.log("[useTopicDetailPaginated] loadMorePosts called", {
      nextPage,
      postsLoaded,
      totalPosts,
      loadingMore,
    });

    // Early exit conditions
    if (loadingMore) {
      console.log("[useTopicDetailPaginated] Already loading, skipping");
      return;
    }

    if (postsLoaded >= totalPosts) {
      console.log("[useTopicDetailPaginated] All posts loaded, skipping");
      return;
    }

    if (!topicId) {
      console.log("[useTopicDetailPaginated] No topic ID, skipping");
      return;
    }

    setLoadingMore(true);
    try {
      console.log("[useTopicDetailPaginated] Fetching page", nextPage, "via server proxy");
      
      // Use server proxy endpoint - works fine on native platforms
      // For web, the initial load works through tRPC, but pagination can use direct fetch
      // since the response is already cached by the browser
      const numTopicId = typeof topicId === "string" ? parseInt(topicId) : topicId;
      
      // Import getApiBaseUrl to get the correct API server URL
      const { getApiBaseUrl } = await import("@/constants/oauth");
      const apiBaseUrl = getApiBaseUrl();
      const apiUrl = apiBaseUrl 
        ? `${apiBaseUrl}/api/discourse/topic/${numTopicId}?page=${nextPage}`
        : `/api/discourse/topic/${numTopicId}?page=${nextPage}`;
      
      console.log("[useTopicDetailPaginated] Fetching from URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const newPosts = data.post_stream?.posts || [];
      const newTotal = data.posts_count || totalPosts;
      
      console.log("[useTopicDetailPaginated] Received posts", {
        newPostsCount: newPosts.length,
        newTotal,
      });

      if (newPosts.length > 0) {
        setAllPosts(prev => [...prev, ...newPosts]);
        setCurrentPage(nextPage);
        setTotalPosts(newTotal);
        console.log("[useTopicDetailPaginated] Updated state", {
          totalPostsNow: allPosts.length + newPosts.length,
          newPage: nextPage,
        });
      } else {
        console.log("[useTopicDetailPaginated] No new posts received");
      }
    } catch (err) {
      console.error("[useTopicDetailPaginated] Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [topicId, currentPage, loadingMore, allPosts.length, totalPosts]);

  const hasMore = allPosts.length < totalPosts;

  return {
    posts: allPosts,
    topic: topicMeta,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMorePosts,
  };
}
