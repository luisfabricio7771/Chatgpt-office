import { test, expect } from "@playwright/test";

test("readable fonts and coherent seated poses at desktop and laptop sizes", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const type = await page.locator(".quote").evaluate((el) => ({
    family: getComputedStyle(el).fontFamily,
    size: parseFloat(getComputedStyle(el).fontSize),
    loaded: [...document.fonts].some(
      (face) =>
        face.family.replace(/["']/g, "") === "DM Sans Variable" &&
        face.status === "loaded",
    ),
  }));
  expect(type.family).toContain("DM Sans Variable");
  expect(type.loaded).toBe(true);
  expect(type.size).toBeGreaterThanOrEqual(14);
  expect(
    await page
      .getByRole("button", { name: "Programando", exact: true })
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(14);
  for (const [label, filename] of [
    ["En calma", "idle"],
    ["Programando", "coding"],
    ["Pensando", "thinking"],
    ["Depurando", "debugging"],
    ["Pausa de café", "break"],
    ["¡Lo logramos!", "success"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("button", { name: "Cerrar diálogo" }).click();
    await page.waitForTimeout(1400);
    await page.screenshot({
      path: `test-results/byte-${filename}.png`,
      fullPage: true,
    });
    await expect(page.locator(".scene > .scene-error")).toHaveCount(0);
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(
    page.getByRole("button", { name: "Pausa de café", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/byte-laptop.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator(".quote")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(14);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
