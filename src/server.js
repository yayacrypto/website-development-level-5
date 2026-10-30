import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateQuestion, demoAnswer, liveAnswer, makeRateLimiter } from "./ask.js";

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png" };

export function createServer(env = process.env, fetchImpl = fetch) {
  const config = {
    key: env.AI_API_KEY || "",
    url: env.AI_API_URL || "https://api.openai.com/v1/chat/completions",
    model: env.AI_MODEL || "",
  };
  const live = config.key !== "" && config.model !== "";
  const allow = makeRateLimiter(10, 60_000);

  return http.createServer(async (req, res) => {
    const send = (status, body, type = "application/json") => {
      res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff" });
      res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
    };

    try {
      if (req.method === "POST" && req.url === "/api/ask") {
        if (!allow(req.socket.remoteAddress)) return send(429, { error: "Too many questions. Wait a minute." });

        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          if (raw.length > 5000) return send(413, { error: "Request too large." });
        }
        let body;
        try { body = JSON.parse(raw); } catch { return send(400, { error: "Invalid JSON." }); }

        const checked = validateQuestion(body);
        if (!checked.ok) return send(400, { error: checked.error });

        if (!live) return send(200, { mode: "demo", answer: demoAnswer(checked.question) });
        const answer = await liveAnswer(checked.question, config, fetchImpl);
        return send(200, { mode: "live", answer });
      }

      if (req.method === "GET") {
        const name = req.url === "/" ? "/index.html" : req.url.split("?")[0];
        const file = path.normalize(path.join(publicDir, name));
        // Block paths like /../.env that try to leave the public folder.
        if (!file.startsWith(publicDir + path.sep)) return send(403, "Forbidden", "text/plain");
        const data = await fs.readFile(file);
        return send(200, data, types[path.extname(file)] || "application/octet-stream");
      }

      send(404, "Not found", "text/plain");
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "EISDIR") return send(404, "Not found", "text/plain");
      console.error(error.message);
      send(502, { error: "Something went wrong on the server." });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => console.log("Study Buddy running at http://localhost:" + port));
}
