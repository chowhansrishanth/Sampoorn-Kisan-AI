const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\sriva\\.gemini\\antigravity-ide\\brain\\59754ac7-d049-4e07-91cb-4fcac924afdd\\screenshots";

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const ROUTES = [
  { name: "landing", path: "/" },
  { name: "dashboard", path: "/dashboard" },
  { name: "chat", path: "/chat" },
  { name: "disease", path: "/disease" },
  { name: "crop_tool", path: "/crop-tool" },
  { name: "xai", path: "/xai" },
  { name: "knowledge", path: "/knowledge" },
  { name: "benchmarks", path: "/benchmark" }
];

async function runVisualQA() {
  console.log("🚀 Launching Chrome for Comprehensive Visual QA Audit...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  const consoleMessages = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text });
    if (type === "error") {
      console.log(`❌ [CONSOLE ERROR] ${text}`);
    }
  });

  page.on("response", (res) => {
    if (res.status() >= 400) {
      console.log(`🚨 HTTP ${res.status()} ON: ${res.url()}`);
    }
  });

  // 1. Audit Unauthenticated Login Gate First
  console.log("\n🔒 Auditing Unauthenticated Login Gate...");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "login_gate_desktop_dark.png") });

  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  });
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "login_gate_desktop_light.png") });

  await page.setViewport({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "login_gate_mobile_390.png") });

  // 2. Seed Authenticated Farmer Session
  console.log("\n🔑 Seeding Authenticated Farmer Session...");
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("sampoorn_user_session", JSON.stringify({
      user: {
        id: "d1063ab91622b4c83f410a79",
        name: "Srivardhan",
        email: "srivardhan756@gmail.com",
        location: "Warangal, Telangana, India",
        cropType: "Cotton & Chilli",
        farmSizeHectares: 2.5,
        preferredLanguage: "English"
      },
      token: "demo_qa_token_2026",
      savedAt: Date.now()
    }));
  });

  const auditReport = {
    routes: {},
    overflows: [],
    consoleErrors: [],
    themeResults: {}
  };

  for (const route of ROUTES) {
    console.log(`\n🔍 Inspecting Route: ${route.name} (${route.path})`);
    auditReport.routes[route.name] = { errors: [], warnings: [], overflow: {} };

    // Desktop 1440
    await page.setViewport({ width: 1440, height: 900 });
    try {
      await page.goto(`http://localhost:5173${route.path}`, { waitUntil: "networkidle0", timeout: 12000 });
    } catch (e) {
      console.log(`⚠️ Navigation note on ${route.path}: ${e.message}`);
    }

    // Allow lazy load and API states to settle
    await new Promise((r) => setTimeout(r, 800));

    // Dark Mode Desktop
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${route.name}_desktop_dark.png`), fullPage: false });

    // Desktop overflow check
    const overflowDesktop = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    auditReport.routes[route.name].overflow["desktop_1440"] = overflowDesktop;

    // Light Mode Desktop
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${route.name}_desktop_light.png`), fullPage: false });

    // Restore Dark Mode
    await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    });

    // Mobile 390
    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${route.name}_mobile_390.png`), fullPage: false });

    const overflowMobile = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    auditReport.routes[route.name].overflow["mobile_390"] = overflowMobile;

    // Mobile 320
    await page.setViewport({ width: 320, height: 568 });
    await new Promise((r) => setTimeout(r, 200));
    const overflow320 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    auditReport.routes[route.name].overflow["mobile_320"] = overflow320;
    if (overflow320) {
      console.log(`⚠️ Horizontal overflow detected on ${route.name} at 320px!`);
      auditReport.overflows.push({ route: route.name, viewport: 320 });
    }

    // Tablet 768
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, `${route.name}_tablet_768.png`), fullPage: false });
  }

  // 3. Inspect Profile Modal & Support Modal
  console.log("\n👤 Inspecting Profile Modal...");
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173/dashboard", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));

  const profilePill = await page.$(".fk-user-pill");
  if (profilePill) {
    await profilePill.click();
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "profile_modal_desktop.png") });
  }

  auditReport.consoleErrors = consoleMessages.filter((m) => m.type === "error");
  auditReport.pageErrors = pageErrors;

  await browser.close();

  const reportPath = path.join(ARTIFACT_DIR, "audit_summary.json");
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  console.log(`\n✅ Visual QA Audit Complete! Summary written to: ${reportPath}`);
}

runVisualQA().catch((err) => {
  console.error("QA Inspection crashed:", err);
  process.exit(1);
});
