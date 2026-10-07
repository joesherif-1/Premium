---
name: Premium
description: Everyday tech set as a printed Swiss product catalogue, grey stock, near-black ink, one signal yellow.
colors:
  stock: "#e7e8e6"
  plate: "#f3f3f1"
  sunken: "#d9dbd7"
  ink: "#131413"
  muted-ink: "#494d49"
  hairline: "#bcbfba"
  signal-yellow: "#f2c200"
  in-stock-green: "#2b6a2f"
  pending-umber: "#7a4f00"
  alert-red: "#b3261e"
typography:
  display:
    fontFamily: "Hanken Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Hanken Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Hanken Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Hanken Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.25rem
  label:
    fontFamily: "Hanken Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.06em"
  numeral:
    fontFamily: "Geist Mono Variable, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    fontFeature: "'tnum' 1"
rounded:
  all: "2px"
spacing:
  gutter: "16px"
  gutter-wide: "24px"
  plate-pad: "12px"
  page-edge: "40px"
  section: "128px"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stock}"
    rounded: "{rounded.all}"
    padding: "12px 20px"
  button-ink-hover:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.all}"
    padding: "12px 20px"
  button-quiet-hover:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  button-accent:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.all}"
    padding: "12px 20px"
  button-accent-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stock}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.all}"
    padding: "12px 20px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stock}"
  field:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.all}"
    padding: "10px 14px"
  plate-caption:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "12px"
  plate-caption-lead:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    padding: "12px"
  closing-band:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    padding: "48px"
---

# Design System: Premium

## Overview

**Creative North Star: "The Printed Sheet"**

Premium is set as a 1960s-70s Braun and Rams product catalogue: grey offset-printed stock, near-black ink, and one signal yellow. The whole range is meant to read as one sheet, so "curated and small" is visible rather than claimed. Every product is a numbered plate with a ruled caption and a mono spec line; pages sit on a rigid 12-column grid and refuse the centered hero over an identical card grid.

The system is flat and typographic. Structure comes from hairline ink rules, ruled rows and scale contrast between a heavy tight grotesk and a monospaced data voice. There are no shadows, no gradients and no rounded softness: every corner is 2px. Yellow is a printed field, never a glow. Green and red are not brand colors; they exist only to state stock and order status.

Light and dark themes both exist (CSS variables, `data-theme` override on the root, otherwise the OS preference). The dark theme is the same sheet printed on black stock; yellow and the 2px shape lock do not change.

**Key Characteristics:**
- Grey stock, near-black ink, one signal yellow used as flat fields.
- Heavy tight Hanken Grotesk for voice, Geist Mono for every numeral and datum.
- Numbered plates: a product's catalogue number is its rank among active products, shared by every page that shows it.
- Hairline rules and spec rows instead of cards, borders-with-shadow or panels.
- 2px corners everywhere that is not a circle; zero shadows; zero gradients.

## Colors

A monochrome printed palette with one saturated field color; chroma is reserved for yellow and for status.

### Primary
- **Signal Yellow** (#f2c200): a flat printed field. Used for the lead plate caption, the cart total panel, the checkout-success panel, the closing band, the wordmark full stop, the cart-count badge, the selection highlight, and the solid primary action on the product page. Hover target for ink and quiet buttons and category rows. Text on it is always Ink. Identical in light and dark.

### Neutral
- **Stock Grey** (#e7e8e6): page background (dark: #111210).
- **Plate Paper** (#f3f3f1): inputs and raised small controls (dark: #1b1c1a).
- **Sunken Grey** (#d9dbd7): image wells, skeletons, pagination hover (dark: #252623).
- **Ink** (#131413): text, rules, outlines, focus rings, scrollbar, filled buttons, active states (dark: #ecece8).
- **Muted Ink** (#494d49): secondary text, stock lines, help text, inactive nav (dark: #a3a6a1).
- **Hairline** (#bcbfba): quiet dividers between list rows (dark: #3a3c39). Structural rules under headings and plates use Ink, not Hairline.

### Status (only for stock and order state)
- **In-Stock Green** (#2b6a2f): in-stock count on the product page, paid orders, success message (dark: #7bc47f).
- **Pending Umber** (#7a4f00): pending orders (dark: #e8b84a).
- **Alert Red** (#b3261e): low stock ("Only 5 left"), sold out, form errors, destructive hover in admin (dark: #ff8a80).

### Named Rules
**The Flat Field Rule.** Yellow is a filled rectangle with Ink text on it, or a hover fill. It is never a text color on grey, a border, a gradient, a glow or a thin accent line.

**The One Primary Rule.** Solid yellow buttons (`button-accent`) mark the single primary action of a page (the product page's Add). Everywhere else the default button is Ink-filled or the Ink-outline quiet button; active and selected states are Ink-filled (the saved-wishlist heart is the one yellow state in the build).

**The Status Only Rule.** Green, umber and red state facts about stock and orders. They are never decoration, never category colors.

## Typography

**Display Font:** Hanken Grotesk Variable (with ui-sans-serif, system-ui)
**Body Font:** Hanken Grotesk Variable
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, SFMono-Regular)

Both families are self-hosted through fontsource. **Character:** a heavy, tightly set grotesk speaks; a tabular mono prints the facts. The two never swap jobs.

### Hierarchy
- **Display** (800, 3rem to 6rem, 0.95, -0.035em): the one page headline (`.display`). Home reaches 6rem at xl; other page titles reach 4.5rem (text-7xl). Never past 6rem.
- **Headline** (800, 1.875rem to 3rem, 0.95, -0.035em): section heads such as "Shop by category", set in the display voice.
- **Title** (700, 15px, snug): product names on plates and index rows; bold, truncated to one line on plates.
- **Body** (400, 14px to 16px, 20px to 24px): descriptions and notes; spec body capped near 56ch, closing copy near 44ch.
- **Label** (600, 12px, 0.06em, uppercase): only the spec-row label. Field labels are 14px semibold sentence case.
- **Numeral** (Geist Mono 500, 12px to 14px, tabular): catalogue numbers (zero-padded: 01), prices, stock counts, ratings, counts, the cart total at 3rem.

### Named Rules
**The Mono Facts Rule.** Anything a shopper might compare or add up (number, price, stock, rating, quantity, total) is set in `.num`. Prose is never mono.

**The Heavy Voice Rule.** Headlines are weight 800 with negative tracking; there is no light or regular display weight.

## Layout

A rigid 12-column grid (`.grid12`: 16px gutters, 24px from lg) inside a page container capped at 1400px with 16/24/40px side margins (base/sm/lg). The home first sheet is: headline on columns 1-9, range count and "Shop the range" in columns 10-12, then a hairline-topped row with the lead plate on columns 1-5 and a 2x2 block of compact plates on columns 6-12. Overflow products continue as an index list (number, photo, name and description, price over stock, add).

Vertical rhythm is large and steady: 96px (mobile) to 128px (md) between home sections, 32-48px inside blocks. Plates use 12px caption padding; the closing band 32px to 48px. Dense admin and index surfaces use hairline-separated rows rather than cards. Spec rows are a 7.5rem label column plus value, each topped by a 1px Ink rule. Breakpoints are Tailwind defaults; at narrow widths the 12-col blocks stack and icon-only Add buttons (40px square) replace labelled ones in dense rows.

## Elevation & Depth

None. The system has no shadows, no gradients and no blur. Depth is conveyed by ruled lines (1px Ink rules above captions and sections), flat tonal fields (Stock, Plate Paper, Sunken, Yellow) and image outlines (a 1px 10% black or white inset outline on every image). Hover is a fill swap, not a lift; images on plates scale 1.03 over 700ms. Active buttons move down 1px.

### Named Rules
**The No Shadow Rule.** Separate things with a rule or a field change. No `box-shadow`, `drop-shadow` or gradient exists anywhere in the build.

## Shapes

One corner radius for everything that is not a circle: 2px. Tailwind's whole radius theme (xs through 3xl) is overridden to 2px, so any rounded utility resolves to it. Silhouettes are rectangles: image wells are square-cut, the wordmark full stop is a small square, badges are rectangles. Borders are 1px Ink for outlined controls and rules; inputs use Ink at 45% opacity, solid Ink on hover and focus. Focus is a 2px Ink outline with 2px offset.

### Named Rules
**The Shape Lock Rule.** 2px or square, nothing in between and nothing rounder. Do not introduce pill shapes or large radii.

## Components

### Buttons
Buttons are plain labelled rectangles; every state change is a colour swap in 150ms.
- **Shape:** 2px corners, 12px 20px padding, 14px semibold; `btn-sm` is 10px 16px at 13px.
- **Ink (`btn-ink`):** Ink fill, Stock text; hover turns Signal Yellow with Ink text. The default for navigation and submit actions.
- **Quiet (`btn-quiet`):** 1px Ink outline, transparent; hover fills yellow. The default Add to cart button on plates and rows.
- **Accent (`btn-accent`):** Signal Yellow fill, Ink text; hover swaps to Ink. Reserved for the product page's primary Add.
- **Ghost (`btn-ghost`):** 1px Ink outline; hover fills Ink. Secondary actions such as Sign out and Cancel.
- **On a yellow field:** use Ink fill (the lead plate's Add is `btn-ink`) or a 1px Ink-outline button; hover inverts.
- **States:** active nudges down 1px; disabled 45% opacity. Add shows "Add to cart", then a checked "Added" for 1.4s, or "Sold out" disabled.

### Plates (product cards)
A photograph above a 1px Ink rule, then a caption (12px padding): zero-padded catalogue number, bold name, mono price on one baseline row; compact plates then show Add and the stock line on one row; full plates add rating and a two-line description. The lead plate prints its caption on Signal Yellow with Ink text and an Ink Add button. Image wells are Sunken Grey with fixed aspects (lead 3:2, plain 5:4, compact 16:7, wide 16:9). Wishlist is a small square control at the photo's top-right: Plate Paper at rest, Ink on hover, yellow when set.

### Inputs / Fields
Plate Paper fill, 1px Ink at 45% border, 2px corners, 10px 14px padding, 14px text; muted placeholder. Hover and focus take a solid Ink border plus the global Ink focus outline. Labels above in 14px semibold Ink; help in 13px Muted; errors in 13px semibold Alert Red.

### Navigation
Sticky bar with a 1px Ink bottom rule on Stock Grey, 64px tall. Wordmark "Premium" (20px, 800, -0.03em) followed by a small yellow square full stop with an Ink hairline. Links are 14px semibold; the active link carries a 2px Ink underline, others Muted. 40px square icon buttons (wishlist, bag, theme, menu) fill Ink on hover; the cart count is a small yellow rectangle with mono numerals. Mobile opens a ruled, full-width list of 18px semibold links.

### Spec rows and index rows
Label-left, value-right lines, each topped by a 1px Ink rule, used for checkout notes and product facts. Category and index lists are Ink-ruled stacks with Hairline separators; category rows fill yellow on hover with an arrow that shifts 4px.

### Yellow panels
Closing band, cart total (mono 3rem) and checkout success are full-width flat yellow fields with 24px to 56px padding and Ink text, paired with an Ink button.

## Do's and Don'ts

### Do:
- **Do** show the catalogue number (zero-padded, mono) wherever a product appears, drawn from `useCatalogueNumbers` so it is identical on every page.
- **Do** use Ink 1px rules to open a block, and Hairline for separators within a list.
- **Do** set prices, stock, ratings and counts in Geist Mono with tabular figures.
- **Do** use `btn-quiet` as the default Add button, `btn-ink` for navigation and submit, `btn-accent` only for a page's single primary action.
- **Do** keep text on yellow in Ink (#131413) in both themes.
- **Do** keep the 2px shape lock and the 2px Ink focus outline.
- **Do** let admin follow the same tokens with scanability first: ruled rows, mono data, status colours for stock and order state.

### Don't:
- **Don't** use yellow as text, border, underline or gradient on a grey ground; it is a fill only.
- **Don't** use green, umber or red for anything but stock and order status or form errors.
- **Don't** add shadows, gradients, blur, pills or radii above 2px.
- **Don't** replace the 12-column plate sheet with a centered hero over an identical card grid.
- **Don't** set prose or headlines in the mono voice, or numerals in the grotesk.
- **Don't** invent testimonials, press or sales figures as proof; real price, live stock and real rating are the proof.
