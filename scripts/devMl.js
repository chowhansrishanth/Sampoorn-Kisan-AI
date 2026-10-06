/**
 * ============================================================================
 * Sampoorn Kisan AI — ML Service Development Supervisor Script (`devMl.js`)
 * ============================================================================
 * 
 * PURPOSE:
 * This Node.js runner script orchestrates the Python FastAPI Machine Learning
 * microservice (located in `ml_service/`) during local development and testing.
 * 
 * ARCHITECTURE OVERVIEW:
 * - Backend: Node.js / Express API gateway (port 5000)
 * - Frontend: React / Vite SPA dashboard (port 5173)
 * - ML Microservice: FastAPI / Uvicorn (port 8000)
 *   Runs PyTorch MobileNetV2 (Plant Vision), XGBoost (Crop Recommendation),
 *   SHAP/Grad-CAM (Explainable AI), and Multi-Agent Agronomic services.
 * 
 * WHAT THIS SCRIPT DOES:
 * 1. Resolves the local Python Virtual Environment (`.venv`) cross-platform.
 * 2. Verifies that the Python binary exists before attempting to boot.
 * 3. Launches the ASGI server (`uvicorn app:app`) as a child process.
 * 4. Injects model artifact filepaths via environment variables.
 * 5. Binds standard I/O (stdin, stdout, stderr) directly to the parent shell.
 * 6. Gracefully handles process termination (`SIGINT`, `SIGTERM`) to prevent
 *    zombie Python processes holding port 8000.
 * ============================================================================
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Resolve Root and ML Service Directories
// `__dirname` is the current `/scripts` folder, so `..` points to the project root.
const root = path.resolve(__dirname, '..');
const mlDir = path.join(root, 'ml_service');

// 2. Cross-Platform Virtual Environment Binary Resolution
// - Windows stores the executable at `.venv/Scripts/python.exe`
// - POSIX systems (Linux / macOS) store it at `.venv/bin/python`
const python = process.platform === 'win32'
  ? path.join(mlDir, '.venv', 'Scripts', 'python.exe')
  : path.join(mlDir, '.venv', 'bin', 'python');

// 3. Safety Guard: Verify Python Environment Exists
// If developers haven't initialized Python yet, give an actionable guidance message.
if (!fs.existsSync(python)) {
  console.error('\n❌ [devMl.js] ML Virtual Environment is missing!');
  console.error('👉 To setup, run:');
  console.error('   cd ml_service');
  console.error('   python -m venv .venv');
  console.error('   .venv\\Scripts\\activate (Windows) or source .venv/bin/activate (Linux/Mac)');
  console.error('   pip install -r requirements.txt\n');
  process.exit(1);
}

console.log('🚀 [devMl.js] Launching FastAPI ML Engine via Uvicorn...');
console.log(`📁 Working Directory: ${mlDir}`);
console.log(`🐍 Python Runtime:   ${python}`);

// 4. Spawn Uvicorn ASGI Server Child Process
// Executes: python -m uvicorn app:app --host 127.0.0.1 --port 8000
const child = spawn(
  python,
  ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8000'],
  {
    cwd: mlDir,         // Execute from inside `ml_service/`
    stdio: 'inherit',   // Stream logs directly to the developer terminal
    env: {
      ...process.env,
      // Default model checkpoint locations if not overridden in .env:
      CROP_MODEL_PATH: process.env.CROP_MODEL_PATH || path.join(mlDir, 'crop_model.pkl'),
      CROP_LABEL_ENCODER_PATH: process.env.CROP_LABEL_ENCODER_PATH || path.join(mlDir, 'label_encoder.pkl'),
      VISION_MODEL_PATH: process.env.VISION_MODEL_PATH || path.join(mlDir, 'plant_disease_model.pth'),
    },
  }
);

// 5. Lifecycle and Process Signal Handlers
// When Python exits, mirror the exit code back to the shell
child.on('exit', (code) => {
  console.log(`\n🛑 [devMl.js] ML service stopped with exit code: ${code || 0}`);
  process.exit(code || 0);
});

// Forward Ctrl+C (SIGINT) to gracefully shutdown Uvicorn
process.on('SIGINT', () => {
  console.log('\n🛑 [devMl.js] Interrupted (SIGINT). Terminating ML subprocess...');
  child.kill('SIGINT');
});

// Forward termination signal (SIGTERM)
process.on('SIGTERM', () => {
  console.log('\n🛑 [devMl.js] Terminated (SIGTERM). Terminating ML subprocess...');
  child.kill('SIGTERM');
});
