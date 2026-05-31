import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifactDir = join(rootDir, "test-artifacts", "ui-smoke");
const apiPort = 8080;

const products = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: `Organic Carrot ${index + 1}`,
  slug: `organic-carrot-${index + 1}`,
  description: "Fresh organic vegetables from certified farms.",
  storageInstructions: "Keep chilled",
  detailedDescription: "Harvested daily and packed with clear origin information.",
  price: 24000 + index * 1000,
  unit: "500gr",
  imageUrl: null,
  isActive: true,
  category: {
    id: 1,
    name: "Vegetables",
    slug: "vegetables",
    parentId: null,
    sortOrder: 0,
  },
  allergens: [],
}));

const categories = [{ id: 1, name: "Vegetables", slug: "vegetables", parentId: null, sortOrder: 0 }];

function corsHeaders(req) {
  return {
    "Access-Control-Allow-Origin": req.headers.origin ?? "http://127.0.0.1",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    Vary: "Origin",
  };
}

function json(req, res, data) {
  res.writeHead(200, {
    ...corsHeaders(req),
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify({ status: 200, message: "OK", data }));
}

function startMockApi() {
  const server = createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        ...corsHeaders(req),
      });
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://127.0.0.1:${apiPort}`);
    if (url.pathname === "/api/v1/products") {
      json(req, res, {
        content: products,
        totalElements: products.length,
        totalPages: 1,
        size: products.length,
        number: 0,
      });
      return;
    }
    if (url.pathname.startsWith("/api/v1/products/")) {
      json(req, res, products[0]);
      return;
    }
    if (url.pathname === "/api/v1/product-categories") {
      json(req, res, categories);
      return;
    }

    json(req, res, null);
  });

  return new Promise((resolveServer) => {
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.warn(`Mock API skipped because port ${apiPort} is already in use.`);
        resolveServer(null);
        return;
      }
      throw error;
    });
    server.listen(apiPort, () => resolveServer(server));
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "google-chrome",
    "chromium",
    "msedge",
  ].filter(Boolean);

  return candidates.find((candidate) => candidate.includes("\\") ? existsSync(candidate) : true);
}

function getFreePort() {
  return new Promise((resolvePort) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
  });
}

async function waitForUrl(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

function startPreview(port) {
  return spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port)], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function startChrome(chromePath, debugPort) {
  const profileDir = join(artifactDir, "chrome-profile");
  rmSync(profileDir, { recursive: true, force: true });
  mkdirSync(profileDir, { recursive: true });

  return spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.consoleErrors = [];
    this.exceptions = [];

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        this.consoleErrors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
      }
      if (message.method === "Runtime.exceptionThrown") {
        this.exceptions.push(message.params.exceptionDetails.text);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolveRequest, rejectRequest) => {
      this.pending.set(id, { resolve: resolveRequest, reject: rejectRequest });
    });
  }

  close() {
    this.ws.close();
  }
}

async function connectCdp(debugPort) {
  await waitForUrl(`http://127.0.0.1:${debugPort}/json/version`);
  const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
  const target = targets.find((item) => item.type === "page");
  if (!target?.webSocketDebuggerUrl) throw new Error("No Chrome page target found.");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener("open", resolveOpen, { once: true });
    ws.addEventListener("error", rejectOpen, { once: true });
  });
  return new CdpClient(ws);
}

async function inspectRoute(client, baseUrl, route, viewport, fileName) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });
  await client.send("Page.navigate", { url: `${baseUrl}${route}` });
  await delay(3500);

  const metrics = await client.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => ({
      title: document.title,
      text: document.body.innerText,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      productLinks: document.querySelectorAll('a[href^="/product/"]').length,
      rootChildren: document.querySelector('#root')?.children.length ?? 0
    }))()`,
  }).then((result) => result.result.value);

  const screenshot = await client.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(artifactDir, fileName), Buffer.from(screenshot.data, "base64"));

  return metrics;
}

async function main() {
  mkdirSync(artifactDir, { recursive: true });

  const chromePath = findChrome();
  if (!chromePath) throw new Error("Chrome/Edge was not found. Set CHROME_PATH to run UI smoke tests.");

  const previewPort = await getFreePort();
  const debugPort = await getFreePort();
  const apiServer = await startMockApi();
  const preview = startPreview(previewPort);
  const chrome = startChrome(chromePath, debugPort);
  const failures = [];

  preview.stderr.on("data", (chunk) => process.stderr.write(chunk));
  chrome.stderr.on("data", () => undefined);

  try {
    const baseUrl = `http://127.0.0.1:${previewPort}`;
    await waitForUrl(baseUrl);
    const client = await connectCdp(debugPort);
    await client.send("Page.enable");
    await client.send("Runtime.enable");

    const checks = [
      { route: "/", viewport: { width: 1440, height: 1000, mobile: false }, file: "home-desktop.png" },
      { route: "/", viewport: { width: 390, height: 844, mobile: true }, file: "home-mobile.png" },
      { route: "/shop", viewport: { width: 390, height: 844, mobile: true }, file: "shop-mobile.png" },
      { route: "/login", viewport: { width: 390, height: 844, mobile: true }, file: "login-mobile.png" },
    ];

    for (const check of checks) {
      const metrics = await inspectRoute(client, baseUrl, check.route, check.viewport, check.file);
      const overflow = metrics.scrollWidth - metrics.clientWidth;
      console.log(`${check.route} ${check.viewport.width}w root=${metrics.rootChildren} products=${metrics.productLinks} overflow=${overflow}`);

      if (!metrics.rootChildren) failures.push(`${check.route} rendered an empty React root`);
      if (check.route !== "/login" && !metrics.text.includes("Organic Mart")) {
        failures.push(`${check.route} is missing the Organic Mart brand text`);
      }
      if (check.route === "/login" && !metrics.text.includes("EMAIL")) {
        failures.push(`${check.route} did not render the login form`);
      }
      if (overflow > 1) failures.push(`${check.route} has horizontal overflow of ${overflow}px at ${check.viewport.width}px`);
      if (apiServer && ["/", "/shop"].includes(check.route) && metrics.productLinks < 1) {
        failures.push(`${check.route} did not render product cards from the mock API`);
      }
    }

    if (client.consoleErrors.length) failures.push(`console.error: ${client.consoleErrors.join(" | ")}`);
    if (client.exceptions.length) failures.push(`JS exceptions: ${client.exceptions.join(" | ")}`);
    client.close();
  } finally {
    preview.kill();
    chrome.kill();
    await new Promise((resolveClose) => apiServer?.close(resolveClose) ?? resolveClose());
  }

  if (failures.length) {
    console.error(failures.map((failure) => `- ${failure}`).join("\n"));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
