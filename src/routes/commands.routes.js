// ===============================
// src/routes/commands.routes.js
// ===============================
import { Router } from 'express';
import axios from 'axios';
import { config } from '../config.js';

const router = Router();

// Base de datos simulada en memoria
const commands = [];

/**
 * POST /api/robot/command
 * Envía un comando al robot, reenviándolo al microservicio BRIDGE
 */
router.post('/', async (req, res) => {
  const { robotId, source, task, value, userId } = req.body;

  if (!task)
    return res.status(400).json({ error: 'El campo "task" es obligatorio.' });

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

  // Reenviar al microservicio bridge (cuando esté disponible)
  try {
    if (config.bridgeUrl) {
      await axios.post(`${config.bridgeUrl}/command`, command);
      console.log(`Comando reenviado al Bridge: ${task}`);
    } else {
      console.log('⚠️ BRIDGE_URL no configurada. Solo simulado localmente.');
    }
  } catch (error) {
    console.error('Error al reenviar al Bridge:', error.message);
  }

  res.json({
    ok: true,
    message: `Comando procesado: ${task}`,
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
