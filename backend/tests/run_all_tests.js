'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kisan-tests-'));
process.env.MONGO_URI = 'mongodb://127.0.0.1:1/kisan_test';
process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';
process.env.GEMINI_API_KEY = '';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';
process.env.PYTHON_ML_SERVICE = 'http://127.0.0.1:1';
async function main() {
  const app = require('../server');
  const server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  process.env.TEST_BASE_URL = `http://127.0.0.1:${server.address().port}`;
  const results = [];
  const reports = path.join(__dirname, '../../.audit/test-results');
  fs.mkdirSync(reports, { recursive: true });
  try {
    for (const file of fs.readdirSync(__dirname).filter(name => name.endsWith('.test.js')).sort()) {
      const result = await new Promise(resolve => {
        const child = spawn(process.execPath, [path.join(__dirname, file)], { env: process.env, cwd: path.join(__dirname, '..'), windowsHide: true, stdio: ['ignore','pipe','pipe'] });
        let output = ''; let timedOut = false;
        const timer = setTimeout(() => { timedOut = true; child.kill(); }, Number(process.env.TEST_TIMEOUT_MS || 60000));
        child.stdout.on('data', data => { output += data; });
        child.stderr.on('data', data => { output += data; });
        child.on('error', error => { output += error.message; });
        child.on('close', code => {
          clearTimeout(timer);
          fs.writeFileSync(path.join(reports, file + '.log'), output);
          const skipped=(output.match(/# SKIP|\[SKIP\]|﹣/g)||[]).length;
          resolve({ file, passed: code === 0 && !timedOut, exitCode: code, timedOut, skipped });
        });
      });
      results.push(result);
      console.log(`${result.passed ? 'PASS' : 'FAIL'} ${file}${result.timedOut ? ' (timeout)' : ''}`);
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await require('mongoose').disconnect();
  }
  fs.writeFileSync(path.join(reports, 'summary.json'), JSON.stringify(results, null, 2));
  console.log(`${results.filter(item => item.passed).length}/${results.length} suites passed. Logs: ${reports}`);
  process.exitCode = results.every(item => item.passed) ? 0 : 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
