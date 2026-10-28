import { spawn } from "node:child_process";
const children = [
  spawn(process.execPath, ["scripts/adapter.mjs"], { stdio: "inherit" }),
  spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--host", "0.0.0.0"],
    { stdio: "inherit" },
  ),
];
let closing = false;
function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  children.forEach((p) => p.kill());
  process.exitCode = code;
}
children.forEach((p) => {
  p.on("error", () => shutdown(1));
  p.on("exit", (code) => shutdown(code ?? 1));
});
process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
