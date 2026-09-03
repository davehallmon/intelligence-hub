import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PIERVIEW_TEST_PORT || 4173);
const host = "127.0.0.1";

const contentTypes = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml"
});

function resolveRequestPath(url = "/") {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const resolved = path.resolve(root, requested);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
}

const server = http.createServer(async (request, response) => {
  const file = resolveRequestPath(request.url);
  if (!file) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const body = await fs.readFile(file);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes[path.extname(file)] || "application/octet-stream"
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    const status = error?.code === "ENOENT" ? 404 : 500;
    response.writeHead(status).end(status === 404 ? "Not found" : "Server error");
  }
});

server.listen(port, host, () => {
  console.log(`PierView test server listening at http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
