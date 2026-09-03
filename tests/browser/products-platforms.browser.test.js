import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

import { PRIVATE_FEED_SENTINEL } from "./feed-fixtures.js";
import {
  assertNoApplicationConsoleErrors,
  installDeterministicNetwork,
  openApplicationRoute,
  openProductLens
} from "./harness.js";

const GEMINI_TITLE = "Introducing Gemini 2.5: a new reasoning model release";
const GENERIC_TITLE = "Researchers compare ChatGPT and students on writing tasks";
const NEAR_MISS_TITLE = "How to observe the Gemini constellation this autumn";

function productFeedText(page, text) {
  return page.locator("#productsPlatformsFeed").getByText(text, { exact: true });
}

async function selectPrimaryTab(page, key, name) {
  const tab = page.locator(`[data-primary-tab="${key}"]`);
  await expect(tab).toBeVisible();
  await expect(tab).toHaveAttribute("role", "tab");
  await expect(tab).toHaveAttribute("aria-label", name);
  await tab.scrollIntoViewIfNeeded();
  // The application changes an in-page read model and never performs a
  // document navigation. A DOM click keeps this assertion independent of
  // feed requests that may still be settling in other, hidden panels.
  await tab.evaluate(button => button.click());
}

test("BROWSER-01 production-shaped Product trace reaches one shared rendered object", async ({ page }) => {
  await installDeterministicNetwork(page);
  const assertNoConsoleErrors = await assertNoApplicationConsoleErrors(page);
  await openProductLens(page);

  const feed = page.locator("#productsPlatformsFeed");
  await expect(feed).toHaveAttribute("data-state", "ready");
  await expect(feed).not.toHaveAttribute("aria-busy", "true");

  const card = page.locator("#productsPlatformsFeed article").filter({ hasText: GEMINI_TITLE }).first();
  await expect(card).toBeVisible();
  await expect(card).toContainText('Product name "Gemini" matched "gemini" in title');
  await expect(card).toContainText("Google DeepMind");

  const externalLink = card.locator("a.rich-feed-card");
  await expect(externalLink).toHaveAttribute("rel", /noopener/);
  await expect(externalLink).toHaveAttribute("rel", /noreferrer/);
  await expect(externalLink).toHaveAttribute("referrerpolicy", "no-referrer");

  const trace = await page.evaluate(title => {
    const snapshot = window.intelligenceHubV10.snapshot();
    const productItem = snapshot.lenses["products-platforms"].items.find(item => item.title === title);
    const peopleItem = snapshot.lenses["people-organizations"].items.find(item => item === productItem);
    const storeEntry = snapshot.store;
    return {
      productEntityIds: productItem?.productEntityIds || [],
      samePeopleReference: Boolean(peopleItem),
      canonicalItems: storeEntry.canonicalItems,
      sourceMemberships: storeEntry.sourceMemberships
    };
  }, GEMINI_TITLE);

  expect(trace.productEntityIds).toContain("product-gemini");
  expect(trace.samePeopleReference).toBe(true);
  expect(trace.canonicalItems).toBeGreaterThan(0);
  expect(trace.sourceMemberships).toBeGreaterThanOrEqual(trace.canonicalItems);
  assertNoConsoleErrors();
});

test("BROWSER-02 ambiguous near miss is rejected while generic matches remain inspectable", async ({ page }) => {
  await installDeterministicNetwork(page);
  await openProductLens(page);

  await expect(productFeedText(page, GENERIC_TITLE)).toHaveCount(0);
  await page.getByLabel("Signal").selectOption("all");
  await expect(productFeedText(page, GENERIC_TITLE)).toBeVisible();
  await expect(productFeedText(page, NEAR_MISS_TITLE)).toHaveCount(0);

  const rejected = await page.evaluate(title => {
    const snapshot = window.intelligenceHubV10.snapshot();
    const stored = Object.values(snapshot.lenses)
      .flatMap(lens => lens.items)
      .find(item => item.title === title);
    const productResult = snapshot.lenses["products-platforms"].items.some(item => item.title === title);
    return { stored: Boolean(stored), productResult };
  }, NEAR_MISS_TITLE);

  expect(rejected).toEqual({ stored: true, productResult: false });
});

test("BROWSER-03 zero-match feeds render a truthful empty state", async ({ page }) => {
  await installDeterministicNetwork(page, "empty");
  await openProductLens(page);

  await expect(page.locator("#productsPlatformsFeed")).toHaveAttribute("data-state", "empty");
  await expect(page.locator("#productsPlatformsFeed .state-message--empty")).toContainText("Nothing to show here yet");
  await expect(page.locator("#productsPlatformsStatus")).toContainText("0 meaningful changes");
  await expect(page.locator("#productsPlatformsFeed .product-lens-card")).toHaveCount(0);
});

test("BROWSER-04 loading transitions to ready and clears busy semantics", async ({ page }) => {
  await installDeterministicNetwork(page, "delayed-populated");
  await page.goto("/#products-platforms");

  await expect(page.locator("#productsPlatformsFeed")).toHaveAttribute("data-state", "loading");
  await expect(page.locator("#productsPlatformsFeed")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#productsPlatformsFeed")).toHaveAttribute("data-state", "ready", { timeout: 15_000 });
  await expect(page.locator("#productsPlatformsFeed")).not.toHaveAttribute("aria-busy", "true");
  await expect(productFeedText(page, GEMINI_TITLE)).toBeVisible();
});

test("BROWSER-05 total transport failure renders error and retry recovers", async ({ page }) => {
  const network = await installDeterministicNetwork(page, "error");
  await page.goto("/#products-platforms");

  const feed = page.locator("#productsPlatformsFeed");
  await expect(feed).toHaveAttribute("data-state", "error");
  await expect(feed.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(page.locator("#productsPlatformsStatus")).toContainText("All configured public sources are unavailable");

  network.setScenario("populated");
  await feed.getByRole("button", { name: "Retry" }).click();
  await expect(feed).toHaveAttribute("data-state", "ready", { timeout: 15_000 });
  await expect(productFeedText(page, GEMINI_TITLE)).toBeVisible();
});

test("BROWSER-06 route history, reload, and keyboard tab semantics remain coherent", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop keyboard-history case");
  await installDeterministicNetwork(page, "empty");
  // Begin on the no-fetch Launchpad route so this navigation contract remains
  // independent of My Feed's asynchronous multi-source startup fan-out.
  await openApplicationRoute(page, "launchpad/destinations");
  await selectPrimaryTab(page, "products-platforms", "Products & Platforms");
  await expect(page).toHaveURL(/#products-platforms$/);
  await selectPrimaryTab(page, "news", "News");
  await expect(page).toHaveURL(/#news$/);

  await page.goBack();
  await expect(page.locator("body")).toHaveAttribute("data-primary-view", "products-platforms");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("tab", { name: "Products & Platforms" })).toHaveAttribute("aria-selected", "true");

  const productTab = page.getByRole("tab", { name: "Products & Platforms" });
  await productTab.focus();
  await productTab.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Bookmarks" })).toHaveAttribute("aria-selected", "true");
  await page.goBack();
  await expect(page.getByRole("tab", { name: "Products & Platforms" })).toHaveAttribute("aria-selected", "true");
});

test("BROWSER-07 Saved state persists across reload without passive ranking mutation", async ({ page }) => {
  await installDeterministicNetwork(page);
  await openProductLens(page);

  const card = page.locator("#productsPlatformsFeed article").filter({ hasText: GEMINI_TITLE }).first();
  const star = card.getByRole("button", { name: "Save for later" });
  await expect(star).toBeVisible();
  await star.click();
  await expect(card.getByRole("button", { name: "Unstar saved item" })).toHaveAttribute("aria-pressed", "true");

  const before = await page.evaluate(() => ({
    saved: localStorage.getItem("intelligenceHub.savedItems.v2"),
    priorities: localStorage.getItem("intelligenceHub.privateSettings.v1")
  }));
  await page.mouse.wheel(0, 600);
  await page.reload();
  await expect(page.locator("#productsPlatformsFeed article").filter({ hasText: GEMINI_TITLE }).first()
    .getByRole("button", { name: "Unstar saved item" })).toHaveAttribute("aria-pressed", "true");
  const after = await page.evaluate(() => ({
    saved: localStorage.getItem("intelligenceHub.savedItems.v2"),
    priorities: localStorage.getItem("intelligenceHub.privateSettings.v1")
  }));
  expect(after).toEqual(before);
});

test("BROWSER-08 private bridge failure remains direct-only and redacted from UI", async ({ page }) => {
  const network = await installDeterministicNetwork(page, "empty");
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify({
      socialProfileFeeds: {
        "person-aravind-srinivas": { url: value, private: true }
      },
      readwiseToken: "",
      rss2jsonApiKey: ""
    }));
  }, { key: "intelligenceHub.privateSettings.v1", value: PRIVATE_FEED_SENTINEL });

  await page.goto("/#socials");
  await expect(page.locator("#socialsFeed")).not.toHaveAttribute("data-state", "loading");

  const requestedUrls = network.requests.map(request => request.url);
  expect(requestedUrls).toContain(PRIVATE_FEED_SENTINEL);
  expect(requestedUrls.some(url => url.startsWith("https://api.rss2json.com/") && url.includes("private"))).toBe(false);
  await expect(page.locator("body")).not.toContainText(PRIVATE_FEED_SENTINEL);
});

test("BROWSER-09 retrieved markup remains non-executable", async ({ page }) => {
  await installDeterministicNetwork(page, "malicious");
  await openProductLens(page);

  const executionState = await page.evaluate(() => ({
    script: Boolean(window.__feedScriptExecuted),
    handler: Boolean(window.__feedHandlerExecuted)
  }));
  expect(executionState).toEqual({ script: false, handler: false });
  await expect(page.locator("#productsPlatformsFeed script")).toHaveCount(0);
  await expect(page.locator("#productsPlatformsFeed [onerror]")).toHaveCount(0);
  await expect(page.locator("#productsPlatformsFeed")).toContainText("Untrusted retrieved instructions remain text.");
});

test("BROWSER-10 Product lens has no detectable WCAG A/AA violations", async ({ page }) => {
  await installDeterministicNetwork(page);
  await openProductLens(page);

  const results = await new AxeBuilder({ page })
    .include("#panel-products-platforms")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("BROWSER-11 mobile navigation and shared Product controls remain usable", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only shared-shell case");
  await installDeterministicNetwork(page, "empty");
  // Exercise the shared mobile shell from a stable no-fetch route; live My Feed
  // readiness remains a separate post-deployment acceptance boundary.
  await openApplicationRoute(page, "launchpad/destinations");

  const menu = page.locator("#menu-toggle");
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-label", "Open navigation");
  await menu.click();
  await selectPrimaryTab(page, "products-platforms", "Products & Platforms");
  await expect(page.locator("body")).toHaveAttribute("data-primary-view", "products-platforms");
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#context-controls-filters #productsPlatformsFilter")).toBeVisible();
  await expect(page.locator("#context-controls-filters #productsPlatformsSignalFilter")).toBeVisible();
  await expect(page.locator("#productsPlatformsRefresh")).toBeHidden();
});
