// ===============================
// src/routes/status.routes.js
// ===============================
import { Router } from 'express';
import { bus } from '../mqtt.js';

const router = Router();

// Estado simulado del robot
let lastState = { status: 'unknown', battery: 100, mode: 'manual' };

// Logs simulados
const logs = [];

// Cuando llega un estado desde MQTT
bus.on('state', (s) => {
  lastState = { ...lastState, ...s };
  logs.push({
    _id: logs.length + 1,
    timestamp: new Date(),
    level: 'robot_status',
    robotStatus: s,
  });
});

/**
 * GET /api/status
 * Devuelve el último estado conocido + últimos logs
 */
router.get('/', (req, res) => {
  res.json({
    robot: lastState,
    logs: logs.slice(-10).reverse(), // últimos 10
  });
});

/**
 * GET /api/status/stream
 * Envío en tiempo real (SSE)
 */
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const onState = (s) => res.write(`data: ${JSON.stringify(s)}\n\n`);
  bus.on('state', onState);

  req.on('close', () => bus.off('state', onState));
});

export default router;
