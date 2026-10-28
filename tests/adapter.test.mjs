import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import WebSocket from "ws";
let child, client;
const url = "http://127.0.0.1:18787";
before(async () => {
  child = spawn(process.execPath, ["scripts/adapter.mjs"], {
    env: { ...process.env, BYTE_PORT: "18787" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await Promise.race([
    once(child.stdout, "data"),
    once(child, "exit").then(() => {
      throw new Error("Adapter exited before ready");
    }),
  ]);
  client = new WebSocket("ws://127.0.0.1:18787/events");
  await once(client, "open");
});
after(async () => {
  client?.terminate();
  if (child && child.exitCode === null) {
    const done = once(child, "exit");
    child.kill();
    await done;
  }
});
test("health confirms the service", async () => {
  const r = await fetch(`${url}/health`);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
});
test("HTTP event reaches WebSocket subscribers", async () => {
  const received = once(client, "message");
  const event = { state: "coding", message: "Integration test", id: "test-1" };
  const r = await fetch(`${url}/event`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
  });
  assert.equal(r.status, 202);
  const [data] = await received;
  assert.deepEqual(JSON.parse(data.toString()), event);
});
test("WebSocket publishers broadcast valid events", async () => {
  const received = once(client, "message");
  client.send(JSON.stringify({ state: "thinking", message: "Thinking" }));
  const [data] = await received;
  assert.equal(JSON.parse(data.toString()).state, "thinking");
});
test("invalid events, cross-origin requests and oversized payloads are rejected", async () => {
  for (const [body, expected] of [
    [{ state: "invalid" }, 400],
    [{ state: "coding", message: "x".repeat(5000) }, 413],
  ]) {
    const r = await fetch(`${url}/event`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    assert.equal(r.status, expected);
  }
  const r = await fetch(`${url}/event`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://example.com",
    },
    body: '{"state":"coding"}',
  });
  assert.equal(r.status, 403);
});
