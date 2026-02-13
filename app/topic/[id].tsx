import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { StyleSheet, FlatList, ActivityIndicator, Pressable, Image, View, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect, useNavigation } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PostContent } from "@/components/post-content";
import { TopicDetailSkeletonLoader } from "@/components/skeleton-loader";
import { useTopicDetail, useTopicDetailPaginated } from "@/hooks/use-forum-data-trpc";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthForum } from "@/hooks/use-auth-forum";
import { useNotifications } from "@/hooks/use-notifications";
import { useQuotes } from "@/contexts/quote-context";
import { QuotePopup } from "@/components/quote-popup";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { useReplyThreading, getReplyDepth } from "@/hooks/use-reply-threading";
import { QuotedPost } from "@/components/quoted-post";

const FORUM_URL = "https://www.horlogeforum.nl";

// Helper function to extract plain text from HTML
function extractPlainText(html: string | undefined): string {
  if (!html) return "";
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export default function TopicDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { user } = useAuthForum();
  const { isFollowing, follow, unfollow } = useNotifications();
  const { addQuote } = useQuotes();

  const topicId = params.id ? parseInt(params.id as string) : null;
  const { saveScrollPosition, loadScrollPosition } = useScrollPosition(topicId);
  const flatListRef = useRef<FlatList>(null);
  
  const [isFollowingTopic, setIsFollowingTopic] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [lastPostCount, setLastPostCount] = useState<number | null>(null);
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");

  // Fetch topic data with pagination support
  const { posts, topic, loading, loadingMore, error, hasMore, loadMorePosts } = useTopicDetailPaginated(topicId);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const scrollToLastPost = () => {
    if (posts.length > 0) {
      // If there are more posts to load, we should load them first or scroll to the current end
      if (hasMore) {
        // Option 1: Scroll to the end of current list and trigger load more
        flatListRef.current?.scrollToEnd({ animated: true });
        // Option 2: Explicitly call loadMorePosts if needed
        loadMorePosts();
      } else {
        // If all posts are loaded, scroll to the very end
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    }
  };

  // Refresh topic when screen is focused
  useFocusEffect(
    React.useCallback(() => {

      if (topicId) {
        console.log("[TopicDetail] Screen focused, checking for new posts");
        checkFollowStatus();
        // Check if there are new posts
        if (topic && lastPostCount !== null && topic.posts_count > lastPostCount) {
          setHasNewPosts(true);
        }
        if (topic && lastPostCount === null) {
          setLastPostCount(topic.posts_count);
        }
        
        // Restore scroll position when returning to topic
        if (posts.length > 0) {
          console.log("[TopicDetail] Attempting to restore scroll position");
          loadScrollPosition().then((offset) => {
            if (offset !== null && flatListRef.current) {
              console.log(`[TopicDetail] Restoring scroll to offset: ${offset}`);
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset, animated: false });
              }, 100);
            } else {
              console.log("[TopicDetail] No saved scroll position");
            }
          });
        }
      }
    }, [topicId, topic, lastPostCount, posts.length, loadScrollPosition])
  );

  useLayoutEffect(() => {
    if (topic?.title) {
      navigation.setOptions({
        title: topic.title,
      });
    }
  }, [topic?.title, navigation]);

  useEffect(() => {
    if (topicId) {
      console.log("[TopicDetail] Loading topic:", topicId);
      checkFollowStatus();
    }
  }, [topicId]);

  const checkFollowStatus = async () => {
    if (topicId) {
      try {
        const following = await isFollowing(topicId);
        setIsFollowingTopic(following);
      } catch (err) {
        console.error("[TopicDetail] Error checking follow status:", err);
      }
    }
  };

  const handleFollowToggle = async () => {
    if (!topicId) return;
    setFollowLoading(true);
    try {
      if (isFollowingTopic) {
        await unfollow(topicId);
        setIsFollowingTopic(false);
      } else {
        await follow(topicId);
        setIsFollowingTopic(true);
      }
    } catch (error) {
      console.error("[TopicDetail] Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasNewPosts(false);
      setLastPostCount(topic?.posts_count || 0);
    } catch (error) {
      console.error("[TopicDetail] Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (err) {
      return "";
    }
  };

  const getAvatarUrl = (template: string | undefined) => {
    if (!template) return "";
    return `${FORUM_URL}${template.replace("{size}", "48")}`;
  };

  const handleQuotePost = (post: any) => {
    // Extract plain text from the post content
    const plainText = extractPlainText(post.cooked);
    if (plainText.length > 200) {
      setSelectedText(plainText.substring(0, 200) + "...");
    } else {
      setSelectedText(plainText);
    }
    setSelectedPost(post);
    setShowQuotePopup(true);
  };

  const handleQuotePopupClose = () => {
    setShowQuotePopup(false);
    setSelectedText("");
    setSelectedPost(null);
  };

  const handleReply = () => {
    if (!topicId) return;
    router.push({
      pathname: "/reply-topic",
      params: {
        topicId: topicId.toString(),
        topicTitle: topic?.title || "",
      },
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {hasNewPosts && (
        <Pressable
          onPress={handleRefresh}
          style={[styles.newPostsIndicator, { backgroundColor: tintColor }]}
        >
          <ThemedText style={styles.newPostsText}>
            New posts available • Tap to refresh
          </ThemedText>
        </Pressable>
      )}
      {user && (
        <Pressable
          onPress={handleFollowToggle}
          disabled={followLoading}
          style={[
            styles.followButton,
            {
              backgroundColor: isFollowingTopic ? tintColor : "transparent",
              borderColor: tintColor,
              opacity: followLoading ? 0.6 : 1,
              marginHorizontal: 16,
              marginVertical: 8,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.followButtonText,
              { color: isFollowingTopic ? "#fff" : tintColor },
            ]}
          >
            {isFollowingTopic ? "Following" : "Follow"}
          </ThemedText>
        </Pressable>
      )}

      <View style={styles.topicInfo}>
        {topic?.category_name && (
          <ThemedText type="default" style={styles.category}>
            {topic.category_name}
          </ThemedText>
        )}
        <ThemedText type="default" style={styles.meta}>
          {topic?.posts_count || 0} replies • {topic?.views || 0} views
        </ThemedText>
        <ThemedText type="default" style={styles.meta}>
          Started {formatDate(topic?.created_at)}
        </ThemedText>
      </View>
    </View>
  );

  const renderPost = ({ item: post }: any) => {
    if (!post || !post.username) return null;
    
    try {
      // Find the quoted post if this is a reply
      const quotedPost = post.reply_to_post_number 
        ? posts.find(p => p.post_number === post.reply_to_post_number)
        : null;
      
      const quotedContent = quotedPost 
        ? extractPlainText(quotedPost.cooked)
        : null;
      
      const replyDepth = post.reply_to_post_number ? getReplyDepth(post, posts) : 0;
      
	      return (
	        <View style={[styles.post, { borderBottomColor: borderColor }]}>
	          {/* Display quoted post if this is a reply */}
	          {quotedPost && quotedContent && (
	            <QuotedPost
	              username={quotedPost.username}
	              content={quotedContent}
	              rawHtml={quotedPost.cooked}
	              nestLevel={replyDepth - 1}
	              onPress={() => {
                // Scroll to the quoted post
                const quotedIndex = posts.findIndex(p => p.post_number === post.reply_to_post_number);
                if (quotedIndex >= 0 && flatListRef.current) {
                  flatListRef.current.scrollToIndex({ index: quotedIndex, animated: true });
                }
              }}
            />
          )}
          
          <View style={styles.postHeader}>
            {post.avatar_template && (
              <Image 
                source={{ uri: getAvatarUrl(post.avatar_template) }} 
                style={styles.avatar}
                onError={(error) => console.log("[TopicDetail] Avatar load error:", error)}
              />
            )}
            <View style={styles.postMeta}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {post.username}
              </ThemedText>
              {post.created_at && (
                <ThemedText type="default" style={styles.postDate}>
                  {formatDate(post.created_at)}
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.postContent}>
            <PostContent html={post.raw} cooked={post.cooked} />
          </View>

          {user && (
            <Pressable
              onPress={() => handleQuotePost(post)}
              style={[styles.quoteButton, { backgroundColor: tintColor }]}
            >
              <ThemedText style={styles.quoteButtonText}>Quote</ThemedText>
            </Pressable>
          )}
        </View>
      );
    } catch (err) {
      console.error("[TopicDetail] Error rendering post:", err);
      return null;
    }
  };

  const renderFooter = () => {
    const showLoadMore = hasMore && !loadingMore;
    const showLoading = loadingMore;
    
    return (
      <View style={styles.footer}>
        {showLoading && (
          <ActivityIndicator size="large" color={tintColor} style={{ marginVertical: 20 }} />
        )}
        {showLoadMore && (
          <Pressable
            onPress={loadMorePosts}
            style={[styles.loadMoreButton, { backgroundColor: tintColor }]}
          >
            <ThemedText style={styles.loadMoreText}>
              Load More Posts ({posts.length}/{topic?.posts_count || 0})
            </ThemedText>
          </Pressable>
        )}
        {!hasMore && posts.length > 0 && (
          <ThemedText style={styles.endMessage}>
            End of thread
          </ThemedText>
        )}
      </View>
    );
  };

  if (loading) {
    return <TopicDetailSkeletonLoader />;
  }

  if (error || !topic) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          {typeof error === 'string' ? error : "Failed to load topic"}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => `${item.id}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        onScrollToIndexFailed={(info) => {
          console.log("[TopicDetail] Scroll to index failed, attempting fallback", info.index);
          // Fallback: scroll to offset or just scroll to end if it was the last item
          if (info.index >= posts.length - 1) {
            flatListRef.current?.scrollToEnd({ animated: true });
          } else {
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }
        }}
        onScroll={(event) => {
          saveScrollPosition(event.nativeEvent.contentOffset.y);
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      />

      <View style={[styles.fabContainer, { bottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Pressable
          onPress={scrollToTop}
          style={[styles.scrollFab, { backgroundColor: tintColor, marginBottom: 8 }]}
        >
          <ThemedText style={styles.scrollFabText}>↑</ThemedText>
        </Pressable>
        
        <Pressable
          onPress={scrollToLastPost}
          style={[styles.scrollFab, { backgroundColor: tintColor, marginBottom: 8 }]}
        >
          <ThemedText style={styles.scrollFabText}>↓</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleReply}
          style={[styles.fab, { backgroundColor: tintColor }]}
        >
          <ThemedText style={styles.fabText}>Reply</ThemedText>
        </Pressable>
      </View>
      
      {showQuotePopup && selectedPost && (
        <QuotePopup
          visible={showQuotePopup}
          selectedText={selectedText}
          postId={selectedPost.id}
          authorName={selectedPost.name}
          authorUsername={selectedPost.username}
          timestamp={selectedPost.created_at}
          topicId={topicId || 0}
          onClose={handleQuotePopupClose}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  newPostsIndicator: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  newPostsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: "center",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  topicInfo: {
    gap: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
  },
  meta: {
    fontSize: 13,
    opacity: 0.6,
  },
  post: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postMeta: {
    flex: 1,
  },
  postDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  postContent: {
    marginBottom: 12,
  },
  quoteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  quoteButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center",
  },
  loadMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  endMessage: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    alignItems: "center",
  },
  scrollFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollFabText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  fab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 28,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
