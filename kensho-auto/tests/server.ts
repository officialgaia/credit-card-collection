import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";

/** fixtures を配信する簡易サーバー（GET/POST どちらでもファイルを返す） */
export async function startFixtureServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const root = join(import.meta.dirname, "fixtures");
  let port = 0;
  const server: Server = createServer(async (req, res) => {
    req.resume();
    const path = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
    try {
      // __ALT_ORIGIN__ は別ホスト扱いになる http://localhost:<port> に置き換える（外部リンクの模擬）
      const body = (await readFile(join(root, path), "utf8")).replaceAll("__ALT_ORIGIN__", `http://localhost:${port}`).replaceAll("__PORT__", String(port));
      const type = path.endsWith(".xml") ? "application/rss+xml" : path.endsWith(".txt") ? "text/plain" : "text/html";
      res.writeHead(200, { "content-type": `${type}; charset=utf-8` });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end("<p>Not Found</p>");
    }
  });
  await new Promise<void>((r) => server.listen(0, r));
  const addr = server.address();
  port = typeof addr === "object" && addr ? addr.port : 0;
  return { url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(() => r())) };
}
