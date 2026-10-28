import { parseEvent, messages, type ByteState } from "./protocol";
export type Entry = {
  key: number;
  state: ByteState;
  message: string;
  time: number;
  source: "demo" | "external";
};
export type Snapshot = {
  state: ByteState;
  message: string;
  source: "demo" | "external";
  connected: boolean;
  completed: number;
  history: Entry[];
  updated: number;
};
export function createActivityStore() {
  let seq = 0;
  let snap: Snapshot = {
    state: "coding",
    message: messages.coding,
    source: "demo",
    connected: false,
    completed: 0,
    history: [],
    updated: Date.now(),
  };
  const listeners = new Set<() => void>();
  const seen = new Set<string>();
  const emit = () => listeners.forEach((fn) => fn());
  return {
    getSnapshot: () => snap,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    connection(connected: boolean) {
      // A disconnected adapter can no longer claim live activity.
      snap =
        !connected && snap.source === "external"
          ? {
              ...snap,
              connected,
              source: "demo",
              state: "idle",
              message: messages.idle,
              updated: Date.now(),
            }
          : { ...snap, connected };
      emit();
    },
    apply(data: unknown, source: "demo" | "external") {
      const event = parseEvent(data);
      if (!event) return false;
      if (source === "external" && event.id && seen.has(event.id)) return false;
      if (source === "external" && event.id) {
        seen.add(event.id);
        if (seen.size > 1000) seen.delete(seen.values().next().value!);
      }
      const time = Date.now(),
        message = event.message || messages[event.state];
      const completed =
        snap.completed +
        (source === "external" &&
        event.state === "success" &&
        (event.id || snap.state !== "success" || snap.source !== "external")
          ? 1
          : 0);
      snap = {
        ...snap,
        state: event.state,
        message,
        source,
        completed,
        updated: time,
        history: [
          { key: ++seq, state: event.state, message, time, source },
          ...snap.history,
        ].slice(0, 30),
      };
      emit();
      return true;
    },
  };
}
export const activity = createActivityStore();
