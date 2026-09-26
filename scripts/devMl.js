const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const mlDir = path.join(root, 'ml_service');
const python = process.platform === 'win32' ? path.join(mlDir, '.venv', 'Scripts', 'python.exe') : path.join(mlDir, '.venv', 'bin', 'python');
if (!fs.existsSync(python)) {
  console.error('ML virtual environment is missing. Create ml_service/.venv and install ml_service/requirements.txt first.');
  process.exit(1);
}
const pythonBin = process.platform === 'win32' ? path.join('.venv', 'Scripts', 'python.exe') : path.join('.venv', 'bin', 'python');
const child = spawn(pythonBin, ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8000'], {
  cwd: mlDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    CROP_MODEL_PATH: process.env.CROP_MODEL_PATH || path.join(mlDir, 'crop_model.pkl'),
    CROP_LABEL_ENCODER_PATH: process.env.CROP_LABEL_ENCODER_PATH || path.join(mlDir, 'label_encoder.pkl'),
    VISION_MODEL_PATH: process.env.VISION_MODEL_PATH || path.join(mlDir, 'plant_disease_model.pth'),
  },
});
child.on('exit', code => process.exit(code || 0));
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
