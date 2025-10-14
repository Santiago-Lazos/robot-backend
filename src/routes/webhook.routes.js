// ===============================
// src/routes/webhook.routes.js
// ===============================
import { Router } from "express";

const router = Router();

/**
 * POST /webhook
 * Recibe mensajes del Bridge y actúa según el tipo de mensaje.
 * Tipos esperados: "image", "status", "sensor"
 */
router.post("/", async (req, res) => {
  const { type, data } = req.body;

  if (!type) {
    return res.status(400).json({ error: "Falta el campo 'type' en el cuerpo del mensaje." });
  }

  try {
    switch (type) {
      case "image":
        console.log("📸 Imagen recibida desde el Bridge:", data?.url || "(sin URL)");
        // En el futuro: subir a Cloudflare y guardar metadatos en Mongo
        break;

      case "status":
        console.log("📊 Estado del robot actualizado:", data);
        // En el futuro: actualizar colección 'robots' o 'logs'
        break;

      case "sensor":
        console.log("📡 Datos del sensor recibidos:", data);
        // En el futuro: guardar lectura en 'readings'
        break;

      default:
        console.log("⚠️ Tipo de mensaje desconocido:", type);
    }

    res.json({ ok: true, type, receivedAt: new Date().toISOString() });

  } catch (err) {
    console.error("❌ Error procesando webhook:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
