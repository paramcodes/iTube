# YouTube Web Design Tokens and Theme Specification

## Executive Summary & Architecture Context

This document specifies the exact production design tokens, layout dimensions, typography rules, surface hierarchies, and component styling extracted from YouTube's desktop and mobile web interface (post-2022 visual refresh and ambient mode updates).

These design tokens form the foundational visual design system for the YouTube clone monorepo (`apps/web` Next.js 15 application). They are mapped directly onto:
1. **Shadcn UI CSS Custom Properties** (`:root` and `.dark` in `globals.css`) for standard UI primitives (Dialogs, Dropdown Menus, Tooltips, Buttons, Inputs).
2. **Tailwind CSS Configuration** (`tailwind.config.ts` and Tailwind v4 `@theme` directives) for utility classes across custom YouTube shell components (Masthead, Guide Drawer, Category Pill Carousel, Video Card Grid, Watch Page Player Layout).

---

## 1. Color Palette & Surface Hierarchy

YouTube's interface relies on a dark-first design language where true black (`#000000`) is reserved almost exclusively for video playback scrims, full-screen canvas backgrounds, and overlay badges. The primary application canvas is tinted to a warm, soft dark gray (`#0f0f0f`) to prevent eye fatigue and reduce harsh OLED contrast.

### 1.1 Dark Theme Tokens (Default)

| Token Name | Hex / RGBA Value | Production Variable | Description & Usage |
| :--- | :--- | :--- | :--- |
| **Base Canvas** | `#0f0f0f` | `--yt-spec-base-background` | App background, primary scrollable area, page manager. |
| **Surface Raised** | `#212121` | `--yt-spec-raised-background` | Elevated cards, dialog modals, sheet overlays, floating menus. |
| **Surface Menu** | `#282828` | `--yt-spec-menu-background` | Context menus, dropdown menus, action popovers. |
| **Surface Elevated / Input** | `#121212` | `--yt-spec-search-background` | Masthead search input container, inner text inputs. |
| **Surface Secondary / Pill** | `#272727` | `--yt-spec-badge-chip-background` | Inactive category chips, video description box background. |
| **Additive Layer Subtle** | `rgba(255, 255, 255, 0.08)` | `--yt-spec-10-percent-layer` | Unselected chip background, search button background. |
| **Additive Layer Hover** | `rgba(255, 255, 255, 0.15)` | `--yt-spec-button-chip-background-hover` | Hover state for interactive surface buttons and chips. |
| **Additive Layer Pressed** | `rgba(255, 255, 255, 0.25)` | `--yt-spec-touch-response` | Active / pressed state feedback. |
| **Border Subtle** | `rgba(255, 255, 255, 0.1)` | `--yt-spec-outline` | Divider lines, guide drawer separator, subtle outlines. |
| **Border Medium / Input** | `rgba(255, 255, 255, 0.2)` | `--yt-spec-outline-inverse` | Search bar outline, button borders, comment box borders. |
| **Border Focus** | `rgba(255, 255, 255, 0.3)` | `--yt-spec-outline-focus` | Search input focus ring, keyboard focus outline. |
| **Static Overlay Heavy** | `rgba(0, 0, 0, 0.8)` (`#000000cc`)| `--yt-spec-static-overlay-background-heavy` | Video duration timestamp badge, player controls scrim. |
| **Static Overlay Medium**| `rgba(0, 0, 0, 0.6)` | `--yt-spec-static-overlay-background-medium` | Modal backdrop scrim, thumbnail hover overlay. |

### 1.2 Light Theme Tokens

| Token Name | Hex / RGBA Value | Production Variable | Description & Usage |
| :--- | :--- | :--- | :--- |
| **Base Canvas** | `#ffffff` | `--yt-spec-base-background` | App background, page manager. |
| **Surface Raised** | `#ffffff` | `--yt-spec-raised-background` | Dialogs, menus (with drop shadow `0 4px 32px rgba(0,0,0,0.1)`). |
| **Surface Secondary** | `#f2f2f2` (`#f1f1f1`) | `--yt-spec-badge-chip-background` | Inactive chips, description box, voice button. |
| **Surface Hover** | `#e5e5e5` | `--yt-spec-button-chip-background-hover` | Inactive chip hover state, icon button hover state. |
| **Surface Active** | `#0f0f0f` | `--yt-spec-inverted-background` | Active filter chip, inverted high-contrast actions. |
| **Additive Layer Subtle** | `rgba(0, 0, 0, 0.05)` | `--yt-spec-additive-background` | Light surface tint. |
| **Border Subtle** | `rgba(0, 0, 0, 0.1)` | `--yt-spec-outline` | Dividers, section borders, guide lines. |
| **Border Medium** | `rgba(0, 0, 0, 0.2)` | `--yt-spec-outline-inverse` | Search input border, button outlines. |

### 1.3 Text Color Hierarchy

| Hierarchy Level | Dark Theme Value | Light Theme Value | Production Variable | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Text** | `#f1f1f1` (`#ffffff`) | `#0f0f0f` (`#030303`) | `--yt-spec-text-primary` | Video titles, channel headers, modal titles, input text. |
| **Secondary Text** | `#aaaaaa` | `#606060` | `--yt-spec-text-secondary` | Channel name in video card, view counts, upload dates. |
| **Tertiary / Disabled**| `#717171` | `#909090` | `--yt-spec-text-disabled` | Inactive icons, disabled buttons, placeholder text. |
| **Inverse Primary** | `#0f0f0f` | `#ffffff` | `--yt-spec-text-primary-inverse`| Text on active chips, text on tooltips. |

### 1.4 Accent & Brand Colors

| Accent Name | Hex Value | RGB / HSL | Usage |
| :--- | :--- | :--- | :--- |
| **YouTube Brand Red** | `#ff0000` (`#ff0302`)| `rgb(255, 0, 0)` | YouTube Logo play button, subscribe button hover, live badge. |
| **Brand Red Hover** | `#cc0000` | `rgb(204, 0, 0)` | Subscribe button active/hover, scrub bar fill. |
| **Call to Action Blue** | `#3ea6ff` | `rgb(62, 166, 255)` (Dark)<br>`#065fd4` (Light) | Links, hashtags, like active state, subscribe toggle link. |
| **Success / Verified Green** | `#2ba640` | `rgb(43, 166, 64)` | Commerce badges, membership icons, upload success indicator. |
| **Warning / Ad Yellow** | `#fbc02d` | `rgb(251, 192, 45)` | Ad indicators, warning notices. |

---

## 2. Typography & Font System

YouTube uses a hybrid typography system:
- **YouTube Sans**: Google's bespoke display typeface, applied to large headlines, video titles on watch pages, section titles, channel subscriber counts, and branding wordmarks.
- **Roboto**: Google's ubiquitous UI typeface, applied to body copy, video card titles, channel metadata, comments, button labels, and system toolbars.
- **Fallback Stack**: `Roboto, "Segoe UI", Arial, sans-serif`.

### 2.1 Font Scale & Hierarchy Table

| UI Element | Font Family | Size (`rem` / `px`) | Line Height | Weight | Tracking / Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Watch Main Title** | YouTube Sans / Roboto | `1.25rem` (20px) | `1.75rem` (28px) | 700 / Bold | `0` |
| **Section Header** | YouTube Sans / Roboto | `1.25rem` (20px) | `1.625rem` (26px) | 600 / SemiBold | `-0.01em` |
| **Feed Video Title** | Roboto | `1.0rem` (16px) | `1.375rem` (22px) | 500 / Medium | `normal` |
| **Related Video Title**| Roboto | `0.875rem` (14px) | `1.25rem` (20px) | 500 / Medium | `normal` |
| **Channel Name** | Roboto | `0.875rem` (14px) | `1.25rem` (20px) | 400 / Regular | `0.01em` |
| **Feed Video Metadata**| Roboto | `0.75rem` (12px) | `1.125rem` (18px) | 400 / Regular | `0` |
| **Duration Badge** | Roboto | `0.75rem` (12px) | `0.875rem` (14px) | 500 / Medium | `0.03em` |
| **Filter Chip Label** | Roboto | `0.875rem` (14px) | `1.25rem` (20px) | 500 / Medium | `0` |
| **Guide Drawer Label**| Roboto | `0.875rem` (14px) | `1.25rem` (20px) | 400 / 500 (active) | `0` |
| **Mini Guide Label** | Roboto | `0.625rem` (10px) | `0.875rem` (14px) | 400 / Regular | `0` |
| **Comment Body** | Roboto | `0.875rem` (14px) | `1.25rem` (20px) | 400 / Regular | `0` |
| **Button Label (Medium)**| Roboto | `0.875rem` (14px) | `1.25rem` (20px) | 500 / Medium | `0.01em` |

### 2.2 Title Truncation Rule
- **Rich Grid Video Card Titles**: Must be clamped to strictly **2 lines** using `-webkit-line-clamp: 2`, `display: -webkit-box`, `-webkit-box-orient: vertical`, `overflow: hidden`.
- **Related / Secondary Watch Video Titles**: Clamped to **2 lines** (formerly 1 or 2 lines depending on viewport width).

---

## 3. Layout Metrics & Dimensions

The YouTube web layout is governed by strict CSS dimension constants that adapt across device viewports.

### 3.1 Masthead (Header)
- **Height**: `56px` (`h-14` / `--ytd-toolbar-height`).
- **Position**: `sticky top-0 z-50`.
- **Padding**: `0 16px` (`px-4`).
- **Search Box Container**:
  - Max Width: `640px` (desktop), scales dynamically down to `360px` or full screen toggle on mobile.
  - Height: `40px` (`h-10`).
  - Search Input: Border radius `40px 0 0 40px` (`rounded-l-full`), border `1px solid rgba(255, 255, 255, 0.2)` (dark) / `rgba(0, 0, 0, 0.15)` (light), background `#121212` (dark) / `#ffffff` (light), padding `0 16px`.
  - Search Button: Width `64px` (`w-16`), height `40px` (`h-10`), border radius `0 40px 40px 0` (`rounded-r-full`), border `1px solid rgba(255, 255, 255, 0.2)`, border-left `none`, background `rgba(255, 255, 255, 0.08)` (dark) / `#f8f8f8` (light).
  - Voice Search Button: `40px × 40px` circle (`rounded-full`), margin-left `12px` (`ml-3`), background `rgba(255, 255, 255, 0.1)` (dark) / `#f2f2f2` (light).

### 3.2 Navigation Guide Drawer (Sidebar)
- **Expanded Width**: `240px` (`w-60` / `--ytd-guide-width: 240px`).
  - Visible on viewports $\ge 1313\text{px}$ on feed pages.
  - Entry Item Height: `40px` (`h-10`), padding `0 12px`, border-radius `10px` (`rounded-lg`).
  - Icon Size: `24px × 24px` (`w-6 h-6`).
- **Mini Guide (Collapsed) Width**: `72px` (`w-[72px]` / `--ytd-mini-guide-width: 72px`).
  - Visible on viewports between $792\text{px}$ and $1312\text{px}$.
  - Entry Item Height: `74px` (`h-[74px]`), padding `16px 0 14px 0`, flex column, icon `24px`, label `10px` centered.
- **Mobile Drawer**:
  - Hidden overlay drawer rendered off-canvas (`transform: translateX(-100%)`).
  - Overlaid with modal scrim (`rgba(0, 0, 0, 0.5)`), z-index `2020`.
- **Top Margin**: `56px` (`mt-14` / below masthead).

### 3.3 Home Feed Video Grid (Rich Grid)
- **Thumbnail Aspect Ratio**: `16:9` (`56.25%` aspect ratio / `aspect-video`).
- **Thumbnail Border Radius**: `12px` (`rounded-xl`).
- **Gutter Margins**:
  - Horizontal column gap: `16px` (`gap-x-4`).
  - Vertical row gap: `40px` (`gap-y-10` / `--ytd-rich-grid-row-margin: 40px`).
  - Grid outer container margin: `16px 24px` (`px-6 py-4`).
- **Item Width Limits**:
  - Minimum card width: `310px` (`--ytd-rich-grid-item-min-width: 310px`).
  - Maximum card width: `500px` (`--ytd-rich-grid-item-max-width: 500px`).
- **Responsive Columns Breakpoints**:
  - **1 Column**: Viewport $< 510\text{px}$
  - **2 Columns**: Viewport $510\text{px} - 874\text{px}$
  - **3 Columns**: Viewport $875\text{px} - 1143\text{px}$
  - **4 Columns**: Viewport $1144\text{px} - 1600\text{px}$
  - **5 Columns**: Viewport $1601\text{px} - 1920\text{px}$
  - **6 Columns**: Viewport $> 1920\text{px}$

### 3.4 Watch Page Layout (`ytd-watch-flexy`)
The watch page uses a flexible split layout:
- **Default 2-Column Mode**:
  - Outer Container: Max width `1754px`, centered (`mx-auto px-6 pt-6`).
  - **Primary Column** (`#primary`):
    - Contains: HTML5 video player, video metadata, channel bar, description box, comment section.
    - Width: Flexible (`flex-1 min-w-0`), max-width `1280px`.
  - **Secondary Column** (`#secondary`):
    - Contains: Related video recommendation list, optional live chat / engagement panel.
    - Fixed Width: `402px` (`w-[402px]` / `--ytd-watch-flexy-sidebar-width: 402px; min-width: 300px; max-width: 402px;`).
    - Margin Left: `24px` (`ml-6`).
  - **Single Column Breakpoint**: Below $1000\text{px}$ viewport width, the layout collapses into a single vertical column (`flex-col`); the secondary recommendation column moves below comments.
- **Theater Mode (`[theater]`)**:
  - Player container spans **100% viewport width** (`w-full`), background `#000000`.
  - Player Height: `min(calc(100vh - 169px), calc(100vw * 9 / 16))` (clamped to ensure metadata is visible above the fold on desktop monitors).
  - Primary column (metadata and comments) and Secondary column (recommendations) remain side-by-side underneath the full-bleed player.

---

## 4. Component Tokens & Specifications

### 4.1 Category Pill Filter Chips (`yt-chip-cloud-chip-renderer`)
- **Container**:
  - Sticky below masthead (`top-14 z-40`).
  - Height: `56px` (`h-14`).
  - Background: `#0f0f0f` (dark) / `#ffffff` (light), optional subtle gradient mask on horizontal overflow arrows.
  - Gap: `12px` (`gap-3`).
- **Chip Shape**:
  - Height: `32px` (`h-8`).
  - Padding: `0 12px` (`px-3`).
  - Border Radius: `8px` (`rounded-lg` in modern YouTube, formerly `rounded-full`).
  - Typography: `14px` (`text-sm`), font-weight `500` (`font-medium`).
  - Transition: `background-color 0.2s cubic-bezier(0.05, 0, 0, 1), color 0.2s cubic-bezier(0.05, 0, 0, 1)`.
- **States**:
  - **Dark Inactive**: Background `rgba(255, 255, 255, 0.08)` (or `#272727`), Text `#f1f1f1`.
  - **Dark Inactive Hover**: Background `rgba(255, 255, 255, 0.2)` (or `#3f3f3f`).
  - **Dark Selected / Active**: Background `#f1f1f1`, Text `#0f0f0f`, Hover background `#ffffff`.
  - **Light Inactive**: Background `rgba(0, 0, 0, 0.05)` (or `#f2f2f2`), Text `#0f0f0f`, Hover background `#e5e5e5`.
  - **Light Selected / Active**: Background `#0f0f0f`, Text `#ffffff`.

### 4.2 Video Card Component (`ytd-rich-item-renderer`)
- **Thumbnail Wrapper**:
  - Relative container with aspect ratio `16:9` (`aspect-video`).
  - Border Radius: `12px` (`rounded-xl`).
  - Overflow: `hidden`.
  - Background: `#272727` placeholder skeleton color.
- **Duration Badge (`yt-thumbnail-overlay-time-status-renderer`)**:
  - Position: `absolute bottom-2 right-2` (`bottom: 8px; right: 8px;`).
  - Background: `rgba(0, 0, 0, 0.8)` (`#000000cc`).
  - Text Color: `#ffffff`.
  - Font Size: `12px` (`0.75rem` / `text-xs`).
  - Font Weight: `500` (`font-medium`).
  - Padding: `1px 4px` (`px-1 py-0.5`).
  - Border Radius: `4px` (`rounded-sm`).
  - Letter Spacing: `0.03em`.
- **Details Area (`#details`)**:
  - Display: `flex`, gap `12px` (`gap-3`), padding-top `12px` (`pt-3`).
- **Channel Avatar**:
  - Dimensions: `36px × 36px` circular (`w-9 h-9 rounded-full`).
  - Flex Shrink: `0`.
  - Background: `#272727`.
- **Video Title**:
  - Font Size: `16px` (`text-base`).
  - Line Height: `22px` (`leading-[22px]`).
  - Font Weight: `500` (`font-medium`).
  - Color: `#f1f1f1` (dark) / `#0f0f0f` (light).
  - Clamp: Strict `line-clamp-2`.
  - Margin Bottom: `4px` (`mb-1`).
- **Channel Name Row**:
  - Font Size: `14px` (`text-sm`).
  - Line Height: `20px` (`leading-5`).
  - Color: `#aaaaaa` (dark) / `#606060` (light).
  - Hover Color: `#f1f1f1` (dark) / `#0f0f0f` (light).
  - Verified Checkmark Badge: `14px × 14px` SVG icon, color `#aaaaaa`, margin-left `4px`.
- **Metadata Row (Views & Time)**:
  - Font Size: `12px` (`text-xs`).
  - Line Height: `18px` (`leading-[18px]`).
  - Color: `#aaaaaa` (dark) / `#606060` (light).
  - Separator: Bullet dot `•` (`mx-1`).
- **Card Context Menu (3-dots)**:
  - Button Size: `36px × 36px` (`w-9 h-9 rounded-full`).
  - Visibility: Opacity 0 default, opacity 100 on card hover (`opacity-0 group-hover:opacity-100`).

### 4.3 Compact / Secondary Video Card (`yt-lockup-view-model--horizontal`)
- **Thumbnail**:
  - Width: `168px` fixed (`w-[168px]`).
  - Height: `94px` (16:9 ratio).
  - Border Radius: `8px` (`rounded-lg`).
- **Details**:
  - Gap: `8px` (`gap-2`).
  - Title: `14px` (`text-sm`), `line-clamp-2`, font-weight `500`, line-height `20px`.
  - Channel & Views: `12px` (`text-xs`), line-height `18px`, color `#aaaaaa`.

### 4.4 Button Shape System (`yt-spec-button-shape-next`)
- **Tonal (Secondary Action, Like/Dislike, Share)**:
  - Height: `36px` (`h-9`), padding `0 16px`, border-radius `18px` (`rounded-full`).
  - Background (Dark): `rgba(255, 255, 255, 0.1)`, hover `rgba(255, 255, 255, 0.2)`.
  - Text: `14px`, font-weight `500`, color `#f1f1f1`.
- **Mono / Inverted (Subscribe Unsubscribed)**:
  - Height: `36px` (`h-9`), padding `0 16px`, border-radius `18px` (`rounded-full`).
  - Background (Dark): `#f1f1f1`, text `#0f0f0f`, hover `#ffffff`.
  - Background (Light): `#0f0f0f`, text `#ffffff`.
- **Subscribed (Tonal Toggle)**:
  - Background (Dark): `rgba(255, 255, 255, 0.1)`, text `#f1f1f1`.

---

## 5. Shadcn UI CSS Custom Properties (`globals.css`)

The following CSS definitions map YouTube's verified tokens directly to Shadcn UI's standard design tokens for light and dark modes, plus custom `--yt-*` variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Base canvas and text */
    --background: 0 0% 100%;             /* #ffffff */
    --foreground: 0 0% 5.9%;             /* #0f0f0f */

    /* Cards and surfaces */
    --card: 0 0% 100%;                   /* #ffffff */
    --card-foreground: 0 0% 5.9%;        /* #0f0f0f */

    /* Popovers, menus, and dropdowns */
    --popover: 0 0% 100%;                /* #ffffff */
    --popover-foreground: 0 0% 5.9%;     /* #0f0f0f */

    /* Primary actions (YouTube red / black callout) */
    --primary: 0 100% 50%;               /* #ff0000 */
    --primary-foreground: 0 0% 100%;     /* #ffffff */

    /* Secondary surface (chips, secondary buttons) */
    --secondary: 0 0% 94.5%;             /* #f1f1f1 */
    --secondary-foreground: 0 0% 5.9%;   /* #0f0f0f */

    /* Muted text and backgrounds */
    --muted: 0 0% 96.1%;                 /* #f5f5f5 */
    --muted-foreground: 0 0% 37.6%;      /* #606060 */

    /* Accent & interactive blue */
    --accent: 215 95% 43%;               /* #065fd4 */
    --accent-foreground: 0 0% 100%;      /* #ffffff */

    /* Destructive alert */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    /* Borders and outlines */
    --border: 0 0% 89.8%;                /* rgba(0,0,0,0.1) / #e5e5e5 */
    --input: 0 0% 89.8%;
    --ring: 215 95% 43%;                 /* #065fd4 */
    --radius: 0.5rem;                    /* 8px */

    /* YouTube Custom Namespace (Light Mode) */
    --yt-base-bg: #ffffff;
    --yt-surface-raised: #ffffff;
    --yt-surface-menu: #ffffff;
    --yt-surface-input: #ffffff;
    --yt-surface-secondary: #f2f2f2;
    --yt-surface-hover: #e5e5e5;
    --yt-text-primary: #0f0f0f;
    --yt-text-secondary: #606060;
    --yt-text-disabled: #909090;
    --yt-brand-red: #ff0000;
    --yt-call-to-action: #065fd4;
    --yt-border-subtle: rgba(0, 0, 0, 0.1);
    --yt-border-medium: rgba(0, 0, 0, 0.2);
    --yt-badge-bg: rgba(0, 0, 0, 0.05);

    /* Dimensions */
    --yt-masthead-height: 56px;
    --yt-guide-width: 240px;
    --yt-mini-guide-width: 72px;
    --yt-watch-sidebar-width: 402px;
  }

  .dark {
    /* Base canvas and text */
    --background: 0 0% 5.9%;             /* #0f0f0f */
    --foreground: 0 0% 94.5%;            /* #f1f1f1 */

    /* Cards and surfaces */
    --card: 0 0% 5.9%;                   /* #0f0f0f (flat cards) */
    --card-foreground: 0 0% 94.5%;       /* #f1f1f1 */

    /* Popovers, menus, and elevated dialogs */
    --popover: 0 0% 12.9%;               /* #212121 */
    --popover-foreground: 0 0% 94.5%;    /* #f1f1f1 */

    /* Primary actions (YouTube red) */
    --primary: 0 100% 50%;               /* #ff0000 */
    --primary-foreground: 0 0% 100%;     /* #ffffff */

    /* Secondary surface (chips, tonal buttons) */
    --secondary: 0 0% 15.3%;             /* #272727 */
    --secondary-foreground: 0 0% 94.5%;  /* #f1f1f1 */

    /* Muted text and backgrounds */
    --muted: 0 0% 15.3%;                 /* #272727 */
    --muted-foreground: 0 0% 66.7%;      /* #aaaaaa */

    /* Accent & interactive blue */
    --accent: 208 100% 62%;              /* #3ea6ff */
    --accent-foreground: 0 0% 100%;      /* #ffffff */

    /* Destructive alert */
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;

    /* Borders and outlines */
    --border: 0 0% 100% / 0.1;           /* rgba(255,255,255,0.1) */
    --input: 0 0% 100% / 0.2;            /* rgba(255,255,255,0.2) */
    --ring: 208 100% 62%;                /* #3ea6ff */

    /* YouTube Custom Namespace (Dark Mode) */
    --yt-base-bg: #0f0f0f;
    --yt-surface-raised: #212121;
    --yt-surface-menu: #282828;
    --yt-surface-input: #121212;
    --yt-surface-secondary: #272727;
    --yt-surface-hover: rgba(255, 255, 255, 0.15);
    --yt-text-primary: #f1f1f1;
    --yt-text-secondary: #aaaaaa;
    --yt-text-disabled: #717171;
    --yt-brand-red: #ff0000;
    --yt-call-to-action: #3ea6ff;
    --yt-border-subtle: rgba(255, 255, 255, 0.1);
    --yt-border-medium: rgba(255, 255, 255, 0.2);
    --yt-badge-bg: rgba(255, 255, 255, 0.08);
  }
}
```

---

## 6. Complete Tailwind CSS Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1754px",
      },
    },
    extend: {
      colors: {
        /* Shadcn Core Tokens */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* YouTube Bespoke Design System Tokens */
        yt: {
          /* Canvas & Surfaces */
          base: "var(--yt-base-bg, #0f0f0f)",
          "surface-raised": "var(--yt-surface-raised, #212121)",
          "surface-menu": "var(--yt-surface-menu, #282828)",
          "surface-input": "var(--yt-surface-input, #121212)",
          "surface-secondary": "var(--yt-surface-secondary, #272727)",
          "surface-hover": "var(--yt-surface-hover, rgba(255, 255, 255, 0.15))",

          /* Typography Tokens */
          "text-primary": "var(--yt-text-primary, #f1f1f1)",
          "text-secondary": "var(--yt-text-secondary, #aaaaaa)",
          "text-disabled": "var(--yt-text-disabled, #717171)",

          /* Brand & Callouts */
          red: "var(--yt-brand-red, #ff0000)",
          "red-hover": "#cc0000",
          blue: "var(--yt-call-to-action, #3ea6ff)",

          /* Borders & Dividers */
          "border-subtle": "var(--yt-border-subtle, rgba(255, 255, 255, 0.1))",
          "border-medium": "var(--yt-border-medium, rgba(255, 255, 255, 0.2))",

          /* Overlays & Badges */
          badge: "var(--yt-badge-bg, rgba(255, 255, 255, 0.08))",
          "overlay-badge": "rgba(0, 0, 0, 0.8)",
          scrim: "rgba(0, 0, 0, 0.6)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "40px",
        yt: "12px",
      },
      fontFamily: {
        sans: ["Roboto", "Segoe UI", "Arial", "sans-serif"],
        yt: ["YouTube Sans", "Roboto", "sans-serif"],
      },
      fontSize: {
        "yt-badge": ["0.75rem", { lineHeight: "0.875rem", letterSpacing: "0.03em" }],
        "yt-meta": ["0.75rem", { lineHeight: "1.125rem", letterSpacing: "0" }],
        "yt-sub": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0" }],
        "yt-title": ["1.0rem", { lineHeight: "1.375rem", letterSpacing: "normal" }],
        "yt-watch-title": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "0" }],
      },
      spacing: {
        /* Shell dimension constants */
        "yt-masthead": "var(--yt-masthead-height, 56px)",
        "yt-guide": "var(--yt-guide-width, 240px)",
        "yt-mini-guide": "var(--yt-mini-guide-width, 72px)",
        "yt-sidebar": "var(--yt-watch-sidebar-width, 402px)",
      },
      width: {
        "yt-guide": "var(--yt-guide-width, 240px)",
        "yt-mini-guide": "var(--yt-mini-guide-width, 72px)",
        "yt-sidebar": "var(--yt-watch-sidebar-width, 402px)",
        "yt-sidebar-thumb": "168px",
      },
      height: {
        "yt-masthead": "var(--yt-masthead-height, 56px)",
        "yt-chip": "32px",
      },
      aspectRatio: {
        video: "16 / 9",
      },
      boxShadow: {
        "yt-menu": "0 4px 32px 0 rgba(0, 0, 0, 0.28)",
        "yt-search-focus": "inset 0 1px 2px rgba(0, 0, 0, 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
```

---

## 7. Tailwind v4 `@theme` Directives (Future Compatibility)

If using modern Tailwind CSS v4, tokens can alternatively be specified directly via CSS custom properties and the `@theme` block:

```css
@import "tailwindcss";

@theme {
  --color-yt-base: #0f0f0f;
  --color-yt-surface-raised: #212121;
  --color-yt-surface-menu: #282828;
  --color-yt-surface-input: #121212;
  --color-yt-surface-secondary: #272727;
  --color-yt-text-primary: #f1f1f1;
  --color-yt-text-secondary: #aaaaaa;
  --color-yt-text-disabled: #717171;
  --color-yt-brand-red: #ff0000;
  --color-yt-call-to-action: #3ea6ff;

  --font-sans: Roboto, "Segoe UI", Arial, sans-serif;
  --font-yt: "YouTube Sans", Roboto, sans-serif;

  --spacing-yt-masthead: 56px;
  --spacing-yt-guide: 240px;
  --spacing-yt-mini-guide: 72px;
  --spacing-yt-sidebar: 402px;
}
```

---

## 8. Implementation Verification & Migration Checklist

For ticket `07-prototype-youtube-shell-and-layout.md` and subsequent UI features:

1. **Font Loading**:
   - In `apps/web/app/layout.tsx`, import `Roboto` using `next/font/google`:
     ```typescript
     import { Roboto } from "next/font/google";
     const roboto = Roboto({
       weight: ["400", "500", "700"],
       subsets: ["latin"],
       display: "swap",
       variable: "--font-roboto",
     });
     ```
   - Provide fallback sans-serif stack for `YouTube Sans`.
2. **Dark Mode Integration**:
   - Wrap root layout in `next-themes` `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>`.
   - YouTube clone defaults to dark theme (`class="dark"` on `<html>`).
3. **Layout Components Sizing Contract**:
   - Masthead fixed header: `h-[56px]` / `h-yt-masthead`.
   - Guide drawer: `w-[240px]` when open, `w-[72px]` when collapsed mini-guide.
   - Watch page sidebar: `w-[402px]` fixed secondary container.
   - Video thumbnail card: `aspect-video rounded-xl overflow-hidden`.
   - Title clamp: `line-clamp-2`.
4. **All tokens verified against YouTube production web client (Desktop & Mobile Web 2026).**
