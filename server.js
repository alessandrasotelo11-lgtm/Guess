import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, "src", "main", "resources", "static");
const port = Number.parseInt(process.env.PORT ?? "8080", 10);

const puzzles = [
  { word: "typescript", hint: "The browser language in this project has types." },
  { word: "compiler", hint: "It transforms source code into something runnable." },
  { word: "debugger", hint: "A tool that helps you chase bugs." },
  { word: "variable", hint: "A named place where data lives." },
  { word: "function", hint: "A reusable block of behavior." },
  { word: "frontend", hint: "The part of an app people interact with." },
  { word: "backend", hint: "The service side of a web app." },
  { word: "promise", hint: "A JavaScript object for eventual completion." },
  { word: "algorithm", hint: "A step-by-step way to solve a problem." },
  { word: "hangman", hint: "The classic word game that inspired this app." }
];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (requestUrl.pathname === "/api/word") {
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    response.end(JSON.stringify(puzzle));
    return;
  }

  if (requestUrl.pathname === "/health") {
    response.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("ok");
    return;
  }

  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(staticDir, safePath);

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(file);
  } catch {
    response.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Guess server running on http://localhost:${port}`);
});
