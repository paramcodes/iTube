# Extract YouTube Web Design Tokens and Theme Specification

Type: research
Status: resolved
Blocked by:

## Question

What are the exact CSS custom properties, color palette (dark mode `#0f0f0f` base vs `#212121` popouts, light mode `#ffffff`, surface hierarchy, borders, text color variants), typography (Roboto and YouTube Sans font scales, line heights, and weights), layout dimensions (56px masthead, 240px expanded guide drawer vs 72px mini guide, video card grid breakpoints, watch page theater vs default grid), and icon styling used in YouTube's production web interface, and how should they be structured as Tailwind CSS theme extensions and Shadcn UI CSS variables?

## Answer

Production design tokens extracted and mapped to Tailwind CSS and Shadcn UI CSS custom properties in `.scratch/youtube-clone/research/youtube-design-tokens.md`.

Key specifications:
- **Dark Theme Base**: `#0f0f0f` (`--yt-spec-base-background`), elevated surfaces `#212121` (dialogs/sheets), `#282828` (menus), `#121212` (search bar/inputs), `#272727` (inactive pill chips).
- **Light Theme Base**: `#ffffff` (`--yt-spec-base-background`), inactive chips `#f2f2f2` (`#f1f1f1`), hover `#e5e5e5`.
- **Accent & Text**: Brand red `#ff0000`, active blue `#3ea6ff`, primary text `#f1f1f1` (dark) / `#0f0f0f` (light), secondary text `#aaaaaa` (dark) / `#606060` (light).
- **Layout Metrics**: Masthead height `56px`, guide drawer expanded `240px`, guide drawer mini `72px`, video thumbnail aspect ratio `16:9`, watch page default 2-column (player + `402px` secondary recommendation column) and theater mode full-width player.
- **Component Tokens**: Pill filter chips (pill shape, surface/hover/active states), video cards (rounded-xl thumbnail, 36px circular avatar, line-clamp-2 title, #000000cc duration badge).
Full Tailwind v4 / v3 theme config and Shadcn `globals.css` variable map documented in `.scratch/youtube-clone/research/youtube-design-tokens.md`.
