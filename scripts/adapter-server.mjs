import http from "node:http";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { WebSocketServer, WebSocket } from "ws";
export async function startAdapter({ port = 8787, assetsDir } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new Error("Puerto inválido");
  const assetsRoot = assetsDir ? await realpath(assetsDir) : null;
  const states = new Set([
    "idle",
    "thinking",
    "coding",
    "debugging",
    "success",
    "break",
  ]);
  function valid(e) {
    return (
      e &&
      typeof e === "object" &&
      states.has(e.state) &&
      (e.message === undefined ||
        (typeof e.message === "string" && e.message.length <= 280)) &&
      (e.id === undefined || (typeof e.id === "string" && e.id.length <= 100))
    );
  }
  function allowed(origin) {
    if (!origin) return true;
    try {
      return ["localhost", "127.0.0.1", "[::1]"].includes(
        new URL(origin).hostname,
      );
    } catch {
      return false;
    }
  }
  function publish(raw) {
    let event;
    try {
      event = JSON.parse(raw);
    } catch {
      return false;
    }
    if (!valid(event)) return false;
    const data = JSON.stringify({
      state: event.state,
      message: event.message,
      id: event.id,
    });
    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) c.send(data);
    });
    return true;
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    if (!allowed(req.headers.origin)) {
      res.writeHead(403).end('{"error":"Origen no permitido"}');
      return;
    }
    if (req.method === "GET" && req.url === "/health") {
      res.end('{"ok":true,"service":"byte-hq-adapter"}');
      return;
    }
    if (assetsRoot && ["GET", "HEAD"].includes(req.method)) {
      try {
        const pathname = decodeURIComponent(
          new URL(req.url, "http://localhost").pathname,
        );
        const filename = path.resolve(
          assetsRoot,
          `.${pathname === "/" ? "/index.html" : pathname}`,
        );
        const inside = (p) => p.startsWith(assetsRoot + path.sep);
        if (!inside(filename)) {
          res.writeHead(403).end('{"error":"Ruta no permitida"}');
          return;
        }
        const resolved = await realpath(filename);
        if (!inside(resolved)) {
          res.writeHead(403).end('{"error":"Ruta no permitida"}');
          return;
        }
        const data = await readFile(resolved);
        const types = {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".woff2": "font/woff2",
          ".png": "image/png",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
          ".json": "application/json",
        };
        res.setHeader(
          "Content-Type",
          types[path.extname(resolved)] || "application/octet-stream",
        );
        res.setHeader(
          "Cache-Control",
          path.extname(resolved) === ".html"
            ? "no-store"
            : "public, max-age=31536000, immutable",
        );
        res.end(req.method === "HEAD" ? undefined : data);
        return;
      } catch (error) {
        const status = error instanceof URIError ? 400 : 404;
        res.writeHead(status).end('{"error":"Archivo no disponible"}');
        return;
      }
    }
    if (req.method !== "POST" || req.url !== "/event") {
      res.writeHead(404).end('{"error":"Ruta no encontrada"}');
      return;
    }
    if (!req.headers["content-type"]?.startsWith("application/json")) {
      res.writeHead(415).end('{"error":"Usa application/json"}');
      return;
    }
    let body = "",
      size = 0,
      rejected = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 4096) {
        if (!rejected)
          res.writeHead(413).end('{"error":"Evento demasiado grande"}');
        rejected = true;
      } else body += chunk;
    });
    req.on("end", () => {
      if (rejected) return;
      const ok = publish(body);
      res
        .writeHead(ok ? 202 : 400)
        .end(
          JSON.stringify(
            ok ? { accepted: true } : { error: "Evento inválido" },
          ),
        );
    });
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload: 4096 });
  server.on("upgrade", (req, socket, head) => {
    if (req.url !== "/events" || !allowed(req.headers.origin)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit("connection", ws, req),
    );
  });
  wss.on("connection", (ws) => {
    ws.on("error", () => {});
    ws.on("message", (raw) => {
      if (!publish(raw.toString()))
        ws.send(JSON.stringify({ error: "Evento inválido" }));
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}`,
    port: address.port,
    close: () =>
      new Promise((resolve, reject) => {
        wss.clients.forEach((c) => c.terminate());
        wss.close();
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeIdleConnections();
      }),
  };
}
