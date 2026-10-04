---
version: alpha
name: DocuAsk
description: "A warm, paper-calm document Q&A workspace for Indonesian professionals. Off-white canvas under near-black type, structured by a single confident teal accent used only on interactive elements and citation markers. The system reads as a professional reading desk: quiet, legible, trustworthy. Display type is Plus Jakarta Sans at 600–700 with light negative tracking; body runs IBM Plex Sans at 400 for sustained document reading. Cards sit on white surfaces with warm hairline borders. The teal accent appears on primary actions, citation badges, and focus rings — never decoratively."

colors:
  primary: "#1a7578"
  on-primary: "#ffffff"
  canvas: "#f7f6f3"
  surface: "#ffffff"
  sunken: "#f0eeea"
  line: "#e3dfda"
  line-strong: "#d2cec8"
  ink: "#1a1a1e"
  muted: "#64696f"
  accent:
    DEFAULT: "#1a7578"
    hover: "#146264"
    soft: "#e7f4f4"
    ring: "#a3d5d6"
  positive:
    DEFAULT: "#067647"
    soft: "#ecfdf3"
  warning:
    DEFAULT: "#b54708"
    soft: "#fffaeb"
  danger:
    DEFAULT: "#b42318"
    soft: "#fef3f2"

typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.75px
  heading-1:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.5px
  heading-2:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.3px
  heading-3:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.1px
  body:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  caption:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  citation:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  mono:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

elevation:
  card:
    boxShadow: "0 1px 2px 0 rgba(26,26,30,0.04), 0 1px 3px 0 rgba(26,26,30,0.06)"
  pop:
    boxShadow: "0 8px 24px -6px rgba(26,26,30,0.14), 0 2px 6px -2px rgba(26,26,30,0.08)"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  button-primary-hover:
    backgroundColor: "{colors.accent.hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  button-ghost:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger.DEFAULT}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge-neutral:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  badge-accent:
    backgroundColor: "{colors.accent.soft}"
    textColor: "{colors.accent.hover}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  badge-positive:
    backgroundColor: "{colors.positive.soft}"
    textColor: "{colors.positive.DEFAULT}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  badge-warning:
    backgroundColor: "{colors.warning.soft}"
    textColor: "{colors.warning.DEFAULT}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  badge-danger:
    backgroundColor: "{colors.danger.soft}"
    textColor: "{colors.danger.DEFAULT}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  citation-chip:
    backgroundColor: "{colors.accent.soft}"
    textColor: "{colors.accent.DEFAULT}"
    typography: "{typography.citation}"
    rounded: "{rounded.sm}"
    padding: 1px 6px
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  text-input-focused:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  quota-bar:
    backgroundColor: "{colors.sunken}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    height: 8px
  alert-danger:
    backgroundColor: "{colors.danger.soft}"
    textColor: "{colors.danger.DEFAULT}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  alert-positive:
    backgroundColor: "{colors.positive.soft}"
    textColor: "{colors.positive.DEFAULT}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  top-nav:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    height: 56px
    padding: 0 24px
  pricing-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-card-featured:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
  empty-state:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 24px
  divider:
    backgroundColor: "{colors.line}"
    height: 1px
    width: 100%
  divider-strong:
    backgroundColor: "{colors.line-strong}"
    height: 1px
    width: 100%
  focus-ring:
    backgroundColor: "{colors.accent.ring}"
    rounded: "{rounded.sm}"
    height: 2px
---

## Overview

DocuAsk is a document Q&A tool for Indonesian professionals — legal, HR, academic — who upload PDFs and ask questions in natural language. The interface returns answers with page-level citations so users can trace every claim back to the source.

The visual language communicates **trust through restraint**. A warm off-white canvas (`{colors.canvas}`) stands in for paper stock. Near-black type (`{colors.ink}`) carries all content. A single teal accent (`{colors.accent.DEFAULT}`) marks interactive elements and citation badges. Nothing else competes for attention.

This document specifies the design tokens and component rules for both the marketing site and the workspace app. It does not cover dark mode — the product is light-only by design, matching the office-hours context of its users.

### Why these choices

- **Warm neutrals over pure white.** Indonesian legal and HR professionals read long documents. A warm canvas (`{colors.canvas}` #f7f6f3) reduces glare compared to #ffffff, similar to the off-white paper stock used in local document printing.
- **Teal over indigo.** The previous accent was Tailwind indigo-600 (`#4f46e5`), a default that ships with every Tailwind project. Teal (`{colors.accent.DEFAULT}` #1a7578) is distinctive: it carries associations with research, governance, and trust — without the "generic SaaS" signal of purple-blue.
- **One accent, used sparingly.** Accent appears on primary buttons, citation chips, focus rings, and active sidebar items. Nowhere else. Status colors (positive, warning, danger) handle the rest.
- **No dark mode.** The product serves office-hours professionals reading PDF documents. Dark mode would require a second palette, doubled QA surface, and a color-mapping layer — cost that does not serve the core user.

## Colors

### Canvas & Surface

| Token | Hex | Role |
|-------|-----|------|
| `{colors.canvas}` | #f7f6f3 | Page background. Warm off-white with a slight cream undertone. |
| `{colors.surface}` | #ffffff | Cards, panels, modals. Pure white for content containers. |
| `{colors.sunken}` | #f0eeea | Inset areas: code blocks, input backgrounds, sidebar wells. |

### Borders

| Token | Hex | Role |
|-------|-----|------|
| `{colors.line}` | #e3dfda | Default hairline borders between sections and around cards. |
| `{colors.line-strong}` | #d2cec8 | Emphasized borders: input outlines, dividers that need visibility. |

### Ink

| Token | Hex | Contrast on canvas | Contrast on surface | Role |
|-------|-----|---------------------|---------------------|------|
| `{colors.ink}` | #1a1a1e | 16.05:1 AAA | 17.35:1 AAA | Headings, body text, primary labels. |
| `{colors.muted}` | #64696f | 5.12:1 AA | 5.54:1 AA | Secondary labels, help text, metadata. |

### Accent

| Token | Hex | Role |
|-------|-----|------|
| `{colors.accent.DEFAULT}` | #1a7578 | Primary buttons, links, citation chips, active states. |
| `{colors.accent.hover}` | #146264 | Hovered primary buttons, hovered links. |
| `{colors.accent.soft}` | #e7f4f4 | Tinted backgrounds: active sidebar item, citation chip fill, badge fill. |
| `{colors.accent.ring}` | #a3d5d6 | Focus ring outline (2px, offset 2px). |

White text on `{colors.accent.DEFAULT}` passes AA at 5.44:1. White text on `{colors.accent.hover}` passes AAA at 7.09:1. `{colors.accent.DEFAULT}` on `{colors.accent.soft}` passes AA at 4.83:1.

`{colors.primary}` and `{colors.on-primary}` are semantic aliases: `{colors.primary}` resolves to the same teal as `{colors.accent.DEFAULT}` and is used when describing the primary action role; `{colors.on-primary}` (#ffffff) is the text color that sits on it. Components reference the semantic names; prose may use either.

### Status

| Token | Hex | Soft | Role |
|-------|-----|------|------|
| `{colors.positive.DEFAULT}` | #067647 | #ecfdf3 | Success states, upload complete, active plan badge. |
| `{colors.warning.DEFAULT}` | #b54708 | #fffaeb | Quota approaching limit, pending payment, caution alerts. |
| `{colors.danger.DEFAULT}` | #b42318 | #fef3f2 | Errors, failed uploads, destructive action confirmation. |

Each status DEFAULT passes AA (4.5:1+) on its corresponding soft background.

## Typography

### Font pairing

**Headings: Plus Jakarta Sans** (600–700). A geometric-humanist sans designed by Tokotype, an Indonesian type foundry. It has warmth and character that Inter and Geist lack — appropriate for a product rooted in Indonesian professional context. Tight negative tracking at display sizes gives headings a confident, editorial quality.

**Body: IBM Plex Sans** (400–500). Designed for sustained reading in enterprise interfaces. A neutral-friendly grotesque with generous x-height, clear letter differentiation, and full Latin Extended support for Indonesian diacritics. At 15px/1.6 line-height, it stays legible across long AI-generated answers and document excerpts.

**Monospace: IBM Plex Mono** (400). Used for API keys, code snippets, and technical metadata. Shares the design DNA of the body font for visual coherence.

Both families — Plus Jakarta Sans and IBM Plex — are loaded from Google Fonts as WOFF2 variable files, subset to Latin Extended. Total payload: ~45KB for the three cuts (heading, body, mono).

### Scale

| Token | Size | Weight | Leading | Tracking | Use |
|-------|------|--------|---------|----------|-----|
| `{typography.display}` | 36px | 700 | 1.1 | -0.75px | Landing page hero headline. |
| `{typography.heading-1}` | 28px | 700 | 1.2 | -0.5px | Page titles: "Dasbor akun", "Harga". |
| `{typography.heading-2}` | 22px | 600 | 1.25 | -0.3px | Section headings: "Tiga langkah", pricing card titles. |
| `{typography.heading-3}` | 18px | 600 | 1.3 | -0.1px | Card headings, sidebar section labels. |
| `{typography.body}` | 15px | 400 | 1.6 | 0 | Answers, descriptions, long-form content. |
| `{typography.body-sm}` | 13px | 400 | 1.5 | 0 | Metadata, table cells, secondary descriptions. |
| `{typography.button}` | 14px | 500 | 1.2 | 0 | Button labels, nav links. |
| `{typography.caption}` | 12px | 400 | 1.4 | 0 | Badges, timestamps, footnotes. |
| `{typography.citation}` | 12px | 600 | 1.4 | 0 | Citation chips and superscript markers. |
| `{typography.mono}` | 13px | 400 | 1.5 | 0 | API keys, code blocks, chunk counts. |

Tracking pulls negative only above 18px. Body and below stay at 0.

## Layout

### Workspace (app page)

The workspace is a two-panel layout: a document sidebar (320px, left) and the conversation area (fluid, right). On screens below `lg` (1024px), the sidebar collapses and the conversation takes full width.

- **Sidebar:** `{colors.surface}` background, `{colors.line}` right border. Document list with upload dropzone at top. Active document gets `{colors.accent.soft}` background + `{colors.accent.DEFAULT}` text.
- **Conversation:** `{colors.canvas}` background. Messages stack vertically. User messages align right with `{colors.sunken}` bubble. Assistant messages align left, no bubble — text sits directly on canvas for a reading-column feel.
- **Max content width:** 720px for the message column. Answers with citations should not force horizontal eye movement.

### Marketing (site pages)

Single-column, centered layout. Max content width 960px. Section gaps use `{spacing.section}` (64px). The hero is a two-column split: copy left, live product sample card right (not a screenshot, not a mockup — the actual data structure rendered as it appears in the app).

### Spacing base

8px base unit. All spacing tokens are multiples of 4px. Card interiors use `{spacing.lg}` (24px). Inline gaps (icon-to-label, badge padding) use `{spacing.xs}` (8px).

## Elevation

Two shadow levels only.

| Token | Use |
|-------|-----|
| `{elevation.card}` | Cards, panels, dropdowns at rest. Barely visible — a 1–3px blur with 4–6% opacity. |
| `{elevation.pop}` | Popovers, tooltips, modals. Wider spread (24px) at 14% opacity. |

No third level. No colored shadows. No glow. If a surface needs more prominence, use a border (`{colors.line-strong}`) or a background shift (`{colors.sunken}`), not a heavier shadow.

## Shapes

### Border radius

| Token | Value | Use |
|-------|-------|-----|
| `{rounded.sm}` | 6px | Citation chips, small inline elements. |
| `{rounded.md}` | 8px | Buttons, inputs, dropdowns. |
| `{rounded.lg}` | 12px | Cards, panels, modals, alerts. |
| `{rounded.xl}` | 16px | Hero product sample card, featured pricing card. |
| `{rounded.pill}` | 9999px | Badges, quota bars, plan pills. |

Pill radius is reserved for small status indicators (badges, pills) that contain 1–3 words. Buttons, cards, and inputs never use pill — they get `{rounded.md}` or `{rounded.lg}`.

## Components

### Buttons

Four variants. Size is controlled by padding, not by a separate token — `{components.button-primary}` defines the default (medium).

| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| Primary | `{colors.primary}` | `{colors.on-primary}` | none | The single call-to-action per screen section. "Coba gratis", "Unggah PDF", "Kirim". |
| Secondary | `{colors.surface}` | `{colors.ink}` | `{colors.line-strong}` 1px | Paired beside primary or standalone neutral actions. "Buka aplikasi", "Batal". |
| Ghost | `{colors.canvas}` | `{colors.muted}` | none | Tertiary actions, nav links, icon-only buttons. |
| Danger | `{colors.surface}` | `{colors.danger.DEFAULT}` | `{colors.line-strong}` 1px | Destructive confirmations. "Hapus dokumen". |

Disabled state: `opacity: 0.5`, `cursor: not-allowed`. No separate disabled color.

Focus state: 2px outline using `{colors.accent.ring}`, 2px offset. Applies to all interactive elements.

### Citation chips

The signature interaction. When the AI answers a question, claims are tagged with superscript numbers `[1]`, `[2]` that link to source pages. Below the answer, a source list shows document name + page number for each reference.

The chip uses `{components.citation-chip}`: `{colors.accent.soft}` background, `{colors.accent.DEFAULT}` text, `{rounded.sm}` corners, `{typography.citation}` (12px / 600). On hover, background shifts to `{colors.accent.ring}` for a visible response without animation.

This follows the progressive-depth citation model: inline chip → source list below answer. No sidebar panel, no popover — the document set is small enough (user's own PDFs) that a flat source list suffices.

### Cards

White surface (`{colors.surface}`) with `{colors.line}` 1px border and `{elevation.card}` shadow. Interior padding `{spacing.lg}` (24px). Radius `{rounded.lg}` (12px).

Featured pricing card gets `{colors.accent.DEFAULT}` 2px border instead of hairline, plus a `{components.badge-accent}` "Direkomendasikan" pill — no glow, no gradient, no background color change.

### Badges

Five tones: neutral, accent, positive, warning, danger. Each uses its soft background + DEFAULT text color. Pill radius. Used for plan labels ("Gratis", "Pro"), status indicators ("Aktif", "Tertunda"), and feature tags.

### Alerts

Bordered rectangles with soft background tint. Left border or full border at 1px using the status DEFAULT color. `{rounded.md}` corners. Used for upload results, payment status, quota warnings.

### Navigation

Top bar at 56px height. Solid `{colors.surface}` background — no backdrop-blur, no transparency. `{colors.line}` bottom border. Logo left, nav links center-right, user avatar and plan badge far right.

The previous header used `backdrop-blur` with 80% opacity. This is removed: solid backgrounds are faster to render and visually quieter for a workspace tool.

### Form inputs

`{colors.surface}` background, `{colors.line-strong}` 1px border, `{rounded.md}` radius. On focus, border shifts to `{colors.accent.DEFAULT}` and a 2px `{colors.accent.ring}` outline appears. Placeholder text uses `{colors.muted}` at 70% opacity.

### Quota bar

Horizontal progress bar at 8px height, `{rounded.pill}` ends. Track is `{colors.sunken}`. Fill is `{colors.accent.DEFAULT}` below 80% usage, shifts to `{colors.warning.DEFAULT}` at 80%+. Label above shows "X / Y" in `{typography.caption}`.

## Do's and Don'ts

### Do

- **Use the teal accent for interactive elements only.** Primary buttons, links, citation chips, focus rings, active states. If a user can click it or it marks a source, it gets teal.
- **Let content breathe.** The 720px message column, 1.6 line-height body text, and 24px card padding exist to keep answers readable. Do not compress them.
- **Show real data.** The landing page sample card renders an actual question-answer pair with numbered citations pointing to specific pages. Product screenshots, when used, show the real interface — not a polished mockup.
- **Use Plus Jakarta Sans for headings, IBM Plex Sans for body.** This pairing was chosen for its Indonesian design heritage and reading comfort. Do not substitute Inter, Geist, or system defaults without updating this spec.
- **Keep the citation model simple.** Inline superscript numbers in the answer text → flat source list below the answer. The user's document set is small (3–50 PDFs). Progressive depth beyond this (popovers, sidebars) is unnecessary complexity.

### Don't

- **Don't add a second chromatic color.** One accent (teal) plus three status colors (green, amber, red) is the full chromatic budget. No purple highlights, no blue info panels, no orange feature callouts.
- **Don't use gradients.** Not on buttons, not on backgrounds, not on hero sections. Flat fills only.
- **Don't use backdrop-blur or glassmorphism.** The header is solid. Modals are solid. No frosted glass, no semi-transparent overlays with blur.
- **Don't add decorative elements.** No background grids, no floating shapes, no sparkle icons, no AI-themed decoration. The product's credibility comes from accurate citations, not visual flair.
- **Don't use pill radius on buttons or cards.** Pill (`{rounded.pill}`) is for badges and progress bars only. Buttons get `{rounded.md}` (8px). Cards get `{rounded.lg}` (12px).
- **Don't add dark mode.** This is a deliberate constraint, not a missing feature. Re-evaluate only if user research shows demand from a significant segment.
- **Don't use emoji in UI copy.** Section headings, button labels, badge text, alert messages — all plain text. Emoji in user-generated content (chat messages) is fine.
- **Don't show confidence percentages.** The product's trust model is citation-based: users verify claims by checking the source page. A "95% confident" label is theater — it cannot be verified and teaches nothing.
