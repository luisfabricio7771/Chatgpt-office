import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { startAdapter } from "../scripts/adapter-server.mjs";
let directory, adapter;
before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "byte-desktop-test-"));
  const assetsDir = path.join(directory, "dist");
  await mkdir(assetsDir);
  await writeFile(
    path.join(assetsDir, "index.html"),
    "<!doctype html><title>BYTE HQ</title>",
  );
  await writeFile(path.join(assetsDir, "app.js"), 'console.log("BYTE HQ")');
  await writeFile(path.join(directory, "private.txt"), "outside");
  adapter = await startAdapter({ port: 0, assetsDir });
});
after(async () => {
  await adapter?.close();
  await rm(directory, { recursive: true, force: true });
});
test("desktop serves bundled HTML and JavaScript with correct MIME types", async () => {
  const html = await fetch(adapter.url);
  assert.match(html.headers.get("content-type"), /text\/html/);
  assert.match(
    html.headers.get("content-security-policy"),
    /script-src 'self'/,
  );
  assert.match(await html.text(), /BYTE HQ/);
  const js = await fetch(adapter.url + "/app.js");
  assert.match(js.headers.get("content-type"), /text\/javascript/);
  assert.match(await js.text(), /BYTE HQ/);
  const head = await fetch(adapter.url, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});
test("desktop does not expose files outside the bundled assets", async () => {
  const response = await fetch(adapter.url + "/..%2fprivate.txt");
  assert.equal(response.status, 403);
  assert.equal((await fetch(adapter.url + "/missing.js")).status, 404);
});
test("startup detects occupied ports and closing releases the listener", async () => {
  await assert.rejects(startAdapter({ port: adapter.port }), {
    code: "EADDRINUSE",
  });
  const temporary = await startAdapter({ port: 0 });
  const port = temporary.port;
  await temporary.close();
  const replacement = await startAdapter({ port });
  await replacement.close();
});
