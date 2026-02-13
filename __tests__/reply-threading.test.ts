import { describe, it, expect } from 'vitest';
import { getReplyDepth, getRepliesTo } from '../hooks/use-reply-threading';
import type { Post } from '../lib/discourse-api';

// Mock posts for testing
// Mock Post type for testing
interface MockPost extends Omit<Post, 'raw'> {
  raw?: string;
}

const mockPosts: MockPost[] = [
  {
    id: 1,
    name: 'User1',
    username: 'user1',
    avatar_template: '/avatar.png',
    created_at: '2024-01-01T00:00:00Z',
    cooked: '<p>First post</p>',
    post_number: 1,
    post_type: 1,
    updated_at: '2024-01-01T00:00:00Z',
    reply_count: 2,
    reads: 10,
    score: 5,
    yours: false,
    topic_id: 1,
    topic_slug: 'test-topic',
    display_username: 'User1',
    trust_level: 1,
  },
  {
    id: 2,
    name: 'User2',
    username: 'user2',
    avatar_template: '/avatar.png',
    created_at: '2024-01-01T01:00:00Z',
    cooked: '<p>Reply to first post</p>',
    post_number: 2,
    post_type: 1,
    updated_at: '2024-01-01T01:00:00Z',
    reply_to_post_number: 1,
    reply_count: 1,
    reads: 8,
    score: 3,
    yours: false,
    topic_id: 1,
    topic_slug: 'test-topic',
    display_username: 'User2',
    trust_level: 1,
  },
  {
    id: 3,
    name: 'User3',
    username: 'user3',
    avatar_template: '/avatar.png',
    created_at: '2024-01-01T02:00:00Z',
    cooked: '<p>Reply to second post</p>',
    post_number: 3,
    post_type: 1,
    updated_at: '2024-01-01T02:00:00Z',
    reply_to_post_number: 2,
    reply_count: 0,
    reads: 5,
    score: 1,
    yours: false,
    topic_id: 1,
    topic_slug: 'test-topic',
    display_username: 'User3',
    trust_level: 1,
  },
  {
    id: 4,
    name: 'User4',
    username: 'user4',
    avatar_template: '/avatar.png',
    created_at: '2024-01-01T03:00:00Z',
    cooked: '<p>Another reply to first post</p>',
    post_number: 4,
    post_type: 1,
    updated_at: '2024-01-01T03:00:00Z',
    reply_to_post_number: 1,
    reply_count: 0,
    reads: 6,
    score: 2,
    yours: false,
    topic_id: 1,
    topic_slug: 'test-topic',
    display_username: 'User4',
    trust_level: 1,
  },
];

describe('Reply Threading', () => {
  describe('getReplyDepth', () => {
    it('should return 0 for posts without replies', () => {
      const depth = getReplyDepth(mockPosts[0], mockPosts);
      expect(depth).toBe(0);
    });

    it('should return 1 for direct replies', () => {
      const depth = getReplyDepth(mockPosts[1], mockPosts);
      expect(depth).toBe(1);
    });

    it('should return 2 for nested replies', () => {
      const depth = getReplyDepth(mockPosts[2], mockPosts);
      expect(depth).toBe(2);
    });

    it('should handle multiple replies to the same post', () => {
      const depth1 = getReplyDepth(mockPosts[1], mockPosts);
      const depth2 = getReplyDepth(mockPosts[3], mockPosts);
      expect(depth1).toBe(1);
      expect(depth2).toBe(1);
    });
  });

  describe('getRepliesTo', () => {
    it('should find all direct replies to a post', () => {
      const replies = getRepliesTo(mockPosts[0], mockPosts);
      expect(replies).toHaveLength(2);
      expect(replies[0].post_number).toBe(2);
      expect(replies[1].post_number).toBe(4);
    });

    it('should return empty array for posts with no replies', () => {
      const replies = getRepliesTo(mockPosts[2], mockPosts);
      expect(replies).toHaveLength(0);
    });

    it('should find nested replies', () => {
      const replies = getRepliesTo(mockPosts[1], mockPosts);
      expect(replies).toHaveLength(1);
      expect(replies[0].post_number).toBe(3);
    });
  });

  describe('Reply chain validation', () => {
    it('should correctly identify reply chains', () => {
      // Post 1 -> Post 2 -> Post 3
      expect(mockPosts[1].reply_to_post_number).toBe(1);
      expect(mockPosts[2].reply_to_post_number).toBe(2);
      
      // Post 1 -> Post 4
      expect(mockPosts[3].reply_to_post_number).toBe(1);
    });

    it('should handle posts with no reply_to_post_number', () => {
      const postWithoutReply = { ...mockPosts[0] };
      delete postWithoutReply.reply_to_post_number;
      
      const depth = getReplyDepth(postWithoutReply, mockPosts);
      expect(depth).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should prevent infinite loops in reply chains', () => {
      // Create a circular reference (should not happen in real data)
      const circularPosts: Post[] = [
        { ...mockPosts[0], post_number: 1, reply_to_post_number: 2 },
        { ...mockPosts[1], post_number: 2, reply_to_post_number: 1 },
      ];
      
      const depth = getReplyDepth(circularPosts[0], circularPosts);
      expect(depth).toBeLessThan(15); // Should stop before infinite loop
    });

    it('should handle empty post list', () => {
      const replies = getRepliesTo(mockPosts[0], []);
      expect(replies).toHaveLength(0);
    });

    it('should handle single post', () => {
      const depth = getReplyDepth(mockPosts[0], [mockPosts[0]]);
      expect(depth).toBe(0);
    });
  });
});
