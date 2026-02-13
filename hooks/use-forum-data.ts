import { useCallback, useEffect, useState } from "react";
import * as DiscourseAPI from "@/lib/discourse-api";

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching latest topics
 */
export function useLatestTopics(page: number = 0) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.Topic[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const topics = await DiscourseAPI.getLatestTopics(page);
        setState({ data: topics, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        });
      }
    };

    fetchData();
  }, [page]);

  return state;
}

/**
 * Hook for fetching topics by category
 */
export function useTopicsByCategory(categorySlug: string, page: number = 0) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.Topic[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const topics = await DiscourseAPI.getTopicsByCategory(categorySlug, page);
        setState({ data: topics, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        });
      }
    };

    fetchData();
  }, [categorySlug, page]);

  return state;
}

/**
 * Hook for fetching a specific topic detail
 */
export function useTopicDetail(topicId: number | string | null) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.TopicDetail>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!topicId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const topic = await DiscourseAPI.getTopicDetail(topicId);
        setState({ data: topic, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        });
      }
    };

    fetchData();
  }, [topicId]);

  return state;
}

/**
 * Hook for searching topics
 */
export function useSearchTopics(query: string, page: number = 0) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.SearchResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const search = useCallback(async (searchQuery: string, searchPage: number = 0) => {
    if (!searchQuery.trim()) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const results = await DiscourseAPI.searchTopics(searchQuery, searchPage);
      setState({ data: results, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    }
  }, []);

  useEffect(() => {
    search(query, page);
  }, [query, page, search]);

  return { ...state, search };
}

/**
 * Hook for fetching categories
 */
export function useCategories() {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.Category[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const categories = await DiscourseAPI.getCategories();
        setState({ data: categories, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        });
      }
    };

    fetchData();
  }, []);

  return state;
}

/**
 * Hook for fetching a user
 */
export function useUser(username: string | null) {
  const [state, setState] = useState<UseFetchState<DiscourseAPI.User>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!username) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const user = await DiscourseAPI.getUser(username);
        setState({ data: user, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        });
      }
    };

    fetchData();
  }, [username]);

  return state;
}
