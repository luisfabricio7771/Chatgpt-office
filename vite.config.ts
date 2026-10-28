import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: { "/events": { target: "ws://127.0.0.1:8787", ws: true } },
  },
  build: { chunkSizeWarningLimit: 1200 },
  test: { include: ["src/**/*.test.ts"] },
});
