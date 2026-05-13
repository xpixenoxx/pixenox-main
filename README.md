# Pixenox Website Review

This document reviews the current website implementation with focus on:

- overall smoothness and interaction quality
- responsiveness across desktop/tablet/mobile
- likely performance and UX risks based on code/CSS structure

## Review Scope

- Public pages reviewed from source:
  - Home
  - Services (listing + slug)
  - Work (listing + case study slug)
  - Company
  - Careers
  - Contact
- Styling/interaction layers reviewed:
  - `src/styles/globals.css`
  - page-level CSS files in `src/app/(public)`
  - layout interaction components (header/transitions)

> Note: This is a source-code UX review (no live Lighthouse/device lab run in this pass).

## Quick Scorecard

- **Visual Smoothness:** 8.5/10
- **Perceived Premium Feel:** 9/10
- **Responsiveness Structure:** 7.5/10
- **Mobile Ergonomics:** 7/10
- **Performance Safety Margin (mid/low-end devices):** 6.5/10

## What Is Already Strong

- Strong use of fluid typography via `clamp(...)` across many sections.
- Good breakpoint coverage (`1024`, `768`, `640`) in global and page CSS.
- Good modern interaction stack (`framer-motion`, dynamic loading, visual hierarchy).
- `prefers-reduced-motion` handling exists globally, which is excellent for accessibility.
- Layout rhythm and grid consistency are generally strong on desktop.

## Smoothness Review

### Strengths

- Header behavior and page transitions are polished and intentional.
- Hover and motion design language is consistent and premium.
- Section transitions and card micro-interactions feel cohesive.

### Smoothness Risks

- Multiple pages layer heavy effects simultaneously:
  - large blurred radial glows
  - fixed overlays
  - noise/scanline layers
  - continuous keyframe animations
- Several pages rely on `backdrop-filter` and large blur radii, which can stutter on mid-range mobile GPUs.
- Some transitions use many parallel animated elements, potentially increasing frame drops during scroll.

### Smoothness Recommendation

- Add a global "motion-lite" mode for devices with coarse pointers or lower performance profiles.
- Reduce blur radius and animation frequency on mobile breakpoints.
- Avoid animating large fixed layers continuously when off-screen.

## Performance-Safe Review

### What "Performance-Safe" Means Here

For this project, performance-safe should mean:

- smooth scroll and interactions on mid-range mobile devices
- no major frame drops during section transitions
- stable viewport behavior on mobile browser UI changes
- visual richness that degrades gracefully under constrained hardware

### Current Risk Level

- **Desktop:** Low risk (generally safe)
- **Modern flagship mobile:** Medium risk
- **Mid/low-end mobile:** Medium-high risk

### Main Performance-Safety Risks Found

1. **Too many simultaneous GPU-heavy effects**
   - Large `blur(...)`, `backdrop-filter`, fixed glows, and scanline/noise layers stacked together.
2. **Continuous animations on large layers**
   - Infinite keyframes on decorative elements can consume frame budget even when user is idle.
3. **Viewport instability risks**
   - `100vh` on hero-sized blocks can cause jumps with dynamic browser chrome.
4. **Desktop-first visual constants**
   - Some fixed sizes and spacing increase render/layout pressure on smaller devices.
5. **Input model mismatch**
   - Effects designed for hover/fine pointer are sometimes still active where touch is primary.

### Performance-Safe Guardrails (Recommended)

- **Guardrail 1: Motion tiers**
  - Tier A (desktop/fine pointer): full effects
  - Tier B (tablet/coarse pointer): reduced blur, slower/less frequent animation
  - Tier C (`prefers-reduced-motion` or low-end profile): minimal decorative animation
- **Guardrail 2: Effect budget per viewport**
  - Limit to 1-2 simultaneous large blur/fixed decorative layers on mobile.
- **Guardrail 3: Animation budget**
  - Prefer transform/opacity only; avoid animating filter-heavy large surfaces continuously.
- **Guardrail 4: Viewport safety**
  - Prefer `min-height` + `100dvh` fallback strategy for fullscreen sections.
- **Guardrail 5: Interaction parity**
  - Disable non-essential hover-driven visuals on coarse pointers.

### Performance-Safe Acceptance Checklist

Treat these as pass criteria before launch:

- No noticeable jank while scrolling through the heaviest page sections on mobile.
- Navigation open/close and route transitions stay visually smooth.
- No horizontal overflow side-effects on key public pages.
- Hero/fullscreen sections do not "jump" when browser bars expand/collapse.
- Reduced-motion users still get clear hierarchy and usable interactions.

## Responsiveness Review

### Overall

The site is broadly responsive and modern, but there are specific hotspots that can create overflow, cramped spacing, or heavy rendering on smaller screens.

### Page-by-Page Notes

#### Home

- Good:
  - Extensive responsive breakpoints in home section CSS.
  - Flexible typography and container scaling.
- Watch:
  - Horizontal card regions with `overflow-x: auto` and fixed/min widths may feel constrained on narrow devices.

#### Services Listing

- Good:
  - Hero and grid collapse logic exist for smaller screens.
- Watch:
  - Rich effects stack can hurt scroll smoothness on mobile.
  - Large glow and scanline effects are visually strong but expensive.

#### Service Detail (Slug)

- Good:
  - Uses responsive fallback for title size on mobile.
  - Header/content spacing patterns are clear.
- Watch:
  - Some desktop-first constants (e.g., fixed large title baseline before breakpoint) may still feel oversized on small landscape devices.

#### Work Listing

- Good:
  - 12-column asymmetrical grid degrades cleanly to simpler layouts.
- Watch:
  - Fixed desktop title sizing (e.g., large constant px values) can require more mobile-specific tuning.

#### Case Study Detail

- Good:
  - Strong clamp usage, responsive media sections, controlled container widths.
- Watch:
  - Many rich visuals + hover transforms together may reduce mobile FPS.

#### Company

- Good:
  - Responsive text scaling exists for hero typography.
- Watch:
  - `height: 100vh` hero can cause viewport instability on mobile browsers with dynamic bars.
  - Crosshair cursor and kinetic effects are desktop-leaning; reduce intensity on touch devices.

#### Careers

- Good:
  - Clean breakpoint progression for grids/cards/modals.
  - Practical form and list layout behavior on smaller breakpoints.
- Watch:
  - None critical; this page is one of the most stable responsive implementations.

#### Contact

- Good:
  - Mobile fallback for form rows and left padding reset is implemented.
  - Coarse pointer media query disables spotlight effect.
- Watch:
  - `cursor: none` on interactive controls can hurt usability/accessibility on some environments.
  - Large fixed spotlight and animated particles are expensive without strict throttling.

## Priority Fixes (High Impact)

1. **Adopt a global mobile performance profile**
   - Disable/reduce heavy blur + fixed animated overlays under `max-width: 768px` and coarse pointers.
2. **Replace some `100vh` sections with dynamic viewport units**
   - Prefer `100dvh`/`min-height` strategies to avoid mobile browser chrome jumps.
3. **Normalize oversized constants**
   - Replace remaining fixed px typography blocks with `clamp(...)` where desktop constants still dominate.
4. **Review horizontal overflow zones**
   - Ensure card carousels/rows with min-width values do not force awkward side-scrolling.
5. **Keep pointer UX standard on touch/desktop**
   - Avoid `cursor: none` on key controls unless fully justified and alternative cues are robust.

## Suggested QA Matrix

Test the following minimum viewport/device set:

- 390x844 (small phone portrait)
- 768x1024 (tablet portrait)
- 1024x768 (tablet landscape)
- 1366x768 (small laptop)
- 1920x1080 (desktop)

For each page:

- check first paint + scroll FPS
- check no horizontal overflow unless intentional
- check form usability and CTA tap areas
- check navigation and fixed header behavior
- check reduced-motion behavior

## Final Verdict

The website is visually premium and mostly well-structured for responsive behavior.  
Main opportunity is not design quality but **performance-safe responsiveness**: tune heavy visual effects for mobile and lower-powered devices so smoothness remains consistent across the full audience.
