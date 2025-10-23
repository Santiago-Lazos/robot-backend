import { Router } from "express";
import axios from "axios";
import mongoose from "mongoose";
import { config } from "../config.js";
import { commandSchema } from "../libs/validator.js"; // Validación con Zod

const router = Router();

// Base de datos simulada en memoria (temporal)
const commands = [];

/**
 * POST /api/robot/command
 * Envía un comando al robot, reenviándolo al microservicio BRIDGE
 */
router.post("/", async (req, res) => {
  try {
    // Validar el comando usando Zod
    const parsed = commandSchema.parse({ command: req.body.task });

    const { robotId, source, task, value, userId } = req.body;

    const command = {
      _id: new mongoose.Types.ObjectId(),
      robotId: robotId || "robot-demo",
      source: source || "web_rc",
      task: parsed.command, // comando validado
      value: value || null,
      timestamp: new Date(),
      status: "pending",
      userId: userId || null,
    };

    // Guardar en memoria (simulado)
    commands.push(command);

    // Intentar reenviar al Bridge si está configurado
    if (config.bridgeUrl) {
      try {
        await axios.post(`${config.bridgeUrl}/command`, command);
        console.log(`✅ Comando reenviado al Bridge: ${task}`);
        command.status = "sent";
      } catch (bridgeErr) {
        console.warn("⚠️ Error al enviar al Bridge:", bridgeErr.message);
        command.status = "failed";
      }
    } else {
      console.log("⚠️ BRIDGE_URL no configurada. Solo simulado localmente.");
    }

    res.json({
      ok: true,
      message: `Comando procesado: ${task}`,
      command,
    });
  } catch (err) {
    console.error("❌ Error en /api/robot/command:", err);

    if (err.errors) {
      // Error de validación de Zod
      return res.status(400).json({
        ok: false,
        error: "Comando inválido",
        details: err.errors.map((e) => e.message),
      });
    }

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
    commands: commands.slice(-20).reverse(),
  });
});

export default router;
