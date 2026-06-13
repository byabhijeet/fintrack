---
name: BillZest FinTrack
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bbcbb8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#859583'
  outline-variant: '#3c4a3c'
  surface-tint: '#34e36a'
  primary: '#4cf479'
  on-primary: '#003913'
  primary-container: '#1ed760'
  on-primary-container: '#005721'
  inverse-primary: '#006e2c'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#d9d6d6'
  on-tertiary: '#313030'
  tertiary-container: '#bdbbba'
  on-tertiary-container: '#4c4b4b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#69ff89'
  primary-fixed-dim: '#34e36a'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#00531f'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The brand personality is sleek, tactile, and data-forward, mimicking the immersive experience of a premium media player. The goal is to move finance away from "accounting" and toward "discovery." The aesthetic is a fusion of **Corporate Modern** structure with **Vaporwave-adjacent** neon accents, resulting in a "Spotify for Finance" atmosphere. 

The UI prioritizes high-energy visuals, where data "glows" against deep surfaces. It should feel fast, responsive, and content-centric, treating financial transactions with the same visual importance as album art in a playlist. The target audience is the digitally-native generation who values aesthetic coherence and instant data visualization.

## Colors
The palette is dominated by a true dark mode experience. The primary interaction color is **Neon Green (#1ED760)**, used sparingly but high-impactfully for calls to action, positive financial trends, and active states. 

- **Primary:** Neon Green is the functional "accent." Use it for focus states and "growth" indicators.
- **Base Layers:** The background uses a deep charcoal (#121212) to minimize eye strain and maximize the pop of foreground elements.
- **Surface Layers:** Use #181818 for card backgrounds and #282828 for hover states or tertiary depth.
- **Contrast:** In light mode inversion, the background becomes #FFFFFF with #F6F6F6 surfaces, while the Brand Primary remains #1ED760 and text shifts to deep blacks for high-impact legibility.

## Typography
The system utilizes **Inter** exclusively to achieve a systematic, neutral, yet bold look. The hierarchy is built on extreme weight contrast.

- **Numbers & Display:** Financial totals must use `display-lg` (32px Bold) to act as the visual anchor of the screen.
- **Labels:** Buttons and category headers use `label-caps`—heavy weight, small size, and wide tracking—to create a "navigation" feel common in media apps.
- **Body:** Standard content uses Regular 400 for maximum readability against dark backgrounds. Avoid medium weights; stick to the binary of Bold (700) and Regular (400) to maintain the "aggressive" geometric aesthetic.

## Layout & Spacing
The layout follows a **fluid grid** model with a focus on vertical density. On mobile, a 4-column grid is used, while desktop expands to a 12-column layout.

- **Rhythm:** An 8px linear scale governs all spacing.
- **Transaction Lists:** Use a "dense" 56px or 64px row height for transaction items to enable high scannability, mimicking a music playlist.
- **Safe Zones:** Maintain a consistent 16px margin on mobile devices to prevent content from touching the screen edges.
- **Vertical Grouping:** Use larger gaps (32px) between logical sections (e.g., between the Chart and the Transaction List) and smaller gaps (8px) within section items.

## Elevation & Depth
Depth is achieved through **Tonal Layers** rather than traditional shadows. In a dark, immersive UI, physical shadows are often invisible; therefore, brightness defines height.

- **Level 0 (Base):** #121212 - The canvas.
- **Level 1 (Surface):** #181818 - Card containers and navigation bars.
- **Level 2 (Elevated):** #282828 - Dialogs, pop-overs, or cards during a press state.
- **Interactive Glow:** For primary elements like the Floating Action Button or active charts, apply a subtle `0px 4px 20px rgba(30, 215, 96, 0.3)` outer glow to simulate a light-emitting "data-glowing" effect.

## Shapes
The shape language is strictly geometric and binary. 

- **Perfect Circles (50%):** Used for all avatars, category icons, and circular utility buttons (FABs). This creates a recurring "disc" motif throughout the app.
- **Pills (9999px):** Used for all interactive buttons, search inputs, and status tags. The pill shape communicates a modern, friendly, yet high-performance feel.
- **Cards:** While buttons are pills, container cards should use a slightly more structured `rounded-lg` (1rem) to maintain layout efficiency and avoid excessive dead space in corners.

## Components
- **Buttons:** All buttons are pill-shaped. Primary buttons feature a solid #1ED760 background with black text. Labels must be uppercase with wide tracking (`label-caps`).
- **Transaction Rows:** Styled as "playlist items." A circular icon on the left (50% radius), a primary label (Bold), and a secondary description (Muted) stacked vertically, with the amount aligned to the right. 
- **Input Fields:** Search and data entry bars are pill-shaped with #282828 backgrounds and no borders.
- **Progress Bars & Charts:** Use the Brand Primary green for active data. Lines in line charts should have a slight neon "neon" stroke effect.
- **Chips/Tags:** Small pill-shaped containers with #282828 background and white text for categorizing expenses.
- **FAB (Floating Action Button):** A perfect circle containing a single icon, floating at the bottom right, utilizing the primary green glow.