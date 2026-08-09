import { createServer } from "node:http";
import { parse } from "node:url";
import nextEnv from "@next/env";
import next from "next";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

import { logger } from "./lib/logger.js";
import { initSocketIO } from "./lib/socket/server.js";

import fs from "node:fs";
import path from "node:path";

const dev = process.env.NODE_ENV !== "production";

if (dev) {
  const devDir = path.join(process.cwd(), ".next", "dev");
  const reqFilesPath = path.join(devDir, "required-server-files.json");
  try {
    if (!fs.existsSync(devDir)) {
      fs.mkdirSync(devDir, { recursive: true });
    }
    if (!fs.existsSync(reqFilesPath)) {
      fs.writeFileSync(
        reqFilesPath,
        JSON.stringify({
          version: 1,
          config: {},
          appDir: process.cwd(),
          files: [],
          ignore: [],
        }),
        "utf8"
      );
    }
  } catch (e) {
    // Ignore FS errors
  }
}

const port = Number.parseInt(process.env.PORT || "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach Socket.IO to HTTP server
  initSocketIO(httpServer);

  httpServer.listen(port, () => {
    logger.info(`> Vouchiqo server ready on http://localhost:${port}`);
  });
});
