// ===============================
// src/routes/webhook.routes.js
// ===============================
import { Router } from "express";
import fs from "fs";
import path from "path";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// -------------------------------
// Configuración Cloudflare R2
// -------------------------------
const r2 = new AWS.S3({
  endpoint: "https://0d63e81dcaee77536f5f59b9e53d54a8.r2.cloudflarestorage.com",
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

const bucketName = process.env.R2_BUCKET_NAME;

// -------------------------------
// Carpeta temporal
// -------------------------------
const tempDir = "./uploads";
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const storedImages = [];

// -------------------------------
// Endpoint principal
// -------------------------------
router.post("/", async (req, res) => {
  const { type, data } = req.body;

  if (!type) return res.status(400).json({ error: "Falta el campo 'type'." });

  try {
    switch (type) {
      // 🖼️ Imagen: puede venir en base64 o buffer
      case "image": {
        let imageBuffer;
        if (data?.base64) {
          const base64Data = data.base64.replace(/^data:image\/\w+;base64,/, "");
          imageBuffer = Buffer.from(base64Data, "base64");
        } else if (data?.buffer) {
          imageBuffer = Buffer.from(data.buffer);
        } else {
          return res.status(400).json({ error: "No se recibió ninguna imagen válida." });
        }

        // Nombre del archivo
        const fileName = `robot_${Date.now()}.jpg`;
        const localPath = path.join(tempDir, fileName);

        // Guardar temporalmente en local
        fs.writeFileSync(localPath, imageBuffer);
        console.log("📸 Imagen guardada localmente:", localPath);

        // Intentar subir a R2 (modo simulado)
        let imageUrl;
        try {
          await r2
            .putObject({
              Bucket: bucketName,
              Key: fileName,
              Body: imageBuffer,
              ContentType: "image/jpeg",
            })
            .promise();

          imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
          console.log("✅ Imagen subida a Cloudflare R2:", imageUrl);
        } catch (uploadErr) {
          console.warn("⚠️ No se pudo subir a R2, se usa imagen local.");
          imageUrl = localPath;
        }

        // Guardar registro
        storedImages.push({
          _id: storedImages.length + 1,
          robotId: data?.robotId || "robot-demo",
          timestamp: new Date(),
          url: imageUrl,
        });

        break;
      }

      // 📊 Estado
      case "status":
        console.log("📊 Estado recibido:", data);
        break;

      // 📡 Sensor
      case "sensor":
        console.log("📡 Sensor recibido:", data);
        break;

      default:
        console.log("⚠️ Tipo desconocido:", type);
    }

    res.json({
      ok: true,
      type,
      totalImagesStored: storedImages.length,
      lastImage: storedImages.at(-1) || null,
    });
  } catch (err) {
    console.error("❌ Error en /webhook:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// -------------------------------
// Ver imágenes simuladas
// -------------------------------
router.get("/images", (req, res) => {
  res.json({ total: storedImages.length, storedImages });
});

export default router;
