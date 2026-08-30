# Technical Design Specifications: Intelligence Hub

**Audience:** GPT-5 Sol / Intelligence Hub implementers  
**Version:** 1.0  
**Adopted:** 2026-08-30  
**Repository:** `davehallmon/intelligence-hub`  
**Deployment:** GitHub Pages — static HTML/CSS/JavaScript

This document governs the UI/interaction refinement phase that begins with v9.1. It is based on the user-supplied Intelligence Hub mockups and technical handoff.

## Repository migration note

The live application predates this design system and already contains working source, profile, ranking, privacy, and Launchpad behavior. Therefore:

- The specification is the target architecture.
- New and materially modified UI components use BEM-style naming.
- `css/variables.css` is the canonical v9.1+ token source. Legacy variables remain as aliases while old styles are migrated.
- Existing selectors/modules may remain temporarily where renaming them would create avoidable runtime risk.
- `js/main.js` is the v9.1 UI-foundation compatibility entry imported by the current dashboard entry. A later cleanup may make it the direct browser entry point.
- No UI work may weaken feed provenance, browser-local privacy, deterministic My Feed ranking, source registry boundaries, or GitHub Pages static deployment.

---

## A. Global constraints and shared assets

### Tech stack

- Semantic HTML5.
- CSS3 only; no preprocessors.
- Vanilla ES6 JavaScript; no framework or jQuery.
- Lucide icons loaded from `https://unpkg.com/lucide@latest` and initialized with `lucide.createIcons()`.
- Static GitHub Pages only: no backend, database, login, server runtime, or mandatory paid API.

### Target file structure

```text
/assets/
  /mockups/
/css/
  variables.css
  style.css
/js/
  main.js
/index.html
/TECHNICAL_SPEC.md
```

The existing application modules and legacy CSS remain during staged migration.

### CSS token requirements

`css/variables.css` must define:

- semantic colors (`--color-primary`, surface, text, border, state colors)
- content-type accents (News, Social, Academic, Research, Video, Books)
- 4/8px spacing scale
- typography tokens
- radii and shadows
- motion durations/easing
- breakpoint constants corresponding to 480 / 768 / 1024 / 1280px

The supplied visual references use the established dark navy/indigo Intelligence Hub language; v9.1 preserves that live-product direction.

### Naming

Use BEM for new/migrated UI components, e.g.:

```css
.card {}
.card__title {}
.card__actions {}
.card--video {}
.state-message {}
.state-message--error {}
.intelligence-feed__header {}
```

---

## B. State-transition schematic

### Objective

Feed containers must communicate loading, ready, empty, and error states without blank screens or avoidable layout shift.

### Required states

- `loading`: skeleton cards with shimmer; container exposes `aria-busy="true"`.
- `ready`: normalized cards render normally.
- `empty`: centered, calm empty-state message.
- `error`: visible failure message with a retry affordance when the feed has a refresh control.

### Accessibility

- Feed/status regions use `aria-live="polite"` where appropriate.
- Loading state uses `aria-busy`.
- Decorative icons are hidden from assistive technology.
- Reduced-motion preferences disable shimmer/transition motion.

---

## C. Responsive breakpoint blueprint

### Breakpoints

- Mobile: `< 480px`
- Tablet: `>= 768px`
- Desktop: `>= 1024px`
- Wide desktop: `>= 1280px`

### Feed grid target

```css
.feed-grid { grid-template-columns: 1fr; }
@media (min-width: 768px)  { .feed-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .feed-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .feed-grid { grid-template-columns: repeat(4, 1fr); } }
```

### Typography

Use fluid sizing where it improves hierarchy, including `clamp()` for major headings and card titles.

### Progressive navigation target

The supplied mockups envision increasingly specialized navigation by viewport (mobile controls, tablet filtering, desktop rail/panes). This is staged after v9.1 rather than introduced simultaneously with the design-token migration.

---

## D. Component-level UI kit

### Card molecule

Core variants:

- `card--bookmark`
- `card--news` / `card--article`
- `card--social`
- `card--academic`
- `card--research`
- `card--video`
- `card--books`

Core elements:

- `card__thumbnail`
- `card__body`
- `card__title`
- `card__excerpt`
- `card__meta`
- later: `card__actions`

Cards should be independently reusable and must not depend on one page layout to look correct.

### Badge atom

Content-type/topic badges use pill geometry, restrained contrast, and type-specific accents. Supported modifiers include:

- `badge--news`
- `badge--social`
- `badge--academic`
- `badge--research`
- `badge--video`
- `badge--books`
- `badge--topic`

### Buttons

Core variants:

- `.button`
- `.button--primary`
- `.button--icon`

Legacy `.btn` remains a compatibility hook during migration.

---

## E. Interaction and micro-feedback flow

### Objective

Make the dashboard feel responsive without introducing hidden behavioral tracking.

Planned behaviors:

- restrained 150–250ms interaction transitions
- toast notification system for relevant local events
- mobile pull-to-refresh behavior
- later micro-feedback for source refresh/new items
- touch/long-press behavior only where it has a clear, reversible action

### Guardrails

- Do not use a global transition rule that creates motion on every DOM property.
- Honor `prefers-reduced-motion`.
- Never silently learn ranking preferences from clicks.

---

## F. Information architecture priority map

### Objective

The visual hierarchy should answer, in order:

1. **What am I looking at / how current is it?**
2. **What deserves immediate attention?**
3. **How do I filter or switch context?**
4. **What else can I explore?**
5. **Where are static/reference tools?**

For My Feed this maps to:

- sticky/anchored Intelligence Feed context
- `Worth your attention` as the highest-signal scanning zone
- feed controls and status
- broader `More for you` exploration
- Launchpad/reference content as a separate destination

UI hierarchy must not change My Feed scoring itself.

---

## G. Keyboard shortcuts and command palette

### Objective

Implement a `Cmd+K` / `Ctrl+K` launcher that can search across:

- Launchpad bookmarks
- feed destinations/actions
- available source/profile/topic navigation targets
- application actions

### Requirements

- dialog semantics with `aria-modal="true"`
- autofocus search input
- Escape dismisses
- Up/Down navigates results
- Enter activates
- focus trap while open
- visible keyboard helper footer

This is an additive post-v9.1 interaction release.

---

## H. Persistent multi-pane layout

### Objective

On desktop (`>=1024px`), allow a selected item to open in a persistent detail pane without losing feed position.

Target behaviors:

- separate feed/detail scroll regions
- explicit close control
- Escape dismisses
- responsive fallback below desktop width uses an overlay/sheet instead of a fixed side pane
- external URL behavior remains explicit; the Hub does not scrape arbitrary article pages to manufacture detail content

---

## I. Hover and rich-preview system

### Objective

Desktop pointer interactions progress through three levels:

1. subtle card lift/visual acknowledgement
2. delayed informational preview where useful
3. optional quick actions such as Save / Share / Dismiss when those actions have defined local semantics

### Requirements

- hover behavior applies only on hover-capable/fine-pointer devices
- preview delay prevents flicker
- viewport positioning guards prevent clipped tooltips
- cards remain clean when not hovered
- keyboard users receive equivalent accessible actions

---

## Implementation order

1. Global constraints, `variables.css`, target file seams.
2. Component-level UI kit.
3. Responsive behavior.
4. Empty/loading/error/ready state system.
5. IA hierarchy / visual weight.
6. Add interactions, command palette, multi-pane detail, and rich hover progressively.

### Release staging

- **v9.1 — UI foundation:** tokens, component layer, responsive feed grid, resilient states, My Feed IA hierarchy.
- **v9.2 — navigation/search:** command palette and responsive navigation/filter refinements.
- **v9.3 — detail/preview:** persistent desktop pane plus responsive sheet/modal and rich previews.
- **v9.4 — micro-feedback:** toast/new-item feedback and carefully validated touch interactions.

Release numbers may be adjusted if a stabilization patch is needed.

---

## Validation gate

Before a UI release is considered complete:

- zero known JavaScript console errors from the application
- no blank feed while an asynchronous request is in progress
- no material layout shift caused solely by state switching
- keyboard navigation remains usable with Tab / Shift+Tab / Enter / Escape as appropriate
- responsive behavior is checked at 390–480px, 768px, 1024px, and 1280px+
- `prefers-reduced-motion` remains respected
- source/provenance/privacy behavior is unchanged unless the release explicitly governs it
- GitHub Pages deployment succeeds

A Pages build proves deployment only; it does not by itself prove every browser-origin remote feed succeeds through CORS/proxy transport.

---

## Mockup reference map

The user supplied nine visual reference images in the design handoff. The conceptual mapping is:

1. Global Intelligence Feed mobile concept
2. State-transition schematic
3. Responsive breakpoint blueprint
4. Component-level UI kit
5. Interaction & micro-feedback flow
6. Information architecture priority map
7. Keyboard shortcuts & command palette
8. Persistent multi-pane layout
9. Hover & rich-preview system

The visual references govern fidelity together with this specification. Where a visual and a written behavior genuinely conflict, the written technical requirement governs and the discrepancy should be documented rather than silently guessed.
