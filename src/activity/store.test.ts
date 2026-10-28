import { describe, expect, it } from "vitest";
import { createActivityStore } from "./store";
import { parseEvent } from "./protocol";
describe("activity events", () => {
  it("rejects unknown states and oversized messages", () => {
    expect(parseEvent({ state: "hacking" })).toBeNull();
    expect(
      parseEvent({ state: "coding", message: "x".repeat(281) }),
    ).toBeNull();
    expect(parseEvent(null)).toBeNull();
    expect(parseEvent({ state: "idle", message: 42 })).toBeNull();
  });
  it("never counts simulation as real work", () => {
    const s = createActivityStore();
    s.apply({ state: "success" }, "demo");
    expect(s.getSnapshot().completed).toBe(0);
    expect(s.getSnapshot().source).toBe("demo");
  });
  it("counts external success once per event ID", () => {
    const s = createActivityStore();
    s.apply({ id: "job-1", state: "success" }, "external");
    s.apply({ id: "job-1", state: "success" }, "external");
    s.apply({ id: "job-2", state: "success" }, "external");
    expect(s.getSnapshot().completed).toBe(2);
    expect(s.getSnapshot().history).toHaveLength(2);
  });
  it("deduplicates repeated success without IDs until a new transition", () => {
    const s = createActivityStore();
    s.apply({ state: "success" }, "external");
    s.apply({ state: "success" }, "external");
    expect(s.getSnapshot().completed).toBe(1);
    s.apply({ state: "coding" }, "external");
    s.apply({ state: "success" }, "external");
    expect(s.getSnapshot().completed).toBe(2);
  });
  it("keeps the renderer unchanged after an invalid event", () => {
    const s = createActivityStore(),
      before = s.getSnapshot();
    expect(s.apply({ state: "invalid" }, "external")).toBe(false);
    expect(s.getSnapshot()).toBe(before);
  });
  it("returns to demo on disconnect and preserves real totals", () => {
    const s = createActivityStore();
    s.connection(true);
    s.apply({ state: "success" }, "external");
    s.connection(false);
    expect(s.getSnapshot()).toMatchObject({
      source: "demo",
      state: "idle",
      completed: 1,
      connected: false,
    });
  });
  it("keeps a bounded activity log", () => {
    const s = createActivityStore();
    for (let i = 0; i < 100; i++)
      s.apply({ state: "coding", message: String(i) }, "demo");
    expect(s.getSnapshot().history).toHaveLength(30);
    expect(s.getSnapshot().history[0].message).toBe("99");
  });
});
