import { Router } from 'express';
import { handleImage } from '../utils/messageHandlers/handleImage';
import { handleUnknown } from '../utils/messageHandlers/handleUnknown';

const router = Router();

router.post('/', async (req, res) => {
  try {
    res.sendStatus(200);

    const { messageType } = req.body;

    if (!messageType) {
      return console.error('Falta messageType en el body JSON.');
    }

    let result = null;

    switch (messageType) {
      /* case 'ack':
        result = handleAck(req.body);
        break; */
      case 'image':
        result = await handleImage(req.body);
        break;
      /* case 'obstacle':
        result = handleObstacle(req.body);
        break; */
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

export default router;
