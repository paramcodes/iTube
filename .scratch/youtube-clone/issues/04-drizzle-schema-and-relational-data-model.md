# Drizzle ORM Schema and Relational Data Model

Type: grilling
Status: resolved
Blocked by: 03

## Question

What are the exact Drizzle table definitions, foreign keys, constraints, and indexes across `users`, `channels`, `videos`, `playlists`, `playlist_videos`, `comments`, `subscriptions`, `video_reactions`, `comment_reactions`, and `watch_history`? How are 1-level nested comments (top-level comment vs reply), binary reactions (`like` / `dislike`), and video visibility states (`public`, `unlisted`, `private`, `scheduled`) enforced cleanly at the schema level?

## Answer

Drizzle PostgreSQL relational schema defined and validated for `packages/db`:

### 1. Enums
- `video_visibility`: `'public' | 'unlisted' | 'private' | 'scheduled'`
- `reaction_type`: `'like' | 'dislike'`
- `playlist_type`: `'custom' | 'watch_later' | 'liked_videos'`
- `playlist_visibility`: `'public' | 'unlisted' | 'private'`

### 2. Core Tables & Foreign Key Topology
- **`users`**:
  `id` (text, PK, CUID2), `clerk_id` (text, unique, indexed), `email` (text), `created_at`, `updated_at`.
- **`channels`**:
  `id` (text, PK, CUID2), `user_id` (text, FK `users.id` cascade, indexed), `name` (text), `handle` (text, unique, indexed), `avatar_url` (text), `banner_url` (text), `description` (text), `subscriber_count` (integer, default 0), `created_at`, `updated_at`.
- **`videos`**:
  `id` (text, PK, CUID2), `channel_id` (text, FK `channels.id` cascade, indexed), `title` (text), `description` (text), `category` (text, indexed), `mux_asset_id` (text), `mux_playback_id` (text), `mux_upload_id` (text), `duration_seconds` (integer), `aspect_ratio` (text), `visibility` (`video_visibility`, default `'private'`), `published_at` (timestamptz), `view_count` (bigint, default 0), `like_count` (integer, default 0), `dislike_count` (integer, default 0), `comment_count` (integer, default 0), `created_at`, `updated_at`.
  - Indexes: `(channel_id)`, `(visibility, published_at)`, `(category, visibility)`.
- **`comments`**:
  `id` (text, PK, CUID2), `video_id` (text, FK `videos.id` cascade, indexed), `channel_id` (text, FK `channels.id` cascade, indexed), `parent_id` (text, FK self-referential `comments.id` cascade, nullable), `content` (text), `like_count` (integer, default 0), `dislike_count` (integer, default 0), `reply_count` (integer, default 0), `created_at`, `updated_at`.
  - Depth-1 Invariant: A reply row requires `parent_id` pointing to a root comment (`parent_id IS NULL`). Nested sub-replies beyond depth 1 are disallowed by application/mutation guards.
  - Index: `(video_id, parent_id)`.
- **`subscriptions`**:
  `subscriber_channel_id` (text, FK `channels.id` cascade), `target_channel_id` (text, FK `channels.id` cascade), `created_at`.
  - Composite PK: `(subscriber_channel_id, target_channel_id)`.
  - Check Constraint: `subscriber_channel_id <> target_channel_id`.
- **`video_reactions`**:
  `channel_id` (text, FK `channels.id` cascade), `video_id` (text, FK `videos.id` cascade), `type` (`reaction_type`), `created_at`.
  - Composite PK: `(channel_id, video_id)`.
- **`comment_reactions`**:
  `channel_id` (text, FK `channels.id` cascade), `comment_id` (text, FK `comments.id` cascade), `type` (`reaction_type`), `created_at`.
  - Composite PK: `(channel_id, comment_id)`.
- **`playlists`**:
  `id` (text, PK, CUID2), `channel_id` (text, FK `channels.id` cascade, indexed), `title` (text), `description` (text), `type` (`playlist_type`, default `'custom'`), `visibility` (`playlist_visibility`, default `'private'`), `video_count` (integer, default 0), `created_at`, `updated_at`.
  - Partial unique index on `(channel_id, type)` where `type <> 'custom'`.
- **`playlist_videos`**:
  `playlist_id` (text, FK `playlists.id` cascade), `video_id` (text, FK `videos.id` cascade), `position` (integer), `added_at`.
  - Composite PK: `(playlist_id, video_id)`.
  - Index: `(playlist_id, position)`.
- **`watch_history`**:
  `channel_id` (text, FK `channels.id` cascade), `video_id` (text, FK `videos.id` cascade), `last_position_seconds` (integer), `total_duration_seconds` (integer), `completed` (boolean, default false), `updated_at` (timestamptz).
  - Composite PK: `(channel_id, video_id)`.
  - Index: `(channel_id, updated_at DESC)`.
