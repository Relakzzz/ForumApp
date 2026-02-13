# Horlogeforum Mobile App - Design Document

## Overview
A native-feeling Android app for Horlogeforum.nl, a Dutch forum for watch enthusiasts. The app provides a mobile-optimized experience for browsing forum topics, reading discussions, and participating in conversations about watches.

---

## Screen List

1. **Home / Forum Feed** - Browse latest topics and discussions
2. **Category View** - Browse topics within a specific category
3. **Topic Detail** - Read a full topic thread with all posts
4. **Search** - Search for topics and discussions
5. **User Profile** - View user profile and activity
6. **Login** - OAuth authentication with Discourse
7. **Settings** - App preferences and account management

---

## Primary Content and Functionality

### Home / Forum Feed
- **Content**: List of recent topics with metadata (title, category, reply count, view count, last activity)
- **Functionality**:
  - Tap topic to view full thread
  - Pull-to-refresh to load latest topics
  - Infinite scroll or pagination to load more topics
  - Filter by category using a segmented control or dropdown
  - Display category badge and last activity timestamp

### Category View
- **Content**: Topics filtered by selected category
- **Functionality**:
  - Same as home feed but filtered to a specific category
  - Breadcrumb or back button to return to home
  - Display category name and description at the top

### Topic Detail
- **Content**: Full topic thread with all posts, user avatars, timestamps, and post content
- **Functionality**:
  - Scroll through all posts in the thread
  - Tap user avatar to view user profile
  - Reply button (if authenticated) to add a new post
  - Like/react to posts (if supported by Discourse API)
  - Bookmark topic (if authenticated)
  - Share topic link

### Search
- **Content**: Search results showing matching topics
- **Functionality**:
  - Search bar at the top
  - Display results as a list similar to home feed
  - Filter results by category
  - Show "no results" message if search returns empty

### User Profile
- **Content**: User information (avatar, username, member since, post count, bio)
- **Functionality**:
  - Display user's recent posts
  - Show user's activity summary
  - If viewing own profile, show logout button
  - If viewing other user, show message button (if supported)

### Login
- **Content**: OAuth login screen with Discourse
- **Functionality**:
  - "Login with Discourse" button
  - Redirect to Discourse OAuth flow
  - Handle callback and store authentication token
  - Redirect to home screen on successful login

### Settings
- **Content**: App preferences and account management
- **Functionality**:
  - Dark/light mode toggle
  - Notification preferences
  - Logout button (if authenticated)
  - About app section with version number
  - Link to privacy policy and terms of service

---

## Key User Flows

### Browse Forum (Unauthenticated)
1. User opens app → Home screen with latest topics
2. User scrolls through topics or filters by category
3. User taps a topic → Topic Detail screen
4. User reads the discussion
5. User taps "Login" button to participate

### Browse Forum (Authenticated)
1. User opens app → Home screen with latest topics
2. User scrolls through topics or filters by category
3. User taps a topic → Topic Detail screen
4. User reads the discussion and can reply
5. User taps "Reply" button → Reply composer
6. User types reply and submits → Post appears in thread

### Search for Topics
1. User taps Search tab
2. User types search query
3. Results appear as a list
4. User taps a result → Topic Detail screen

### View User Profile
1. User taps user avatar in a post or topic list
2. User Profile screen opens
3. User sees profile info and recent posts
4. User can tap on a post to view the full topic

### Login
1. User taps "Login" button on home screen or in settings
2. OAuth login screen appears
3. User taps "Login with Discourse"
4. Browser opens Discourse OAuth flow
5. User logs in with their Discourse credentials
6. App receives authentication token
7. User is redirected back to home screen

---

## Color Choices

### Brand Colors
- **Primary**: `#A1CEDC` (Light blue - watch forum theme, inspired by watch dials)
- **Primary Dark**: `#1D3D47` (Dark blue-gray - for dark mode)
- **Accent**: `#FF6B6B` (Red - for highlights, new notifications, important actions)
- **Success**: `#51CF66` (Green - for successful actions)
- **Warning**: `#FFD93D` (Yellow - for warnings)

### Text Colors
- **Primary Text**: `#11181C` (Dark gray for light mode)
- **Secondary Text**: `#687076` (Medium gray for light mode)
- **Disabled Text**: `#A0A0A0` (Light gray for light mode)
- **Primary Text (Dark)**: `#ECEDEE` (Light gray for dark mode)
- **Secondary Text (Dark)**: `#9BA1A6` (Medium gray for dark mode)

### Surfaces
- **Background**: `#FFFFFF` (Light mode), `#151718` (Dark mode)
- **Card**: `#F5F5F5` (Light mode), `#1F1F1F` (Dark mode)
- **Elevated**: `#FAFAFA` (Light mode), `#2A2A2A` (Dark mode)

### Borders
- **Border**: `#E0E0E0` (Light mode), `#333333` (Dark mode)
- **Divider**: `#F0F0F0` (Light mode), `#2A2A2A` (Dark mode)

---

## Design Principles

1. **iOS-First**: Design follows Apple Human Interface Guidelines (HIG) to feel like a first-party iOS app
2. **Mobile-Optimized**: All content and interactions are optimized for portrait orientation (9:16) and one-handed usage
3. **Minimal Clutter**: Clean, spacious layout with generous padding and whitespace
4. **Clear Hierarchy**: Important information is prominent; secondary information is subtle
5. **Consistent Spacing**: Uses 8pt grid for all padding and margins
6. **Touch-Friendly**: All interactive elements are at least 44pt tall for easy tapping
7. **Dark Mode Support**: Full support for light and dark modes with appropriate color adjustments

---

## Navigation Structure

```
Tab Bar (Bottom)
├── Home (house.fill)
│   ├── Forum Feed
│   └── Category View
├── Search (magnifyingglass)
│   └── Search Results
├── Profile (person.fill)
│   ├── User Profile
│   └── Settings
└── More (ellipsis)
    ├── Bookmarks
    └── Settings

Modal Screens (not in tab bar)
├── Topic Detail
├── Login
└── Reply Composer
```

---

## Interaction Patterns

### Pull-to-Refresh
- Available on Home and Category screens
- Refreshes the list of topics
- Shows loading indicator during refresh

### Infinite Scroll
- Home and Category screens load more topics as user scrolls to bottom
- Shows loading spinner while fetching more data

### Search
- Real-time search suggestions as user types
- Debounced search to reduce API calls

### Authentication
- OAuth flow using Discourse
- Token stored securely in device storage
- Automatic logout on token expiration

---

## Accessibility Considerations

1. **Text Size**: Minimum 14pt for body text, 12pt for captions
2. **Color Contrast**: WCAG AA standard (4.5:1 for text)
3. **Touch Targets**: All interactive elements at least 44pt
4. **Semantic Labels**: All buttons and images have descriptive labels
5. **Dark Mode**: Full support for users with light sensitivity

---

## Performance Targets

- App launch: < 2 seconds
- Topic list load: < 1 second
- Topic detail load: < 2 seconds
- Search results: < 1 second
- Smooth scrolling: 60 FPS

---

## Future Enhancements

1. **Push Notifications**: Notify users of replies to their posts
2. **Offline Reading**: Cache topics for offline viewing
3. **User Mentions**: @mention other users in replies
4. **Emoji Reactions**: React to posts with emojis
5. **Image Upload**: Upload images in post replies
6. **Bookmarks**: Save favorite topics for later reading
7. **User Blocking**: Block users to hide their posts
8. **Customizable Themes**: Allow users to choose from multiple color schemes
