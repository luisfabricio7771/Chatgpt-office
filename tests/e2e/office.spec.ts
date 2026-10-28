import { test, expect } from "@playwright/test";
test("3D office, controls, preferences and real events", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hay un lugar para tus ideas." }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(3500);
  await page.screenshot({
    path: "test-results/byte-hq-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Pensando", exact: true }).click();
  await expect(page.locator(".status-line strong")).toHaveText("Pensando");
  await expect(page.locator(".mode-pill")).toHaveText("SIMULACIÓN");
  await page
    .getByRole("button", { name: "¡Lo logramos!", exact: true })
    .click();
  await expect(page.locator(".card-footer")).toContainText("0 tareas reales");
  await page.getByRole("button", { name: "Alternar lluvia" }).click();
  await expect(
    page.getByRole("button", { name: "Alternar lluvia" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Alternar lluvia" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Preferencias", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Acercar cámara" }).click();
  await page.getByRole("button", { name: "Restablecer vista" }).click();
  await expect(async () => {
    await request.post("http://127.0.0.1:8787/event", {
      data: {
        state: "coding",
        message: "Evento del navegador",
        id: "e2e-code",
      },
    });
    await expect(page.locator(".mode-pill")).toHaveText("EVENTO REAL", {
      timeout: 2000,
    });
  }).toPass();
  await request.post("http://127.0.0.1:8787/event", {
    data: {
      state: "success",
      message: "Validación completada",
      id: "e2e-success",
    },
  });
  await expect(page.locator(".card-footer")).toContainText("1 tareas reales");
  await page.getByRole("button", { name: "Actividad", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Actividad de BYTE" }),
  ).toContainText("Validación completada");
  await page.getByRole("button", { name: "Cerrar actividad" }).click();
  await page.getByRole("button", { name: "Modo cine" }).click();
  await expect(page.locator(".header")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(page.locator(".header")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/byte-hq-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});

test("objects in the actual 3D scene respond to clicks", async ({ page }) => {
  const { OrthographicCamera, Vector3 } = await import("three");
  await page.goto("/");
  await page.locator("canvas").waitFor();
  await page.waitForTimeout(1500);
  const bounds = (await page.locator("canvas").boundingBox())!;
  const camera = new OrthographicCamera(
    -bounds.width / 2,
    bounds.width / 2,
    bounds.height / 2,
    -bounds.height / 2,
    0.1,
    100,
  );
  camera.position.set(10, 11.5, 12);
  camera.lookAt(0, 1.7, 0);
  camera.zoom = Math.min(bounds.width / 12.5, bounds.height / 9.7);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  async function clickWorld(point: [number, number, number]) {
    const p = new Vector3(...point).project(camera);
    await page.mouse.click(
      bounds.x + ((p.x + 1) / 2) * bounds.width,
      bounds.y + ((1 - p.y) / 2) * bounds.height,
    );
  }
  await clickWorld([-0.35, 2.38, -0.05]);
  await expect(page.locator(".speech")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar diálogo" }).click();
  await clickWorld([-1.5, 2.78, -1.79]);
  await expect(
    page.getByRole("region", { name: "Actividad de BYTE" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar actividad" }).click();
  await clickWorld([1.77, 2.78, -1.62]);
  await expect(
    page.getByRole("button", { name: "Alternar lámpara" }),
  ).toHaveAttribute("aria-pressed", "false");
  await clickWorld([2.14, 3.82, -3.16]);
  await expect(
    page.getByRole("button", { name: "Alternar día y noche" }),
  ).toHaveAttribute("aria-pressed", "false");
});
