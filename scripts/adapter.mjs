import { startAdapter } from "./adapter-server.mjs";
const adapter = await startAdapter({
  port: Number(process.env.BYTE_PORT || 8787),
});
console.log(`BYTE · adaptador local en ${adapter.url}`);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await adapter.close();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
