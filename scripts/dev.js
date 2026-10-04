const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const root = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeCommand = "node";

const mlPython = process.platform === "win32"
  ? path.join(root, "ml_service", ".venv", "Scripts", "python.exe")
  : path.join(root, "ml_service", ".venv", "bin", "python");

let shuttingDown = false;
const processes = [];

function spawnProcess(name, cmd, args, cwd) {
  const child = spawn(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code, signal) => {
    if (code && !shuttingDown) {
      console.error(`${name} exited unexpectedly${signal ? ` (${signal})` : ` with code ${code}`}.`);
      stopAll(code);
    }
  });

  processes.push(child);
  return child;
}

function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) {
      if (process.platform === "win32" && child.pid) {
        try {
          spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"]);
        } catch (_) {
          child.kill();
        }
      } else {
        child.kill();
      }
    }
  }
  process.exit(exitCode);
}

process.on("SIGINT", () => stopAll());
process.on("SIGTERM", () => stopAll());

function waitForBackend(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      if (shuttingDown) return resolve(false);
      const req = http.get(url, (res) => {
        res.resume();
        resolve(true);
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          console.warn("\n⚠️ Backend health check timed out. Launching frontend anyway...");
          return resolve(false);
        }
        setTimeout(check, 350);
      });
    };
    check();
  });
}

async function main() {
  if (fs.existsSync(mlPython)) {
    spawnProcess("ml_service", nodeCommand, ["scripts/devMl.js"], root);
  }

  spawnProcess("backend", npmCommand, ["run", "dev"], path.join(root, "backend"));

  console.log("⏳ Initializing backend services before launching frontend...");
  await waitForBackend("http://127.0.0.1:5000/health", 25000);

  if (!shuttingDown) {
    console.log("🚀 Backend is online! Launching Vite frontend...\n");
    spawnProcess("frontend", npmCommand, ["run", "dev"], path.join(root, "frontend"));
  }
}

main().catch((err) => {
  console.error("Startup error:", err);
  stopAll(1);
});
