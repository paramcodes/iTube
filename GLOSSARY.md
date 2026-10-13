# YouTube Clone Domain

Core vocabulary and domain concepts for the YouTube clone monorepo platform.

## Identity & Channels

**User**:
An authenticated identity entity managed via Clerk. An identity owns one or more Channels and holds private account credentials.
_Avoid_: Channel, Member, Account

**Channel**:
A creator entity that owns videos, playlists, and public branding (name, handle, avatar, banner). All public community actions (comments, subscriptions, likes) are performed as a Channel.
_Avoid_: Profile, User Profile, Author

**Subscription**:
A directional relationship where a Channel follows another Channel to receive its published video feed.
_Avoid_: Follow, Connection

## Media & Ingestion

**Asset**:
A raw video file uploaded directly to Mux storage for transcoding, HLS stream generation, and auto-captioning.
_Avoid_: File, Raw Video, Upload

**Playback ID**:
A public Mux token that allows the client player to stream HLS video, load WebVTT captions, and fetch storyboard thumbnails.
_Avoid_: Stream URL, Video URL, Video ID

**Video**:
A media entity associated with a Channel containing creative metadata (title, description, category, visibility, tags) and linked to an Asset.
_Avoid_: Post, Media, Content

**Visibility**:
The distribution state of a Video: `public`, `unlisted`, `private`, or `scheduled`.
_Avoid_: Privacy, Status

**Storyboard**:
A generated image sprite of periodic video frames used for scrub-bar hover previews in the video player.
_Avoid_: Frame strip, Preview timeline

## Social & Playback

**View Count**:
A deduplicated, debounced tally of qualifying video watch events meeting a minimum watch duration threshold.
_Avoid_: Hits, Impressions, Clicks

**Watch History**:
A recorded list of Videos viewed by a Channel, retaining playback progress timestamps for resume-playback.
_Avoid_: View log, History log

**Reaction**:
A binary sentiment choice (`like` or `dislike`) cast by a Channel on a Video or Comment.
_Avoid_: Vote, Rating, Karma

**Playlist**:
An ordered collection of Videos curated by a Channel, either custom-created or system-managed (Watch Later, Liked Videos).
_Avoid_: Queue, Collection, Mix
