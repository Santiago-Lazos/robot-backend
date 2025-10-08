// ===============================
// src/routes/status.routes.js
// ===============================
import { Router } from 'express';

const router = Router();

// Estado simulado del robot
let lastState = { status: 'unknown', battery: 100, mode: 'manual' };

// Logs simulados
const logs = [];

/**
 * POST /api/status/update
 * (Será usado por el BRIDGE)
 * Actualiza el estado del robot y guarda un log
 */
router.post('/update', (req, res) => {
  const newState = req.body;
  lastState = { ...lastState, ...newState };
  logs.push({
    _id: logs.length + 1,
    timestamp: new Date(),
    level: 'robot_status',
    robotStatus: newState,
  });

  res.json({ ok: true, message: 'Estado actualizado', state: lastState });
});

/**
 * GET /api/status
 * Devuelve el último estado conocido + últimos logs
 */
router.get('/', (_, res) => {
  res.json({
    robot: lastState,
    logs: logs.slice(-10).reverse(),
  });
});

export default router;
