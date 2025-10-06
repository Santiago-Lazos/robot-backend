// ===============================
// src/routes/commands.routes.js
// ===============================
import { Router } from 'express';
import { publishCommand } from '../mqtt.js';

const router = Router();

// Base de datos simulada en memoria
const commands = [];

/**
 * POST /api/robot/command
 * Envía un comando al robot por MQTT
 */
router.post('/', (req, res) => {
  const { robotId, source, task, value, userId } = req.body;

  if (!task) return res.status(400).json({ error: 'El campo "task" es obligatorio.' });

  const command = {
    _id: commands.length + 1,
    robotId: robotId || 'robot-demo',
    source: source || 'web_rc',
    task,
    value: value || null,
    timestamp: new Date(),
    status: 'pending',
    userId: userId || null,
  };

  // Guardar en memoria
  commands.push(command);

  // Publicar comando vía MQTT
  publishCommand(command);

  res.json({
    ok: true,
    message: `Comando enviado: ${task}`,
    command,
  });
});

/**
 * GET /api/robot/command
 * Devuelve la lista de comandos enviados (simulada)
 */
router.get('/', (_, res) => {
  res.json({ total: commands.length, commands });
});

export default router;
