import { Router } from "express";
import {
  handleAck,
  handleConnected,
  handleDisconnected,
  handleError,
  handleUnknown,
  handleImage,
  handleObstacle,
} from "../utils/messageHandlers/index.js";

const router = Router();

/**
 * POST /api/webhook
 * Recibe mensajes del Bridge con distintos tipos de eventos del robot.
 */
router.post("/", async (req, res) => {
  const { messageType, content, robotId } = req.body;

  if (!messageType) {
    return res.status(400).json({ error: "Falta el campo 'messageType'." });
  }

  console.log(`📩 Mensaje recibido desde Bridge: ${messageType}`);
  if (robotId) console.log(`🤖 Robot ID: ${robotId}`);

  try {
    switch (messageType) {
      case "ack":
        await handleAck(content);
        break;

      case "connected":
        await handleConnected(robotId);
        break;

      case "disconnected":
        await handleDisconnected(robotId);
        break;

      case "error":
        await handleError(content);
        break;

      case "image":
        await handleImage(req.body);
        break;

      case "obstacle":
        await handleObstacle(req.body);
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
