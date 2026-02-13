import { useMemo } from 'react';
import type { Post } from '@/lib/discourse-api';
import { stripHtmlTags } from '@/lib/image-parser';

interface PostWithQuote extends Post {
  quotedPost?: Post;
  quotedContent?: string;
}

/**
 * Hook to extract quoted posts and build threading information
 * Discourse stores reply_to_post_number which indicates which post this is replying to
 */
export function useReplyThreading(posts: Post[]): PostWithQuote[] {
  return useMemo(() => {
    // Create a map of post_number -> Post for quick lookup
    const postMap = new Map<number, Post>();
    posts.forEach(post => {
      postMap.set(post.post_number, post);
    });

    // Enrich posts with quoted post information
    return posts.map(post => {
      const enrichedPost: PostWithQuote = { ...post };

      // If this post is replying to another post
      if (post.reply_to_post_number) {
        const quotedPost = postMap.get(post.reply_to_post_number);
        if (quotedPost) {
          enrichedPost.quotedPost = quotedPost;
          
          // Extract plain text from the quoted post's cooked HTML
          enrichedPost.quotedContent = stripHtmlTags(quotedPost.cooked || '');
        }
      }

      return enrichedPost;
    });
  }, [posts]);
}

/**
 * Get the nesting depth of a post (how many levels deep in a reply chain)
 */
export function getReplyDepth(post: Post, posts: Post[]): number {
  let depth = 0;
  let currentPost: Post | undefined = post;
  const postMap = new Map<number, Post>();
  
  posts.forEach(p => {
    postMap.set(p.post_number, p);
  });

  // Walk up the reply chain
  while (currentPost?.reply_to_post_number) {
    depth++;
    currentPost = postMap.get(currentPost.reply_to_post_number);
    if (depth > 10) break; // Prevent infinite loops
  }

  return depth;
}

/**
 * Get all replies to a specific post
 */
export function getRepliesTo(post: Post, posts: Post[]): Post[] {
  return posts.filter(p => p.reply_to_post_number === post.post_number);
}
