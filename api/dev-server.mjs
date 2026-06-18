// Local development server for API routes.
// Starts an HTTP server on port 3001 that handles the same API routes
// Vercel serverless functions would handle in production.
// Run alongside `npx vite` (Vite proxies /api/* to this server).

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

// Load seed data
const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "projects.json"), "utf-8")
);
const research = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "research.json"), "utf-8")
);

function sendJSON(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // GET /api/health
  if (pathname === "/api/health" && req.method === "GET") {
    return sendJSON(res, 200, {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  // GET /api/projects
  if (pathname === "/api/projects" && req.method === "GET") {
    const id = url.searchParams.get("id");
    const year = url.searchParams.get("year");
    let result = projects;
    if (year) result = result.filter((p) => String(p.year) === year);
    if (id) result = result.filter((p) => p.id === id);
    return sendJSON(res, 200, result);
  }

  // GET /api/research
  if (pathname === "/api/research" && req.method === "GET") {
    const id = url.searchParams.get("id");
    const topic = url.searchParams.get("topic");
    let result = research;
    if (topic) {
      result = result.filter((p) =>
        p.topics.some((t) => t.toLowerCase().includes(topic.toLowerCase()))
      );
    }
    if (id) result = result.filter((p) => p.id === id);
    return sendJSON(res, 200, result);
  }

  // POST /api/contact
  if (pathname === "/api/contact" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const { name, email, subject, message } = body;

      const errors = [];
      if (!name || typeof name !== "string" || name.trim().length < 2)
        errors.push("Name is required (min 2 characters)");
      if (!email || typeof email !== "string" || !email.includes("@"))
        errors.push("Valid email is required");
      if (!message || typeof message !== "string" || message.trim().length < 10)
        errors.push("Message is required (min 10 characters)");

      if (errors.length > 0) {
        return sendJSON(res, 400, {
          error: "Validation failed",
          details: errors,
        });
      }

      const submission = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: name.trim(),
        email: email.trim(),
        subject: subject?.trim() || "(no subject)",
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log("[CONTACT]", JSON.stringify(submission, null, 2));
      return sendJSON(res, 200, {
        success: true,
        message: "Message received. I'll get back to you soon!",
      });
    } catch (err) {
      return sendJSON(res, 400, {
        error: "Invalid request body",
        details: [err.message],
      });
    }
  }

  // 404 for unknown API routes
  if (pathname.startsWith("/api")) {
    return sendJSON(res, 404, { error: "Not found" });
  }

  // Non-API routes — let Vite handle them
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`[API Dev Server] http://localhost:${PORT}`);
  console.log(`  Routes:`);
  console.log(`    GET  /api/health`);
  console.log(`    GET  /api/projects`);
  console.log(`    GET  /api/research`);
  console.log(`    POST /api/contact`);
});
