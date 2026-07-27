---
version: "mithra-direct-synapse-visual-refresh"
name: "Mithra Direct - Synapse Green"
description: "A crisp, technical visual system for neighbourhood commerce, adapted from the Synapse decentralized-compute reference without changing the site's established structure, layout, or motion."
designVariance: 6
motionIntensity: "preserve existing"
visualDensity: 4
---

# Mithra Direct - Synapse Green

## Design intent

Mithra Direct should feel direct, capable, and optimistic. The visual language pairs a nearly white canvas with precise charcoal typography, bright green actions, pale green supporting surfaces, and restrained technical labels.

This is a redesign in preserve mode. The reference supplies the visual system, while the existing Mithra Direct page remains the source of truth for content hierarchy and behavior.

## Preservation contract

The revamp must not change:

- React component structure or DOM order
- Section order, anchor IDs, navigation labels, or conversion paths
- Existing grid and flex layouts
- Container widths, section spacing, breakpoints, or responsive stacking
- Image placement, aspect ratios, or cropping behavior
- Form field order, labels, validation, or accessibility attributes
- Animation names, durations, easing, reveal behavior, hover movement, or reduced-motion handling
- Discovery interactions, carousel controls, preview drawer behavior, loading states, or error states

The revamp may change:

- Semantic color tokens and component color states
- Font families and typographic roles
- Font weights where they do not alter hierarchy
- Border color, shadow character, and surface tint
- Corner-radius tokens
- Browser theme colors

## Reference mapping

The visual direction is adapted from the supplied Synapse design:

- Synapse primary green becomes the single Mithra Direct accent.
- Synapse pale green becomes the supporting surface and focus color.
- Synapse near-white becomes the page canvas.
- Synapse charcoal and grey become primary and secondary text.
- Synapse technical typography becomes the hierarchy for labels and metadata.
- Synapse 8px geometry becomes the shared card and control radius.

No compute, WebGL, authentication, or decentralized-network motifs are introduced. Those belong to the source product, not Mithra Direct.

## Color system

### Light mode

| Token | Value | Role |
| --- | --- | --- |
| `--canvas` | `#FDFDFD` | Page background |
| `--surface` | `#FFFFFF` | Primary cards, inputs, and panels |
| `--surface-strong` | `#BBF7D0` | Highlighted and selected surfaces |
| `--surface-muted` | `#F0FDF4` | Section tint and quiet grouping |
| `--ink` | `#111827` | Primary text and dark actions |
| `--muted` | `#4B5563` | Supporting text |
| `--accent` | `#4ADE80` | Primary action and focus color |
| `--accent-hover` | `#22C55E` | Hover and pressed action color |
| `--accent-soft` | `#BBF7D0` | Soft emphasis and selection |
| `--line` | `#E5E7EB` | Borders and separators |
| `--danger` | `#B42318` | Errors and destructive feedback |

### Dark mode

Dark mode keeps the same green identity and hierarchy rather than switching to a separate visual theme.

| Token | Value | Role |
| --- | --- | --- |
| `--canvas` | `#0B0F14` | Page background |
| `--surface` | `#121923` | Primary cards, inputs, and panels |
| `--surface-strong` | `#173D26` | Highlighted surfaces |
| `--surface-muted` | `#101A15` | Section tint and quiet grouping |
| `--ink` | `#F3F4F6` | Primary text |
| `--muted` | `#B7C0CC` | Supporting text |
| `--accent` | `#4ADE80` | Primary action and focus color |
| `--accent-hover` | `#86EFAC` | Hover action color |
| `--accent-soft` | `#173D26` | Soft emphasis and selection |
| `--line` | `#293442` | Borders and separators |
| `--danger` | `#FCA5A5` | Errors and destructive feedback |

## Typography

The reference explicitly calls for Inter, Space Grotesk, and JetBrains Mono. They are assigned by role:

- Display: Inter, weight 500, for `h1`, `h2`, and major numeric moments
- Body: Space Grotesk, weight 400-600, for paragraphs, navigation, forms, and buttons
- Labels: JetBrains Mono, weight 600, for eyebrows, kickers, compact metadata, counts, statuses, and footer group labels

Font files must be self-hosted through local dependencies and use `font-display: swap`.

Existing font sizes, line heights, and spacing remain unchanged so the established layout is preserved.

## Shape and material

- Cards: 8px radius
- Controls: 8px radius
- Pills: 9999px only where a control is semantically pill-shaped
- Borders: 1px using the semantic line token
- Shadows: soft charcoal-tinted depth with no glow
- Selected states: pale green fill plus a clear border
- Primary actions: bright green background with charcoal text
- Dark actions: charcoal background with near-white text

Cards remain present only where the existing layout uses them. No new card containers are introduced.

## Component treatment

### Header and navigation

- Keep the 72px sticky header and its current three-column layout.
- Use the near-white or dark canvas with a subtle translucent treatment.
- Keep the current logo construction and wordmark.
- Use the single green accent for the mark and the word `direct`.

### Hero

- Keep the split composition, image, copy, actions, and reveal timing.
- Use Inter for the headline and Space Grotesk for body copy.
- Render the eyebrow in JetBrains Mono with the green accent.
- Preserve the pale-green backing shape behind the hero image.

### Discovery experience

- Preserve every search, carousel, product, vendor, drawer, loading, empty, and error layout.
- Use pale green for selected and highlighted states.
- Use bright green for primary actions, focus rings, active dots, and meaningful icons.
- Use JetBrains Mono for result metadata, counts, and compact status labels.

### Marketing sections

- Keep all current section compositions and image positions.
- Use white and pale-green surfaces within the same page theme.
- Keep one consistent green accent across audience, journey, subscriptions, features, impact, and waitlist.
- Remove color-role drift by routing all component states through semantic tokens.

### Forms

- Labels remain above inputs.
- Inputs use white or dark surfaces, visible borders, and high-contrast placeholder text.
- Focus uses the green accent with an offset ring.
- Error text uses the danger token.

### Footer

- Keep the current layout and link groups.
- Use the same surface family as the rest of the page, with high-contrast text and green brand accents in both modes.

## Motion

Motion is explicitly frozen to the existing implementation:

- IntersectionObserver reveal behavior remains unchanged.
- Existing transition durations and easing remain unchanged.
- Carousel, drawer, skeleton, loading, hover, and active-state animations remain unchanged.
- No new ambient, scroll-linked, or WebGL effects are added.
- Existing `prefers-reduced-motion` behavior remains mandatory.

## Responsive behavior

The existing responsive implementation remains the source of truth:

- Desktop navigation stays on one line.
- The mobile menu replaces desktop navigation at the existing breakpoint.
- Split sections collapse using their current rules.
- Discovery rails and carousels retain their existing overflow and touch behavior.
- No breakpoint, width, padding, gap, or stacking rule may be changed as part of this visual refresh.

## Accessibility

- Body text and controls must meet WCAG AA contrast in both modes.
- Primary green buttons use charcoal text for strong contrast.
- Focus indicators remain visible and at least 3px.
- Touch targets remain at least 44px.
- Keyboard navigation, labels, live regions, and drawer focus behavior remain intact.
- Dark mode follows `prefers-color-scheme`.
- Motion follows `prefers-reduced-motion`.

## Implementation checklist

- [ ] Semantic tokens match this document.
- [ ] Inter, Space Grotesk, and JetBrains Mono are loaded locally.
- [ ] All hard-coded legacy greens are replaced with semantic tokens.
- [ ] Card and control radii use the 8px system.
- [ ] Primary green buttons use charcoal text.
- [ ] Light and dark browser theme colors match the canvas tokens.
- [ ] No markup, section order, layout rule, breakpoint, or animation changed.
- [ ] Tests and production build pass.
- [ ] Desktop, tablet, and mobile visuals are checked in light and dark modes.
