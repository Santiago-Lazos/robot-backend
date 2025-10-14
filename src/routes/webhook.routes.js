// ===============================
// src/routes/webhook.routes.js
// ===============================
import { Router } from "express";

const router = Router();

// Simulación de almacenamiento en Cloudflare
const storedImages = [];

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
      // ===============================
      // 🖼️ Manejo de imágenes
      // ===============================
      case "image": {
        console.log("📸 Imagen recibida desde el Bridge:", data?.url || "(sin URL)");

        // Simular subida a Cloudflare R2
        const simulatedUrl = `https://r2.simulada/intercarreras/foto-${storedImages.length + 1}.jpg`;

        // Guardar la imagen simulada
        storedImages.push({
          _id: storedImages.length + 1,
          robotId: data?.robotId || "robot-demo",
          timestamp: new Date(),
          url: simulatedUrl,
          type: data?.type || "image",
          description: "Imagen procesada correctamente",
        });

        console.log("✅ Imagen guardada en R2 simulada:", simulatedUrl);
        break;
      }

      // ===============================
      // 📊 Estado del robot
      // ===============================
      case "status":
        console.log("📊 Estado del robot actualizado:", data);
        break;

      // ===============================
      // 📡 Lecturas de sensores
      // ===============================
      case "sensor":
        console.log("📡 Datos del sensor recibidos:", data);
        break;

      default:
        console.log("⚠️ Tipo de mensaje desconocido:", type);
    }

    res.json({
      ok: true,
      type,
      totalImagesStored: storedImages.length,
      receivedAt: new Date().toISOString(),
      preview: type === "image" ? storedImages.at(-1) : null,
    });

  } catch (err) {
    console.error("❌ Error procesando webhook:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /webhook/images
 * Devuelve la lista de imágenes simuladas (para pruebas).
 */
router.get("/images", (req, res) => {
  res.json({ total: storedImages.length, images: storedImages });
});

export default router;
