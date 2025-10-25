import { Router } from 'express';
import {
  handleAck,
  handleConnected,
  handleDisconnected,
  handleError,
  handleUnknown,
  handleImage,
  handleObstacle
} from '../utils/messageHandlers/index.js';

const router = Router();

/**
 * POST /api/webhook
 * Recibe mensajes del Bridge con distintos tipos de eventos del robot.
 */
router.post('/', async (req, res) => {
  res.sendStatus(200);

  const { messageType, content, robotId } = req.body;

  if (!messageType) {
    console.error('Falta messageType en el body JSON.');
    console.log('Body:', req.body);
    return;
  }

  console.log(`📩 Mensaje recibido desde Bridge: ${messageType}`);
  if (!robotId) {
    console.error('Falta robotId en el body JSON.');
    console.log('Body:', req.body);
    return;
  }

  let result = null;

  try {
    switch (messageType) {
      case 'ack':
        result = handleAck(robotId, content);
        break;

      case 'connected':
        result = handleConnected(robotId);
        break;

      case 'disconnected':
        result = handleDisconnected(robotId);
        break;

      case 'error':
        result = handleError(robotId, content);
        break;

      case 'image':
        result = await handleImage(req.body);
        break;

      case 'obstacle':
        result = await handleObstacle(req.body);
        break;

      default:
        result = handleUnknown(req.body);
    }

    console.log('RESULTADO DE WEBHOOK:', result);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

export default router;
