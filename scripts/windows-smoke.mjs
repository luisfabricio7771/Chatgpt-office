import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

// Connect to the bundled Electron renderer; no separate browser installation.
const debugUrl = process.env.BYTE_CDP_URL || "http://127.0.0.1:9222";
const baseUrl = process.env.BYTE_SMOKE_URL || "http://127.0.0.1:8787";
let ready = false;
for (let attempt = 0; attempt < 90; attempt++) {
  try {
    const response = await fetch(`${debugUrl}/json/version`);
    if (response.ok && (await fetch(`${baseUrl}/health`)).ok) {
      ready = true;
      break;
    }
  } catch {
    /* Portable extraction and first launch can take a few seconds. */
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
assert.ok(ready, "El ejecutable no inició el servidor y la ventana a tiempo.");
const browser = await chromium.connectOverCDP(debugUrl);
try {
  const context = browser.contexts()[0];
  assert.ok(context, "No hay contexto del renderizador de escritorio.");
  let page;
  for (let attempt = 0; attempt < 30; attempt++) {
    page = context.pages().find((p) => p.url().startsWith(baseUrl));
    if (page) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(page, "La aplicación no cargó la oficina local.");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) =>
    console.log(`[renderer ${message.type()}] ${message.text()}`),
  );
  await page.reload();
  await page.locator("canvas").waitFor({ state: "visible", timeout: 30000 });
  await page
    .locator(".connect-card small")
    .filter({ hasText: "Adaptador local conectado" })
    .waitFor();
  await page.waitForTimeout(1500);
  await mkdir("release", { recursive: true });
  await page.screenshot({ path: "release/windows-smoke.png", fullPage: true });
  console.log(
    "Scene fallback:",
    await page.locator(".scene-error").allTextContents(),
  );
  console.log(
    "WebGL:",
    await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      return gl
        ? {
            version: gl.getParameter(gl.VERSION),
            renderer: gl.getParameter(gl.RENDERER),
          }
        : { available: false };
    }),
  );
  assert.equal(
    await page.locator(".scene-error").count(),
    0,
    "Falló la escena 3D.",
  );
  assert.equal(
    await page.evaluate(() => typeof window.require),
    "undefined",
    "El renderizador no debe tener Node.js.",
  );
  await page.getByRole("button", { name: "Pensando", exact: true }).click();
  assert.equal(await page.locator(".mode-pill").innerText(), "SIMULACIÓN");
  const response = await fetch(`${baseUrl}/event`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: `windows-smoke-${Date.now()}`,
      state: "success",
      message: "Ejecutable comprobado en Windows",
    }),
  });
  assert.equal(response.status, 202);
  await page.locator(".mode-pill").filter({ hasText: "EVENTO REAL" }).waitFor();
  assert.match(
    await page.locator(".card-footer").innerText(),
    /1 tareas reales/,
  );
  await mkdir("release", { recursive: true });
  await page.screenshot({ path: "release/windows-smoke.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "Windows: ejecutable, oficina 3D, aislamiento y eventos verificados.",
  );
} finally {
  // Disconnect CDP; the workflow owns the launched desktop process.
  await browser.close();
}
