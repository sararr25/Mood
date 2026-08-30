---
name: MOOD Design System
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5cc'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ec'
  surface-container: '#ffe9e1'
  surface-container-high: '#fce3da'
  surface-container-highest: '#f6ddd4'
  on-surface: '#251913'
  on-surface-variant: '#594238'
  inverse-surface: '#3c2d27'
  inverse-on-surface: '#ffede7'
  outline: '#8c7166'
  outline-variant: '#e0c0b2'
  surface-tint: '#a23f00'
  primary: '#9e3d00'
  on-primary: '#ffffff'
  primary-container: '#c64f00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb595'
  secondary: '#0040e0'
  on-secondary: '#ffffff'
  secondary-container: '#2e5bff'
  on-secondary-container: '#efefff'
  tertiary: '#4d6328'
  on-tertiary: '#ffffff'
  tertiary-container: '#657c3e'
  on-tertiary-container: '#faffe8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb595'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7c2e00'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c3ff'
  on-secondary-fixed: '#001356'
  on-secondary-fixed-variant: '#0035be'
  tertiary-fixed: '#d2eca2'
  tertiary-fixed-dim: '#b6d088'
  on-tertiary-fixed: '#131f00'
  on-tertiary-fixed-variant: '#394d14'
  background: '#fff8f6'
  on-background: '#251913'
  surface-variant: '#f6ddd4'
typography:
  display-xl:
    fontFamily: Bricolage Grotesque
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is built for a creative workspace that feels more like an physical studio than a digital tool. The brand personality is **bold, warm, and expressive**, balancing the structured needs of a professional SaaS platform with the tactile, "messy" joy of the creative process.

The aesthetic is a blend of **Contemporary Digital Studio** and **New Editorial**. It prioritizes high-impact typography and a rich, grounded color palette over sterile minimalism. Key visual drivers include:
- **Tactile Materiality:** Using subtle paper grain textures and "stuck-on" elements (tape, pins) to simulate a physical moodboard.
- **Human Touch:** Incorporating hand-drawn annotations, organic underlines, and a "sketched" quality to instructional icons.
- **Eclectic Balance:** Mixing heavy, rounded brand elements with sharp, sophisticated editorial serif titles and functional utilitarian UI.

## Colors
The palette is grounded in a warm, cream-based "Paper" neutral, avoiding the clinical feel of pure white or cool grays. 

- **Primary (Terracotta):** Used for primary actions, progress indicators, and core brand moments.
- **Secondary (Cobalt):** Provides a high-energy contrast for secondary CTAs, links, and "AI" or "Digital Assistant" features.
- **Tertiary (Olive & Forest):** These deep greens provide a grounding, sophisticated weight to sidebars, footers, and secondary metadata.
- **Accent (Blush):** Softening the interface, used for highlights, tags, and celebratory UI feedback.
- **Surface (Cream):** The foundational layer. All containers should use a subtle variations of this cream to create depth without losing the warm atmosphere.

## Typography
This design system employs a three-tier typographic hierarchy to differentiate between brand presence, content narrative, and functional utility.

1.  **Brand Display (Bricolage Grotesque):** Reserved for large-scale headers and brand-led moments. Its heavy weight and rounded geometry mimic the MOOD logo.
2.  **Editorial Titles (EB Garamond):** Used for project titles and sectional headers. This brings an authoritative, sophisticated, and "high-design" feel to the content.
3.  **Interface Utility (Manrope):** A clean, modern sans-serif used for all body text, inputs, labels, and navigation. It ensures maximum readability against the more expressive display fonts.

*Styling Note:* Use "ink-trap" styles or high-contrast settings for the serif titles where possible to emphasize the editorial look.

## Layout & Spacing
The layout follows a **fluid-to-fixed model**. Content is contained within a 1440px max-width container but uses generous outer margins to feel expansive and "gallery-like."

- **The Studio Grid:** A 12-column grid is used for core application screens. However, "Creative Canvas" areas (like moodboards) should break the grid, using absolute positioning and overlapping elements to simulate a physical desk.
- **Rhythm:** Spacing follows an 8px base unit. Use generous `40px` or `64px` padding between major sections to maintain a premium, uncluttered aesthetic.
- **Mobile Reflow:** On mobile, the 12-column grid collapses to a single column with 16px side margins. Large display typography should scale down significantly while maintaining its heavy weight.

## Elevation & Depth
Elevation is achieved through **Tonal Layering** and **Tactile Affordances** rather than standard drop shadows.

- **Surface Tiers:** Background is `Base Cream`. Primary containers use a slightly lighter `Off-White` or a very subtle paper-grain texture.
- **The "Tape" Effect:** Elements that need to feel "added" to the workspace (like sticky notes or reference images) use a hard, 1px border in a slightly darker tan and a very small, sharp shadow (`4px offset, 0 blur`) to mimic paper thickness.
- **Depth via Overlap:** Use z-index to overlap elements intentionally. A "handwritten" note should always sit on the highest z-index, as if it were the last thing placed on the desk.
- **Active States:** Instead of a shadow increase, active buttons or cards should "press" down (transform: scale 0.98) or show a thicker, high-contrast border.

## Shapes
The shape language is **friendly but structured**. 

- **Primary Radius:** A consistent 0.5rem (8px) radius is applied to standard buttons, input fields, and small cards.
- **Large Containers:** Use `rounded-xl` (1.5rem) for main content areas and board backgrounds to soften the overall interface.
- **Interactive Accents:** Chips and tags should use "Pill" shapes (full radius) to contrast against the more rectangular layout of images and cards.
- **Visual Interest:** Reference images and "pinned" items can occasionally use a `0` (Sharp) radius to look like cut-outs or photographs.

## Components
- **Buttons:** Primary buttons are terracotta with white text, using bold Manrope. They should feel "hefty" with generous horizontal padding (24px+). 
- **Creative Cards:** Cards used for images or moodboard items should have a thin `#013220` (Forest) border at 10% opacity. Include a "Pin" icon or "Tape" graphic at the top to reinforce the studio theme.
- **Input Fields:** Use the Cream background with a bottom-only border in the Olive green for a sophisticated, minimalist look. Focus states should introduce a soft glow in Cobalt blue.
- **Annotation Tool:** A unique component consisting of a "Handwritten" font style (or specialized SVG paths) used for notes that appear to be scrawled over the UI.
- **Chips & Tags:** High-contrast background colors (Blush, Olive, Terracotta) with white or deep forest text. Use these to categorize "Mood" or "Direction."
- **Navigation:** The top bar should be transparent or utilize a subtle backdrop-blur, keeping the focus on the creative canvas below. Use the heavy brand font for the logo and Manrope for nav links.