import { useEffect, useSyncExternalStore } from "react";
import { activity } from "./store";
export function useActivity() {
  const snapshot = useSyncExternalStore(
    activity.subscribe,
    activity.getSnapshot,
  );
  useEffect(() => {
    let socket: WebSocket | undefined,
      timer: ReturnType<typeof setTimeout>,
      stopped = false;
    function connect() {
      if (stopped) return;
      const endpoint =
        import.meta.env.VITE_BYTE_WS_URL ||
        `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/events`;
      try {
        socket = new WebSocket(endpoint);
        socket.onopen = () => activity.connection(true);
        socket.onmessage = (e) => {
          try {
            activity.apply(JSON.parse(e.data), "external");
          } catch {
            /* Invalid events never reach the renderer. */
          }
        };
        socket.onclose = () => {
          if (!stopped) {
            activity.connection(false);
            timer = setTimeout(connect, 4000);
          }
        };
        socket.onerror = () => socket?.close();
      } catch {
        activity.connection(false);
        timer = setTimeout(connect, 4000);
      }
    }
    connect();
    return () => {
      stopped = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, []);
  return snapshot;
}
