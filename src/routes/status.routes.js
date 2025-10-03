import { Router } from 'express';
import { bus } from '../mqtt.js';
import { Telemetry } from '../models/Telemetry.js';

let lastState = { status: 'unknown' };
bus.on('state', async (s) => {
  lastState = s;
  // opcional: persistir telemetría
  try { await Telemetry.create({ battery: s.battery, action: s.action, payload: s }); } catch {}
});

const router = Router();

// Último estado conocido
router.get('/', (req, res) => {
  res.json({ lastState });
});

// Eventos en tiempo real (SSE)
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const onState = (s) => res.write(`data: ${JSON.stringify(s)}\n\n`);
  bus.on('state', onState);

  req.on('close', () => bus.off('state', onState));
});

export default router;
