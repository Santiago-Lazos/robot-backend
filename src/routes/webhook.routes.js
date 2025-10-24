import { Router } from 'express';
import { handleImage } from '../utils/messageHandlers/handleImage';
import { handleUnknown } from '../utils/messageHandlers/handleUnknown';
import { handleObstacle } from '../utils/messageHandlers/handleObstacle';

const router = Router();

router.post('/', async (req, res) => {
  try {
    res.sendStatus(200);

    const { messageType, robotId } = req.body;

    if (!messageType) {
      console.error('Falta messageType en el body JSON.');
      console.log('Body:', req.body);
      return;
    }

    if (!robotId) {
      console.error('Falta robotId en el body JSON.');
      console.log('Body:', req.body);
      return;
    }

    let result = null;

    switch (messageType) {
      /* case 'ack':
        result = handleAck(req.body);
        break; */
      case 'image':
        result = await handleImage(req.body);
        break;
      case 'obstacle':
        result = await handleObstacle(req.body);
        break;
      /* case 'connected':
        result = handleConnected(req.body);
        break; */
      /* case 'disconnected':
        result = handleDisconnected(req.body);
        break; */
      /* case 'error':
        result = handleError(req.body);
        break; */
      default:
        result = handleUnknown(req.body);
        break;
    }

    console.log('RESULTADO DE WEBHOOK:', result);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

import {
  handleAck,
  handleConnected,
  handleDisconnected,
  handleError,
  handleUnknown,
} from "../utils/messageHandlers/index.js";

/**
 * POST /api/webhook
 * Recibe mensajes del Bridge con distintos tipos de eventos del robot.
 */
router.post("/", async (req, res) => {
  const { messageType, content } = req.body;

  if (!messageType) {
    return res.status(400).json({ error: "Falta el campo 'messageType'." });
  }

  console.log(`📩 Mensaje recibido desde Bridge: ${messageType}`);

  try {
    switch (messageType) {
      case "ack":
        await handleAck(content);
        break;

      case "connected":
        await handleConnected();
        break;

      case "disconnected":
        await handleDisconnected();
        break;

      case "error":
        await handleError(content);
        break;

      default:
        await handleUnknown(req.body);
    }

    res.json({
      ok: true,
      message: `Evento '${messageType}' procesado correctamente.`,
    });
  } catch (err) {
    console.error("❌ Error en webhook:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
