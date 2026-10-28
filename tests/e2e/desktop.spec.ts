import { test, expect } from "@playwright/test";
import { startAdapter } from "../../scripts/adapter-server.mjs";
import path from "node:path";
let adapter: Awaited<ReturnType<typeof startAdapter>>;
test.beforeAll(async () => {
  adapter = await startAdapter({ port: 0, assetsDir: path.resolve("dist") });
});
test.afterAll(async () => {
  await adapter?.close();
});
test("desktop production assets and events run without Vite or external services", async ({
  page,
  request,
}) => {
  const errors: string[] = [],
    remote: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (req) => {
    if (!req.url().startsWith(adapter.url) && !req.url().startsWith("data:"))
      remote.push(req.url());
  });
  await page.goto(adapter.url);
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator(".connect-card small")).toHaveText(
    "Adaptador local conectado",
  );
  const r = await request.post(adapter.url + "/event", {
    data: {
      state: "success",
      id: "desktop-smoke",
      message: "Ejecutable preparado",
    },
  });
  expect(r.status()).toBe(202);
  await expect(page.locator(".mode-pill")).toHaveText("EVENTO REAL");
  await expect(page.locator(".card-footer")).toContainText("1 tareas reales");
  await page.getByRole("button", { name: "Pensando", exact: true }).click();
  await expect(page.locator(".mode-pill")).toHaveText("SIMULACIÓN");
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
});
