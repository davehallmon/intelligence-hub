import { expect } from "@playwright/test";
import {
  MALICIOUS_ITEM,
  PRIVATE_FEED_SENTINEL,
  PRODUCT_ITEMS,
  rssFixture
} from "./feed-fixtures.js";

export async function installDeterministicNetwork(page, initialScenario = "populated") {
  let scenario = initialScenario;
  const requests = [];

  // Intercept only the external trust boundary. Let the local static server
  // deliver application modules and styles directly; re-continuing every local
  // asset creates avoidable route pressure and can leave navigation waiting on
  // an unrelated same-origin response.
  await page.route(/^https:\/\//, async route => {
    const request = route.request();
    const url = new URL(request.url());
    requests.push({ url: request.url(), method: request.method(), resourceType: request.resourceType() });

    if (url.hostname === "unpkg.com") {
      await route.fulfill({
        status: 200,
        contentType: "text/javascript; charset=utf-8",
        body: "window.lucide={createIcons(){}};"
      });
      return;
    }

    if (request.url() === PRIVATE_FEED_SENTINEL) {
      await route.abort("failed");
      return;
    }

    if (scenario === "error") {
      await route.fulfill({ status: 503, contentType: "text/plain", body: "fixture transport failure" });
      return;
    }

    if (scenario === "delayed-populated") {
      await new Promise(resolve => setTimeout(resolve, 700));
    }

    const items = scenario === "empty"
      ? []
      : scenario === "malicious" ? [MALICIOUS_ITEM] : PRODUCT_ITEMS;
    if (url.hostname === "api.rss2json.com") {
      await route.fulfill({
        status: 200,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({ status: "ok", feed: { title: "Fixture", link: "https://fixtures.example/" }, items: [] })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/rss+xml; charset=utf-8",
      body: rssFixture(items)
    });
  });

  return {
    requests,
    setScenario(next) { scenario = next; }
  };
}

export async function openProductLens(page) {
  await openApplicationRoute(page, "products-platforms");
  await expect(page.locator("body")).toHaveAttribute("data-primary-view", "products-platforms");
  await expect.poll(
    () => page.locator("#productsPlatformsFeed").getAttribute("data-state")
  ).toMatch(/^(?:ready|empty|error)$/);
}

export async function openApplicationRoute(page, route) {
  await page.goto(`/#${route}`, { waitUntil: "domcontentloaded" });
  await expect.poll(
    () => page.evaluate(() => Boolean(window.intelligenceHubV10))
  ).toBe(true);
}

export async function assertNoApplicationConsoleErrors(page) {
  const applicationErrors = [];
  page.on("console", message => {
    if (message.type() === "error") applicationErrors.push(message.text());
  });
  return () => expect(applicationErrors, "application console errors").toEqual([]);
}
