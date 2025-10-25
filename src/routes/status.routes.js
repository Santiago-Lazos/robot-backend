import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// Estado simulado del robot (por ahora en memoria)
let lastState = { status: "unknown", battery: 100, mode: "manual" };
const logs = [];

/**
 * POST /api/status/update
 * Será usado por el BRIDGE
 * Actualiza el estado del robot y guarda un log.
 */
router.post("/update", async (req, res) => {
  const newState = req.body;

  // Validar formato del body
  if (typeof newState !== "object" || Array.isArray(newState)) {
    return res.status(400).json({ error: "Formato inválido de estado." });
  }

  // Actualizar estado y registrar log
  lastState = { ...lastState, ...newState };
  logs.push({
    _id: new mongoose.Types.ObjectId(),
    timestamp: new Date(),
    level: "robot_status",
    robotStatus: newState,
  });

  console.log("🟢 Estado actualizado:", lastState);

  res.json({
    ok: true,
    message: "Estado del robot actualizado correctamente.",
    state: lastState,
  });
});

/**
 * GET /api/status
 * Devuelve el último estado conocido y los últimos logs.
 */
router.get("/", (_, res) => {
  res.json({
    robot: lastState,
    logs: logs.slice(-10).reverse(), // últimos 10 registros
  });
});

/**
 * GET /api/status/stream
 * Devuelve actualizaciones en tiempo real (SSE).
 * Permite al panel ver los cambios dinámicos sin recargar.
 */
router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();

  const sendState = () => {
    res.write(`data: ${JSON.stringify(lastState)}\n\n`);
  };

  // Enviar estado inicial
  sendState();

  // Simular actualización cada 10 segundos
  const interval = setInterval(sendState, 10000);

  // Limpiar conexión cuando el cliente cierre
  req.on("close", () => clearInterval(interval));
});

export default router;
