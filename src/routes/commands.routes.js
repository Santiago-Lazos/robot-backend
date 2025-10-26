import { Router } from "express";
import mongoose from "mongoose";
import { config } from "../config.js";
import { sendCommand } from "../utils/sendCommand.js"; 

const router = Router();

// Base de datos simulada en memoria (temporal)
const commands = [];

/**
 * POST /api/robot/command
 * Envía un comando al robot, reenviándolo al Bridge (HTTP) o simulando localmente.
 */
router.post("/", async (req, res) => {
  try {
    const { robotId, source, task, value, userId } = req.body;

    // Validación mínima
    if (!task || typeof task !== "string") {
      return res.status(400).json({ error: 'El campo "task" es obligatorio y debe ser texto.' });
    }

    // Crear objeto comando
    const command = {
      _id: new mongoose.Types.ObjectId(),
      robotId: robotId || "robot-demo",
      source: source || "web_rc",
      task,
      value: value || null,
      timestamp: new Date(),
      status: "pending",
      userId: userId || null,
    };

    // Guardar en memoria (simulado)
    commands.push(command);

    // ===========================
    // NUEVO: Usar sendCommand()
    // ===========================
    if (config.bridgeUrl) {
      try {
        await sendCommand(command.robotId, {
          type: "move", 
          content: { direction: command.task, value: command.value },
        });

        console.log(`✅ Comando enviado al Bridge: ${task}`);
        command.status = "sent";
      } catch (bridgeErr) {
        console.warn("⚠️ Error al enviar al Bridge:", bridgeErr.message);
        command.status = "failed";
      }
    } else {
      console.log("⚠️ BRIDGE_URL no configurada. Simulación local.");
    }

    res.json({
      ok: true,
      message: `Comando procesado: ${task}`,
      command,
    });
  } catch (err) {
    console.error("❌ Error en /api/robot/command:", err);
    res.status(500).json({ error: "Error interno al procesar el comando." });
  }
});

/**
 * GET /api/robot/command
 * Devuelve la lista de comandos enviados (simulada)
 */
router.get("/", (_, res) => {
  res.json({
    total: commands.length,
    commands: commands.slice(-20).reverse(), // últimos 20 comandos
  });
});

export default router;
