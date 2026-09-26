const { spawn } = require("child_process");
const path = require("path");

const fs = require("fs");

const root = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeCommand = "node";

const mlPython = process.platform === "win32"
  ? path.join(root, "ml_service", ".venv", "Scripts", "python.exe")
  : path.join(root, "ml_service", ".venv", "bin", "python");

const serviceConfigs = [
  ...(fs.existsSync(mlPython) ? [{ name: "ml_service", cmd: nodeCommand, args: ["scripts/devMl.js"], cwd: root }] : []),
  { name: "backend", cmd: npmCommand, args: ["run", "dev"], cwd: path.join(root, "backend") },
  { name: "frontend", cmd: npmCommand, args: ["run", "dev"], cwd: path.join(root, "frontend") },
];

let shuttingDown = false;
const processes = serviceConfigs.map(({ name, cmd, args, cwd }) => {
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

  return child;
});
function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
  process.exit(exitCode);
}

process.on("SIGINT", () => stopAll());
process.on("SIGTERM", () => stopAll());
