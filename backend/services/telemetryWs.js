'use strict';
/**
 * WebSocket Telemetry Service
 * Broadcasts simulated IoT sensor data every 5 seconds to connected clients.
 * Attach to an existing HTTP server via: telemetryWs.attach(httpServer)
 */
const { WebSocketServer } = require('ws');

let wss = null;
let broadcastInterval = null;

// Simulate smooth sensor drift
function drift(val, min, max, step = 1) {
  const delta = (Math.random() - 0.5) * step * 2;
  return Math.max(min, Math.min(max, parseFloat((val + delta).toFixed(1))));
}

let state = {
  soilMoisture: 62.0,
  temperature: 28.5,
  humidity: 71.0,
  N: 140,
  P: 55,
  K: 98,
  pH: 6.8,
  batteryLevel: 87,
};

function broadcast(data) {
  if (!wss) return;
  const payload = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      try { client.send(payload); } catch {}
    }
  });
}

function attach(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws/telemetry', maxPayload: 4096 });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress || 'unknown';
    console.log('[WS Telemetry] Client connected:', ip);

    if (process.env.ENABLE_TELEMETRY_DEMO !== 'true') {
      ws.send(JSON.stringify({ type: 'unavailable', message: 'No sensor gateway is configured.' }));
      ws.close(1000);
      return;
    }
    // Send explicitly labelled demonstration data
    ws.send(JSON.stringify({ type: 'telemetry', simulated: true, ...state, timestamp: new Date().toISOString() }));

    ws.on('message', (msg) => {
      try {
        const cmd = JSON.parse(msg.toString());
        if (cmd.type === 'ping') ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      } catch {}
    });

    ws.on('close', () => {
      console.log('[WS Telemetry] Client disconnected:', ip);
    });

    ws.on('error', (err) => {
      console.warn('[WS Telemetry] Socket error:', err.message);
    });
  });

  // Broadcast updated telemetry every 5 seconds
  if (broadcastInterval) clearInterval(broadcastInterval);
  broadcastInterval = setInterval(() => {
    state = {
      soilMoisture: drift(state.soilMoisture, 20, 95, 2),
      temperature: drift(state.temperature, 18, 45, 0.5),
      humidity: drift(state.humidity, 30, 95, 2),
      N: Math.max(50, Math.min(200, state.N + Math.round((Math.random() - 0.5) * 4))),
      P: Math.max(20, Math.min(100, state.P + Math.round((Math.random() - 0.5) * 2))),
      K: Math.max(50, Math.min(200, state.K + Math.round((Math.random() - 0.5) * 4))),
      pH: drift(state.pH, 5.0, 8.5, 0.05),
      batteryLevel: Math.max(10, Math.min(100, state.batteryLevel + (Math.random() > 0.8 ? -1 : 0))),
    };
    broadcast({ type: 'telemetry', simulated: true, ...state, timestamp: new Date().toISOString() });
  }, 5000);

  console.log('[WS Telemetry] WebSocket server attached at /ws/telemetry');
}

function close() {
  if (broadcastInterval) { clearInterval(broadcastInterval); broadcastInterval = null; }
  if (wss) { for (const client of wss.clients) client.terminate(); wss.close(); wss = null; }
}

module.exports = { attach, close };
