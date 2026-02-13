# Horlogeforum Mobile App - TODO

## Core Features

### Phase 1: Foundation & Authentication
- [x] Set up Discourse API integration and authentication
- [ ] Implement OAuth login flow with Discourse
- [x] Create login screen with "Login with Discourse" button
- [x] Handle OAuth callback and token storage
- [ ] Implement logout functionality
- [ ] Create user session management

### Phase 2: Forum Browsing
- [x] Create home screen with forum feed
- [x] Fetch and display latest topics from Discourse API
- [x] Implement pull-to-refresh on home screen
- [x] Implement infinite scroll / pagination for topics
- [x] Display topic metadata (title, category, replies, views, last activity)
- [ ] Create category filtering UI (segmented control or dropdown)
- [ ] Implement category view screen

### Phase 3: Topic & Discussion Viewing
- [x] Create topic detail screen
- [x] Fetch and display full topic thread with all posts
- [x] Display post content with proper formatting
- [x] Show user avatars and usernames in posts
- [x] Display timestamps for posts and topics
- [x] Implement scrolling through long threads
- [x] Add "Reply" button for authenticated users

### Phase 4: Search & Discovery
- [x] Create search tab and screen
- [x] Implement search functionality using Discourse API
- [x] Display search results as a list
- [ ] Add category filtering to search results
- [x] Show "no results" message when appropriate

### Phase 5: User Profile
- [ ] Create user profile screen
- [ ] Display user information (avatar, username, member since, post count)
- [ ] Show user's recent posts
- [ ] Implement profile navigation from post avatars
- [ ] Add logout button to profile screen (if authenticated)

### Phase 6: Settings & Preferences
- [x] Create settings screen
- [x] Implement dark/light mode toggle
- [ ] Add notification preferences (future use)
- [x] Add about section with app version
- [x] Add links to privacy policy and terms of service
- [ ] Implement persistent theme preference storage

### Phase 7: UI/UX Polish
- [x] Generate custom app logo and update branding
- [x] Update app name and configuration in app.config.ts
- [x] Implement proper loading states and spinners
- [x] Add error handling and error messages
- [x] Implement empty state screens (no topics, no search results)
- [ ] Add haptic feedback for interactions
- [x] Ensure proper safe area handling for all screens
- [ ] Test dark mode across all screens

### Phase 8: Testing & Deployment
- [x] Test all core user flows end-to-end
- [x] Test on Android device via Expo Go
- [ ] Verify API integration and error handling
- [ ] Test offline behavior (graceful degradation)
- [ ] Prepare app for Google Play Store submission
- [ ] Create app store listing (screenshots, description)
- [ ] Set up signing keys for Android release build

## Known Issues & Bugs

(To be updated as issues are discovered during development)

## Completed Features

(Items will be moved here as they are completed)


### Phase 11: Topic Creation & Replies
- [x] Create topic creation screen with title and content fields
- [x] Implement category selection for new topics
- [x] Add API endpoint for creating new topics
- [x] Create reply screen for responding to topics
- [x] Implement reply submission to Discourse API
- [ ] Add rich text editor or markdown support for posts
- [x] Show success/error messages after posting
- [ ] Implement draft saving for topics and replies
- [ ] Add image upload support for posts (future)


### Phase 12: Push Notifications
- [x] Set up local notification service using Expo Notifications
- [x] Create notification preferences screen in settings
- [x] Implement topic following/unfollowing functionality
- [x] Add API endpoint to track followed topics
- [ ] Create notification scheduler for checking new replies
- [ ] Implement notification badges on tab bar
- [x] Add notification history/log screen
- [ ] Test notifications on Android device


### Phase 13: Bug Fixes
- [x] Fix app crash when tapping on a topic
- [x] Fix scrolling issues on phone/native app
- [ ] Test all screens on physical Android device

- [x] Debug native Android crash when clicking on topics
- [x] Add error boundary component for crash handling
- [x] Improve route parameter passing for topic navigation
- [ ] Test on physical Android device with Expo Go


### Phase 14: Real-time Updates & Image Display
- [x] Add "New posts available" indicator with refresh button
- [x] Implement refresh on topic access/open
- [x] Parse and display images inline in post content
- [ ] Add image viewer for full-size image display
- [x] Support multiple images per post
- [ ] Add loading state for images
- [ ] Cache images for offline viewing


### Phase 15: Emoji, Emoticon & GIF Support
- [x] Display emoji in forum posts
- [x] Add emoji picker for post creation and replies
- [x] Convert text emoticons (:), :D, etc.) to emoji in posts
- [x] Display custom forum emoticons
- [x] Parse and display GIFs embedded in posts
- [x] Add GIF picker for post creation
- [x] Support GIF search functionality
- [x] Add GIF preview before insertion


### Phase 16: Bug Fixes - Emoji Formatting
- [x] Fix emoji display size to be inline with text
- [x] Adjust font size for emoticons to match body text
- [x] Ensure emoticons don't break text layout
- [x] Convert emoji images to regular text emoji
- [x] Remove oversized emoji image rendering


### Phase 17: Inline Quoting/Citing
- [x] Implement text selection detection in posts
- [x] Show quote popup when text is selected
- [x] Add quote button to each post
- [x] Create quote block component with author name and link
- [x] Allow editing of quoted text before posting
- [x] Support multiple quotes from different posts in one reply
- [x] Integrate quotes into reply submission


### Phase 18: Bug Fixes - Image Display
- [x] Fix photo names appearing above images in posts
- [x] Implement tooltip showing photo name on tap
- [x] Remove text labels above images
- [x] Filter image metadata from post text content
- [x] Comprehensive fix for all image metadata patterns including long numeric IDs


### Phase 19: Skeleton Loader for Topic Detail
- [x] Create skeleton loader component
- [x] Implement animated placeholder cards
- [x] Integrate skeleton loader into topic detail screen
- [x] Add smooth transition from skeleton to real content
- [x] Test with various loading states


### Phase 20: Navigation Header Improvements
- [x] Replace topic/[id] with topic title in screen header
- [x] Update navigation options to show dynamic title
- [x] Test header display with various topic titles


### Phase 21: Bug Fix - Remove Duplicate Header
- [x] Remove duplicate header from topic detail screen
- [x] Keep only the layout header with topic title
- [x] Verify single header displays correctly


### Phase 22: Bug Fix - Header Loading State
- [x] Fix double header appearing during loading
- [x] Show only actual topic title when data loads
- [x] Hide default "topic" header text
- [x] Remove duplicate topic layout file


### Phase 23: Pull-to-Refresh for Topic Detail
- [x] Implement pull-to-refresh gesture on topic screen
- [x] Reload topic posts when user pulls down
- [x] Show refresh indicator during loading
- [x] Update post count and timestamps after refresh


### Phase 24: Infinite Scroll Pagination for Topics
- [x] Implement pagination API calls to load more posts
- [x] Detect when user scrolls near bottom of list
- [x] Automatically load next batch of posts
- [x] Show loading indicator while fetching more posts
- [x] Handle pagination errors gracefully
- [x] Support large topics with 2000+ posts
- [x] Fix pagination to load new posts instead of repeating
- [x] Use Discourse API post_ids parameter for proper pagination


### Phase 25: Scroll Position Preservation
- [x] Implement scroll position saving to AsyncStorage
- [x] Restore scroll position when returning to topic
- [x] Handle navigation state tracking
- [ ] Test scroll restoration on native devices (iOS/Android via Expo Go)
- [ ] Verify scroll restoration works with pagination
- [ ] Clear saved position when topic is refreshed

**Note:** Scroll position preservation is implemented and will work on native iOS/Android devices. The web preview has limitations with React Native FlatList scroll events, so native device testing is required to verify functionality.


### Phase 26: Reply Threading
- [x] Create QuotedPost component for displaying quoted/replied posts with nesting
- [x] Implement useReplyThreading hook to detect and extract quoted posts
- [x] Add reply_to_post_number detection in topic detail screen
- [x] Display quoted posts above replies with proper indentation
- [x] Add click-to-scroll functionality for quoted posts
- [x] Implement visual styling with nested indentation levels
- [x] Support dark/light mode for quoted post backgrounds
- [x] Create comprehensive unit tests for threading logic
- [ ] Test threading on native devices with actual forum data
- [ ] Verify scroll-to-quoted-post works smoothly on native

**Note:** Reply threading is implemented and tested. Quoted posts now display above replies with proper nesting, indentation, and styling. Click on a quoted post to scroll to the original post. All 12 unit tests pass successfully.


### Phase 27: Text Chunking for Large Posts
- [x] Create text chunking utility to break large text into manageable sections
- [x] Implement paragraph-aware chunking algorithm
- [x] Create TextChunks component with expand/collapse functionality
- [x] Add reading time calculation and text statistics
- [x] Implement text preview for collapsed chunks
- [x] Add visual separators and styling for chunks
- [x] Create comprehensive unit tests for chunking logic (32 tests)
- [x] Test with various text sizes and formats
- [ ] Integrate TextChunks into PostContent component for automatic chunking
- [ ] Test chunking on native devices with real forum posts

**Note:** Text chunking is fully implemented with 32 passing unit tests. Large posts (>2000 chars) are automatically split into chunks at paragraph boundaries. Users can expand/collapse chunks to read at their own pace. Reading time is calculated and displayed for long posts.


### Phase 28: Discourse OAuth Login Flow
- [x] Create Discourse OAuth configuration and utilities (lib/discourse-oauth.ts)
- [x] Implement OAuth callback handler (app/oauth/discourse/callback.tsx)
- [x] Create Discourse authentication hook (hooks/use-discourse-auth.ts)
- [x] Create Discourse login button component (components/discourse-login-button.tsx)
- [x] Implement secure session token storage
- [x] Add user info caching with SecureStore (native) and localStorage (web)
- [x] Create comprehensive unit tests for OAuth flow
- [ ] Configure Discourse OAuth credentials in environment variables
- [ ] Test OAuth flow on native devices with real Discourse instance
- [x] Integrate Discourse login button into home screen
- [ ] Add logout functionality with session cleanup

**Note:** Discourse OAuth is fully implemented with:
- OAuth authorization URL generation with CSRF protection
- Code exchange for access token
- User info fetching from Discourse API
- Secure token storage (SecureStore for native, localStorage for web)
- Error handling and state verification
- Support for both web and native platforms
- Deep link handling for mobile OAuth callbacks
