# v10 Mobile Shell Integration Audit

## Scope

This follow-up integrates the first two visible v10 lenses—Watchlist and People & Organizations—into the existing Phase 4 mobile interaction shell rather than creating duplicate mobile systems.

The governing interaction authority remains `js/phase4.js` for:

- Pull-to-Refresh
- scroll-aware hide-on-scroll bottom controls
- persistent Saved stars
- retry-to-refresh routing

## Starting state

Base: merge commit for PR #27.

Before this change, `phase4.js` already implemented Pull-to-Refresh and scroll-aware bottom controls, but its route gates and card observers only recognized the legacy v9 tabs. Watchlist and People & Organizations therefore had visible v10 UI but did not inherit the complete shared mobile shell.

## Changes

### Shared Pull-to-Refresh

The existing `REFRESHABLE_TABS` set now includes:

- `watchlist`
- `people-organizations`

No second touch gesture handler was added. The existing Phase 4 `triggerRefresh()` path calls the refresh callback already supplied by `dashboard.js`, which already knows how to force-refresh both v10 lenses.

### Scroll-aware bottom controls

The existing bottom-control controller now recognizes both v10 routes.

On mobile (`<= 767px`):

- Watchlist contributes its existing `Topics` disclosure button to the shared bottom bar.
- The Watchlist topic controls become a fixed fly-up above the shared bottom bar and remain collapsed until requested.
- Selecting a Watchlist topic closes the fly-up.
- Navigating away from Watchlist closes the fly-up automatically.
- People & Organizations contributes its existing canonical entity selector to the shared bottom bar.
- The redundant inline People/Organizations selector card is hidden on mobile.

On wider screens:

- the shared bottom bar is not used for these two v10 routes;
- controls are restored to their original inline desktop locations;
- desktop lens behavior is preserved.

### Static Refresh controls

The Watchlist and People & Organizations header Refresh buttons are hidden on mobile because Pull-to-Refresh is now the authoritative touch refresh interaction. Desktop buttons remain available.

### Saved-card integration

The existing Phase 4 Saved observer now recognizes:

- `watchlistFeed`
- `peopleOrganizationsFeed`
- `a.rich-feed-card`

This lets the same persistent Saved-star system decorate v10 rich cards rather than relying only on the older Phase 3 interaction layer.

### Retry routing

The existing error-state retry mapping now recognizes:

- `watchlistFeed -> watchlist`
- `peopleOrganizationsFeed -> people-organizations`

## Boundaries preserved

This integration does not change:

- source URLs or connector behavior;
- canonical item normalization;
- lens selection logic;
- Watchlist taxonomy;
- People/Organization monitoring states;
- source-gap classifications;
- My Feed ranking;
- Focus ranking or Signals;
- Saved storage schema.

It also does not create a new Pull-to-Refresh implementation or a second scroll-direction controller.

## Structural validation

`js/tests/validate-v10-mobile-shell.js` asserts that the shared shell continues to contain:

- both v10 refreshable route IDs;
- both v10 Saved-card containers;
- rich-card Saved decoration;
- retry routing for both lens feeds;
- Watchlist and People/Organization bottom-control handoffs;
- the shared mobile breakpoint;
- Watchlist route-close protection;
- mobile static-refresh suppression.

A full browser execution is still not claimed from the connector environment. Post-merge acceptance should use the live iPhone deployment.

## Live acceptance checklist

On iPhone:

1. Watchlist has no large header Refresh button.
2. Pulling down from the top produces the existing Pull-to-Refresh indicator and refreshes Watchlist.
3. A `Topics` action appears in the shared bottom controls.
4. Scrolling down hides the bottom controls; scrolling up restores them.
5. Tapping `Topics` opens the topic fly-up above the bottom controls.
6. Selecting a topic closes the fly-up and filters the lens.
7. Navigating away while the fly-up is open closes it.
8. People & Organizations has no large header Refresh button.
9. Its `Following` selector appears in the shared bottom controls on mobile.
10. Pull-to-Refresh works on People & Organizations.
11. Saved stars appear and persist on cards in both v10 lenses.
12. Desktop retains inline lens controls.

## Disposition

If the live acceptance checklist passes, the first two visible v10 lenses share one mobile interaction shell and the migration can proceed to Products & Platforms without carrying a parallel-control-system debt forward.
