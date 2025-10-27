import { Router } from 'express';
import { config } from '../config.js';
import { sendCommand } from '../utils/sendCommand.js';

const router = Router();

let lastCommandTime = null;

/**
 * POST /api/robot/command
 * Envía un comando al robot, pasando por el Bridge (HTTP).
 */
router.post('/', async (req, res) => {
  try {
    if (!config.bridgeUrl) {
      return res.status(500).json({
        error: 'BRIDGE_URL no configurada. No se puede enviar el comando.'
      });
    }

    const { robotId, commandType, content } = req.body;

    // Validaciones
    if (!robotId || !commandType) {
      return res.status(400).json({
        error:
          'Faltan campos obligatorios en el body JSON: robotId o commandType.'
      });
    }

    // Crear objeto comando
    const command = {
      robotId,
      commandType,
      content,
      status: 'pending'
    };

    const now = Date.now();
    if (lastCommandTime) {
      const diff = now - lastCommandTime;
      console.log(`⏱️ Tiempo desde la última petición: ${diff} ms`);
    }

    lastCommandTime = now;

    try {
      await sendCommand(command.robotId, {
        type: command.commandType,
        content: command.content
      });

      command.status = 'sent';
    } catch (bridgeErr) {
      console.warn('⚠️ Error al enviar al Bridge:', bridgeErr.message);
      command.status = 'failed';
    }

    res.json({
      ok: true,
      message: `Comando procesado: ${commandType}`,
      command
    });
  } catch (err) {
    console.error('❌ Error en /api/robot/command:', err);
    res.status(500).json({ error: 'Error interno al procesar el comando.' });
  }
});

export default router;
