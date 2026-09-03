import { test, expect } from "@playwright/test";

test("NEG-01 deliberate browser regression blocks completion", async ({ page }) => {
  await page.goto("/");
  expect(
    await page.title(),
    "This assertion is intentionally false and must make the browser command exit non-zero."
  ).toBe("Deliberate failure sentinel");
});
