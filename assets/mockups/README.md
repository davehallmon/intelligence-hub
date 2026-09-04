# PierView / Intelligence Hub visual references

This directory preserves the owner-supplied visual material used during the
v9.1 design exploration. The 26 PNG files were added in PR #48 and were
generated with Gemini during the earlier design process. They are preserved as
design evidence; they are not a pixel-perfect specification.

## Authority and use

The images include exploratory copy, navigation, branding, layouts, and feature
ideas that may have drifted from the ratified product direction. Do not infer a
new requirement from an image alone.

When sources conflict, use this order:

1. ratified configuration and architecture documents;
2. `TECHNICAL_SPEC.md` written behavioral requirements;
3. these visual references for design intent and historical context.

Document a material conflict instead of silently choosing an image over the
written authority. No image in this directory authorizes V10-M10 work.

## Technical-spec reference map

| Technical-spec reference | Repository path(s) | Coverage note |
| --- | --- | --- |
| 1. Global Intelligence Feed mobile concept | [`mobile-my-feed-list.png`](mobile-my-feed-list.png), [`mobile-global-feed-photorealistic.png`](mobile-global-feed-photorealistic.png) | Two exploratory presentations of the mobile feed. |
| 2. State-transition schematic | [`mobile-my-feed-list.png`](mobile-my-feed-list.png), [`mobile-my-feed-loading.png`](mobile-my-feed-loading.png), [`mobile-my-feed-empty.png`](mobile-my-feed-empty.png) | Ready, loading, and empty states are present. No separate original error-state binary was identifiable in the supplied set; the written error/retry requirement in `TECHNICAL_SPEC.md` remains authoritative. |
| 3. Responsive breakpoint blueprint | [`responsive-breakpoint-blueprint.png`](responsive-breakpoint-blueprint.png), [`tablet-my-feed-grid.png`](tablet-my-feed-grid.png), [`desktop-my-feed-sidebar-grid.png`](desktop-my-feed-sidebar-grid.png) | Blueprint plus representative tablet and desktop concepts. |
| 4. Component-level UI kit | [`atomic-component-ui-kit.png`](atomic-component-ui-kit.png) | Typography, color, controls, and component fragments. |
| 5. Interaction and micro-feedback flow | [`interaction-micro-feedback-flow.png`](interaction-micro-feedback-flow.png) | Pull-to-refresh, external/internal opening, update feedback, and reorder concepts. |
| 6. Information architecture / priority zones | [`unified-feed-priority-zone-map.png`](unified-feed-priority-zone-map.png) | Annotated mobile priority-zone concept. |
| 7. Keyboard shortcuts and command palette | [`keyboard-shortcuts-command-palette.png`](keyboard-shortcuts-command-palette.png), [`desktop-command-palette.png`](desktop-command-palette.png) | Interaction schematic and desktop rendering. |
| 8. Persistent multi-pane feed and detail view | [`persistent-multi-pane-feed-detail.png`](persistent-multi-pane-feed-detail.png) | Side-by-side, overlay, and bottom-sheet variants. |
| 9. Hover state and rich preview system | [`hover-rich-preview-system.png`](hover-rich-preview-system.png), [`desktop-hover-preview.png`](desktop-hover-preview.png) | Interaction schematic and desktop rendering. |

## Supporting explorations

These files supplement the nine conceptual references but are not independent
technical requirements.

### Desktop

| Path | What it depicts |
| --- | --- |
| [`desktop-my-feed-grid.png`](desktop-my-feed-grid.png) | Card-grid My Feed without the full sidebar. |
| [`desktop-grid-layout-annotated.png`](desktop-grid-layout-annotated.png) | Grid structure and featured-card span annotations. |
| [`pierview-desktop-design-system-my-feed.png`](pierview-desktop-design-system-my-feed.png) | PierView-branded visual-system board for My Feed. |
| [`pierview-desktop-design-system-communities.png`](pierview-desktop-design-system-communities.png) | PierView-branded visual-system board for a Communities concept. |
| [`pierview-desktop-dashboard-photorealistic.png`](pierview-desktop-dashboard-photorealistic.png) | Photorealistic desktop dashboard presentation. |

### Mobile and tablet

| Path | What it depicts |
| --- | --- |
| [`mobile-sidebar-navigation.png`](mobile-sidebar-navigation.png) | Mobile slide-out navigation. |
| [`mobile-ai-research-watchlist.png`](mobile-ai-research-watchlist.png) | AI Research Watchlist concept. |

### Logo studies

The viewer/robot marks below are color studies only. Their presence does not
declare one of them the approved production logo.

| Path | Variant |
| --- | --- |
| [`logo-viewer-black.png`](logo-viewer-black.png) | Black mark. |
| [`logo-viewer-white.png`](logo-viewer-white.png) | White mark. |
| [`logo-viewer-blue.png`](logo-viewer-blue.png) | Blue mark. |
| [`logo-viewer-red.png`](logo-viewer-red.png) | Red mark. |

## Provenance and preservation

- Source: owner-supplied Gemini outputs committed through PR #48.
- Preservation: renaming changed repository paths only; image blob contents were
  retained byte-for-byte.
- Approval boundary: repository inclusion preserves the historical references;
  it does not approve every depicted detail or make a logo variant canonical.
