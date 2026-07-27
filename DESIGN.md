---
version: "mithra-direct-community-commerce"
name: "Mithra Direct - Community Commerce"
description: "A warm, trustworthy and modern light visual system for hyperlocal shopping, neighbourhood vendors, subscriptions and local delivery."
designVariance: 7
motionIntensity: "restrained"
visualDensity: 4
---

# Mithra Direct - Community Commerce

## Design intent

Mithra Direct should feel warm, trustworthy, convenient and locally connected. The visual system should make customers comfortable ordering everyday essentials and make vendors feel that they are using a reliable professional commerce platform. The interface should prioritize neighbourhood discovery, clear product presentation, transparent delivery information, subscriptions and long-term customer relationships.

The design communicates:

- Trust
- Community
- Freshness
- Everyday convenience
- Reliable delivery
- Transparent commerce
- Vendor professionalism
- Local-business growth

The design must not feel dark, cyberpunk, technical, developer-oriented, crypto-inspired, AI-infrastructure-inspired, neon-heavy, cold, or experimental.

## Theme behavior

Mithra Direct uses one consistent light theme.

- Set the application root to `color-scheme: light`.
- Do not change the interface in response to the operating-system color scheme.
- Customer and vendor workflows use light canvases, white surfaces, dark text, and deep teal actions.
- Do not define automatic dark page, card, input, dialog, drawer, or navigation variants.
- A deep navy footer is permitted as a limited terminal section.
- A small intentional dark promotional area may be used when it supports content, but dark backgrounds should normally occupy no more than approximately 10% of a customer-facing page.

## Preservation contract

Preserve:

- Business logic and API contracts
- Authentication and routes
- Data fetching and normalization
- Existing functional controls
- Form meaning, validation, and field semantics
- Cart, checkout, order, payment, subscription, vendor, and delivery behavior when present
- Accessibility semantics, labels, keyboard behavior, live regions, and focus management
- Existing loading, empty, success, and error behavior

Allow careful improvements to:

- Section spacing and container padding
- Card groupings and surface hierarchy
- Hero composition
- Grid gaps and visual ordering within a section
- Responsive spacing and stacking
- Image sizing and placement
- Typography scale and weight
- CTA hierarchy
- Navigation presentation
- Content grouping and component elevation
- Section backgrounds

Do not arbitrarily rewrite the application, remove functional components, rename routes, or change business behavior. Layout changes are permitted only when they improve clarity, warmth, responsiveness, or commerce usability.

## Semantic color system

```yaml
colors:
  canvas: "#F8FAF8"
  canvas-warm: "#FCFBF7"

  surface: "#FFFFFF"
  surface-muted: "#F1F6F3"
  surface-warm: "#FFF9ED"
  surface-elevated: "#FFFFFF"

  ink: "#1F2937"
  ink-strong: "#17324D"
  muted: "#667085"
  muted-light: "#8A949F"

  primary: "#176B5B"
  primary-hover: "#125246"
  primary-soft: "#E8F4F0"
  primary-text: "#FFFFFF"

  secondary: "#17324D"
  secondary-soft: "#EDF3F7"

  accent: "#F59E0B"
  accent-hover: "#D98705"
  accent-soft: "#FFF4D6"

  line: "#DDE5E1"
  line-subtle: "#E9EEEB"

  success: "#16803C"
  success-soft: "#EAF7EE"

  warning: "#C76B08"
  warning-soft: "#FFF4E5"

  danger: "#C93C37"
  danger-soft: "#FDECEC"

  info: "#2563EB"
  info-soft: "#EAF1FF"
```

Use semantic variables by meaning rather than assigning one green to every role. Deep teal is the brand and action color. Navy establishes trust and professional hierarchy. Amber supplies warmth. Blue, green, amber, indigo, and red communicate distinct operational states.

When normal-sized warning or danger text appears on a matching soft surface, use accessible derived text tokens (`#9A4D00` for warning and `#B42318` for danger) while retaining the canonical colors for borders, icons, and larger decorative moments.

## Surface hierarchy

White and near-white surfaces are foundational to the Mithra Direct interface. Customer and vendor pages must contain clearly visible white cards, panels, forms, navigation surfaces and content areas. The platform must never become a full-page dark SaaS interface.

Use white surfaces for:

- Navigation
- Vendor, product, category, subscription, and order cards
- Search and location panels
- Forms and inputs
- Cart and checkout summaries
- Vendor dashboard widgets and tables
- Drawers, dialogs, and dropdowns
- Account panels
- Empty, loading, and error states

The default page canvas is `#F8FAF8`, allowing white cards to remain visibly distinct. Alternate intentionally between the neutral canvas, warm canvas, white surfaces, pale green grouping sections, and occasional pale amber subscription or community highlights.

### Color distribution

- Approximately 65-75% of each page should use white, warm white, or light neutral surfaces.
- Approximately 15-20% may use pale green, pale blue, or pale amber sections.
- Strong teal is reserved for primary actions, selected states, links, focus indicators, and important brand moments.
- Navy is used for headings, navigation text, and professional vendor-facing emphasis.
- Amber is used sparingly for subscriptions, offers, friendly highlights, and attention states.
- Red only represents errors, cancellation, failure, or destructive actions.
- Do not use large teal, navy, or black surfaces merely to create visual impact.

## Typography

Use Inter as the primary interface family.

- Display and major headings: Inter, weight 600-700
- Section headings: Inter, weight 600
- Body: Inter, weight 400-500
- Navigation and controls: Inter, weight 500-600
- Labels and metadata: Inter, weight 500-600
- Prices: Inter, weight 600-700

Do not use monospace for eyebrows, kickers, vendor metadata, distance, delivery times, ratings, product counts, status labels, footer labels, or order information. Monospace is reserved for rare genuine technical identifiers.

Fonts must be served locally with `font-display: swap`.

## Shape and material

- Cards use a consistent 12px radius.
- Controls use a consistent 9px radius.
- Pills are limited to badges, filters, and status chips.
- Borders use subtle green-grey line tokens.
- Standard cards use `0 4px 16px rgba(23, 50, 77, 0.06)`.
- Elevated cards and drawers use `0 10px 30px rgba(23, 50, 77, 0.08)`.
- White surfaces sit visibly above light neutral canvases.
- Selected states use pale green fills and clear teal borders.
- Primary actions use deep teal with white text.
- Secondary actions use white surfaces, dark text, and visible borders.

Do not use glowing green shadows, neon borders, full black cards, heavy glassmorphism, excessively transparent surfaces, dark inputs, or charcoal buttons as the default primary action.

## Header and navigation

- Use a white background with navy or charcoal text.
- Use teal for the active or primary action state.
- Separate the header with a subtle bottom border and restrained navy-tinted shadow.
- Translucency may be used lightly, but the header must remain visibly white.
- Keep location discovery and search access easy to find.
- Keep cart or order controls recognizable when those features are present.
- Preserve existing navigation functionality while improving spacing or grouping when needed.
- Do not use a dark header as the default.

## Hero

The hero introduces neighbourhood commerce rather than technology.

- Use white, warm white, or pale green as the background.
- Use a navy or charcoal headline and friendly supporting copy.
- Keep the brand promise and hero illustration static so API loading never changes the first impression.
- Show customers ordering through a mobile or web app while neighbourhood vendors prepare orders for local delivery.
- Keep the location picker within the primary hero path as the hero's main action.
- Place the API-backed featured-vendor carousel in a dedicated section directly below the hero.
- Keep storefront controls compact, place business identity outside the media, and avoid duplicating the carousel later in discovery.
- Reinforce nearby businesses, local products, neighbourhood delivery, recurring subscriptions, and trusted vendors.

Do not depict customers purchasing directly across a shop counter. Do not use dark hero backgrounds, neon text, abstract compute graphics, particle fields, network-node visuals, futuristic lighting, or technical metadata labels.

## Discovery experience

Discovery is a core commerce workflow, not a technical data browser.

- Search, location, vendor, and product surfaces use white cards with visible separation from the canvas.
- Featured businesses resolve media in order: banner image, thumbnail image, then an accessible branded name treatment.
- Name-only carousel fallbacks use one compact availability label and a centered, balanced business name. Do not add a second descriptive tagline inside the media fallback.
- Offer rails prioritize API-backed offers and link every resolvable offer to its vendor or product preview. Empty offer data may expose a clearly labelled sample preview for design inspection, but simulated discounts, codes, vendors, and expiry dates must never be presented as live.
- Offer rails use visible horizontal controls, a deliberate edge crop, and a compact range of warm semantic tints so they attract attention without reading as an unrelated advertising system.
- Selected and highlighted states use restrained pale green.
- Result metadata uses standard readable Inter typography.
- Vendor and product imagery remains visually prominent.
- Show verified state, category, serviceability, price, delivery estimate, distance, delivery fee, minimum order, rating, open state, and subscription availability when those values exist in real application data.
- Never invent ratings, prices, delivery times, fees, counts, or availability.
- Loading skeletons match the final card shapes.
- Empty and error states remain contextual, calm, and actionable.

## Community and local identity

- Prefer imagery of real or authentic-looking local businesses.
- Show shop owners, neighbourhood storefronts, products, and delivery interactions.
- Use friendly vendor stories or community highlights where supported.
- Emphasize verified vendors and transparent serviceability.
- Avoid generic server, cloud, network, blockchain, or futuristic imagery.
- Avoid abstract technology graphics as the primary visual focus.
- Product and vendor content should be more visually prominent than decorative effects.

Appropriate trust labels include:

- "Verified local business"
- "Delivers to your neighbourhood"
- "Transparent pricing"
- "Manage or pause anytime"
- "Supporting businesses near you"

Do not invent ratings, delivery times, vendor counts, testimonials, or impact metrics that are not supported by actual data.

## Warm secondary accents

Use amber sparingly for subscription cards, offers, important reminders, popular-category badges, community highlights, and friendly decorative details.

Use pale blue sparingly for delivery information, informational notices, order tracking, and vendor operational messages.

Secondary accents support meaning. They must not turn the interface into a noisy multi-color system.

## Forms, controls, and commerce panels

- Labels remain visible above fields.
- Inputs, selects, cart panels, checkout summaries, and account panels use white surfaces.
- Placeholders remain readable without competing with entered text.
- Focus states use a visible teal ring.
- Errors use danger text plus a clear written message.
- Primary actions use deep teal with white text.
- Secondary actions use white with a border.
- Touch targets remain at least 44px.

## Subscriptions

- Use warm white or pale amber to distinguish recurring-delivery moments.
- Make frequency, pause, resume, skip, and next-delivery information easy to scan.
- Use teal for the main action and amber only for friendly emphasis or reminders.
- Never imply savings, delivery dates, or availability that are not present in application data.

## Vendor dashboard

Vendor-facing workflows also use the light theme:

- Page canvas: `#F8FAF8`
- White dashboard cards and tables
- Navy headings
- Teal active navigation
- Clear neutral borders
- Restrained shadows
- Accessible status chips with text labels

Order statuses use distinct semantic colors:

- New: blue
- Accepted: teal
- Preparing: amber
- Ready: indigo
- Out for delivery: blue
- Delivered: green
- Cancelled or failed: red

Do not use green for every status. Avoid a full-page dark dashboard. A white or pale sidebar is preferred.

## Footer

The footer may use either:

- Deep navy with white text, or
- Warm light with dark text

A deep navy footer is acceptable because it is a limited terminal section. It must not cause any preceding workflow or page surface to inherit a dark theme.

## Motion

Motion is restrained and functional.

Allow:

- Subtle hover elevation
- Dropdown and drawer transitions
- Cart feedback
- Skeleton loading
- Small entrance transitions
- Success feedback

Remove or avoid:

- Ambient animated gradients
- Constant floating effects
- Dramatic reveal sequences
- Glowing animations
- Scroll-linked spectacle
- WebGL, Three.js, and particle effects

Continue respecting `prefers-reduced-motion`.

## Responsive behavior

Preserve working responsive functionality while allowing careful improvements to mobile hero height, search placement, location selection, card width, grid density, section padding, navigation grouping, touch spacing, checkout panels, and vendor dashboard tables.

On mobile:

- Keep location and search controls visible early.
- Do not let the hero consume excessive vertical space.
- Make the navigation panel fill the viewport below the header and scroll independently when needed.
- Keep carousel frames at a stable breakpoint-specific height; crop imagery with `object-fit: cover` so source dimensions never resize the showcase.
- Use white cards against the light page canvas.
- Prevent horizontal overflow.
- Preserve touch-friendly controls.
- Keep cart, checkout, and subscription actions easy to reach when present.

## Accessibility

- Meet WCAG AA contrast for body text and controls.
- Maintain strong contrast between white surfaces and the page canvas.
- Use visible teal focus rings.
- Pair every status color with a text label.
- Provide clear error messages.
- Keep menus, drawers, forms, and controls keyboard-operable.
- Preserve minimum 44px touch targets.
- Do not use low-contrast bright green text on white.
- Do not rely on color alone for verification or order status.
- Primary buttons use white text on deep teal.
- Continue respecting `prefers-reduced-motion`.

## Implementation checklist

- [ ] The document contains no inherited source-product language.
- [ ] The application uses a light theme only.
- [ ] Automatic OS-level dark mode has been removed or disabled.
- [ ] The global canvas uses a warm light neutral.
- [ ] White surfaces are clearly visible throughout customer and vendor pages.
- [ ] The primary color is deep teal rather than bright neon green.
- [ ] Navy is used for trust-oriented headings and professional emphasis.
- [ ] Amber is used sparingly for warmth and subscriptions.
- [ ] Monospace is removed from normal interface content.
- [ ] Customer discovery prioritizes vendors, products, location, and delivery information.
- [ ] The hero communicates neighbourhood commerce rather than technology.
- [ ] Vendor pages remain professional without becoming dark.
- [ ] Cards, forms, drawers, tables, and dialogs follow the white-surface system.
- [ ] Status colors are semantically distinct.
- [ ] Contrast and focus indicators meet WCAG AA.
- [ ] Mobile and desktop layouts have been visually checked.
- [ ] Existing commerce logic and API behavior remain unchanged.
- [ ] Tests and production build pass.
