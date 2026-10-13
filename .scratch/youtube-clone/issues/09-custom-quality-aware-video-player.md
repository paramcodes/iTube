# Custom Quality-Aware Video Player Component Prototype

Type: prototype
Status: resolved
Blocked by: 01, 02

## Question

How should the custom video player interface be structured using Mux Player React or Media Chrome to match YouTube's web player controls (play/pause toggle, volume slider with mute, current/total time display, playback speed menu, HLS quality level selector, theater mode toggle, full screen, and WebVTT storyboard thumbnail scrubbing tooltip)?

## Answer

An interactive UI prototype evaluating three structurally distinct player architectures was built and verified at `.scratch/youtube-clone/prototypes/video-player-prototype.html`.

---

### 1. Evaluated Prototype Variants

Three structural variants were built and compared using the floating switcher pill:

- **Variant A (Authentic YouTube Web Media Chrome Replica - Winner for Watch Page)**:
  - **Bottom Control Rack**: Full-width gradient scrim (`linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)`) with slotted left/right control clusters.
  - **Scrubber Architecture**: 3-layer track (background `rgba(255,255,255,0.2)`, buffer `rgba(255,255,255,0.4)`, active progress `#ff0000`) that expands from `3px` to `5px` on hover with a red circle scrubber thumb scaling from `0` to `1`.
  - **Storyboard Scrubbing Tooltip**: Floating 160×90px card hovering over the scrubber cursor, rendering spatial WebVTT sprite coordinates with an attached monospace time badge (`MM:SS`).
  - **Volume Slider**: Expandable horizontal slider transitioning from `0px` to `64px` inline on container hover, with dynamic mute/low/high volume icons.
  - **Drill-Down Settings Popover**: 2-level nested popover menu. The top level exposes `Playback speed` and `Quality`. Clicking either triggers a smooth horizontal drill-down to submenus (speed: 0.25x–2.0x; quality: Auto / 1080p60 HD / 720p60 / 480p / 360p / 240p).
  - **Ambient Mode**: Offscreen 2D canvas dynamically samples video frames (32×18 resolution) and projects a blurred radial glow (`filter: blur(80px); opacity: 0.35`) behind the player container on default view.

- **Variant B (Mux Player Modern Themed Floating Pill)**:
  - **Elevated Glassmorphism Rack**: Floating pill bar (`bg-black/75 backdrop-blur-xl border border-white/15 rounded-2xl`) suspended 16px above the video bottom edge.
  - **Segmented Chapters**: High-contrast blue accent track with chapter title callout (`Chapter 1: The Awakening`) and compact pill badges (`MUX HLS 1080p`).
  - *Adopted for embedded players and creator preview dialogs.*

- **Variant C (Headless Cinema & Keyboard-First HUD)**:
  - **Chromeless Cinema Canvas**: Zero persistent chrome; persistent 1px progress line along the very top edge of the video frame.
  - **HUD Overlays & Ripple Feedback**: Interactive keyboard shortcuts cheatsheet modal (`?`), center animated play/pause indicator, and dual-zone double-tap/arrow ripple seek overlays (`-10s` on left, `+10s` on right).
  - *Adopted for mobile touch gestures and watch page ambient fullscreen view.*

---

### 2. Architectural Decision & Component Topology

To achieve production YouTube fidelity while retaining Mux's adaptive bitrate (ABR) streaming and telemetry, the application will adopt a **Hybrid Primitive Architecture**:

```
apps/web/
└── components/player/
    ├── YouTubePlayer.tsx             # Root player orchestrator
    ├── VideoEngine.tsx               # Core <mux-video> or HTML5 <video> wrapper
    ├── AmbientGlow.tsx               # Dynamic canvas frame color sampler
    ├── controls/
    │   ├── ControlScrim.tsx          # Gradient backdrop with auto-hide timeout
    │   ├── ScrubberBar.tsx           # 3-layer seek bar with buffer & progress
    │   ├── StoryboardTooltip.tsx     # WebVTT sprite parser & preview card
    │   ├── VolumeSlider.tsx          # Hover-expanding slider with mute toggle
    │   ├── SettingsPopover.tsx       # 2-level speed & HLS quality selector
    │   ├── TheaterToggle.tsx         # Watch page grid layout coordinator
    │   └── MiniplayerToggle.tsx      # Picture-in-picture / corner float toggle
    └── hooks/
        ├── useYouTubePlayer.ts       # Unified player state & playback rate engine
        ├── useKeyboardShortcuts.ts   # Space/K/J/L/M/F/T/C keybinding listeners
        └── useStoryboardSprite.ts    # WebVTT cue fetcher & #xywh coordinate calculator
```

#### Why Not Pure `@mux/mux-player-react`?
While `@mux/mux-player-react` is convenient for turn-key setups, its Shadow DOM styling boundaries make YouTube's exact nested popover drilldowns (Playback speed -> speed options list) and multi-layer scrubber interactions brittle and difficult to style using Tailwind CSS and Radix UI primitives. Using `@mux/mux-video-react` or Media Chrome React primitives allows 100% Tailwind class control and seamless Radix UI Popover integration.

---

### 3. Key Technical Contracts

#### 3.1 WebVTT Storyboard Hover Scrubbing
- **Endpoint**: `https://image.mux.com/{PLAYBACK_ID}/storyboard.vtt?format=webp`
- **Spatial Fragment Parsing**: Mux cues format sprite coordinates as `#xywh={x},{y},{w},{h}`.
- **Render Implementation**:
  ```tsx
  // StoryboardTooltip component renders sprite frame via background-position:
  <div
    style={{
      backgroundImage: `url(${spriteUrl})`,
      backgroundPosition: `-${cue.x}px -${cue.y}px`,
      width: `${cue.w}px`,
      height: `${cue.h}px`,
    }}
  />
  ```

#### 3.2 Theater Mode Layout Coordination
Theater mode cannot live in player internal state alone because it reorganizes the Watch page DOM layout:
- **Default View**: Primary player column `lg:col-span-8` (`max-w-[1280px]`), secondary recommendations column `lg:col-span-4`.
- **Theater View**: Primary player container expands to `lg:col-span-12` (100% width, full theater bar), secondary recommendation column drops below player as a horizontal/multi-column grid.
- **State Coordination**: Synchronized via `useWatchPageLayout` store or URL search param (`?theater=true`), toggled seamlessly by pressing `t` or clicking the Theater button.

#### 3.3 YouTube Web Keyboard Shortcuts Engine
All standard YouTube shortcuts are bound globally to the window, bypassed when active element is an `<input>` or `<textarea>`:
- `k` or `Space`: Play / Pause toggle
- `j` / `l`: Seek -10s / +10s (triggers animated ripple overlay)
- `ArrowLeft` / `ArrowRight`: Seek -5s / +5s
- `ArrowUp` / `ArrowDown`: Volume +/- 5%
- `m`: Mute toggle
- `f`: Fullscreen toggle
- `t`: Theater mode toggle
- `c`: Closed captions (CC) toggle
- `i`: Miniplayer toggle
- `?`: Toggle keyboard shortcuts HUD
