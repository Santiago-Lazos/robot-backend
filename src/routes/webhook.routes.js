import { Router } from "express";
import {
  handleAck,
  handleConnected,
  handleDisconnected,
  handleError,
  handleUnknown,
} from "../utils/messageHandlers/index.js";

const router = Router();

/**
 * POST /api/webhook
 * Recibe mensajes del Bridge con distintos tipos de eventos del robot.
 */
router.post("/", async (req, res) => {
  const { messageType, content } = req.body;

  if (!messageType) {
    return res.status(400).json({ error: "Falta el campo 'messageType'." });
  }

  if (!content) {
    return res.status(400).json({ error: "Falta el campo 'content'." });
  }

  // Extraer robotId desde content
  const { robotId } = content;

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
        
        await handleError({ ...content, robotId });
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
