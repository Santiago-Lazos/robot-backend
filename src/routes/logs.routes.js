import { Router } from "express";
import { Log } from "../models/Log.js";

const router = Router();

/**
 * GET /api/logs
 * Devuelve todos los logs guardados (ordenados por fecha descendente)
 */
router.get("/", async (_, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.json({ total: logs.length, logs });
  } catch (error) {
    console.error("❌ Error al obtener logs:", error.message);
    res.status(500).json({ error: "Error interno al obtener los logs." });
  }
});

export default router;
