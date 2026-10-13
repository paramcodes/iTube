# Prototype YouTube Shell, Guide Drawer, and Video Grid Layout

Type: prototype
Status: resolved
Blocked by: 01

## Question

How does the YouTube shell behave across masthead search bar, responsive collapsible guide drawer (expanded 240px, mini 72px, hidden overlay on mobile), category chip filter carousel, and responsive video card grid with channel avatars and badges?

## Answer

Interactive UI prototype built and verified at `.scratch/youtube-clone/prototypes/shell-layout-prototype.html`:

### 1. Prototype Structure & Evaluated Variants
Three structurally distinct variants were built and evaluated with a floating switcher pill:
- **Variant A (Classic YouTube Production Shell - Winner for Primary Experience)**:
  - 56px sticky masthead with centered pill search bar, mic button, create/upload shortcut, notifications, and profile avatar.
  - Dynamic collapsible guide drawer: expanded 240px multi-section navigation (`Home`, `Subscriptions`, `Shorts`, `History`, `Playlists`) that toggles seamlessly to 72px mini-guide via hamburger button.
  - Sticky horizontal category pill carousel (`#272727` inactive, `#f1f1f1` active).
  - Responsive 4-column video card grid with 16:9 aspect thumbnails, `#000000cc` timestamp badges, 36px channel avatars, 2-line title clamping, and metadata rows.
- **Variant B (Compact Studio Feed)**:
  - Fixed 72px mini-guide with a 2-column horizontal card layout displaying inline performance metrics (view counts, like ratios, average watch times).
  - *Adopted for Creator Studio video management and playlist queues.*
- **Variant C (Ambient Cinema Shell)**:
  - Minimalist zero-drawer layout with 3-column wide cards and ambient glow hover effects.
  - *Informs the ambient mode on the Watch page.*

### 2. Verified Shell Dimensions & Layout Contracts
- Masthead: `h-14` (56px), `bg-[#0f0f0f]/95 backdrop-blur-md`, `border-b border-white/10`.
- Guide Drawer: `w-60` (240px expanded) vs `w-18` (72px collapsed).
- Video Cards: `aspect-video rounded-xl`, `hover:scale-105` transition, `text-sm font-semibold` titles.

