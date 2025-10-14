// src/routes/webhook.routes.js
import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const { type, data } = req.body;

  if (!type) return res.status(400).json({ error: "Falta el tipo de mensaje" });

  switch (type) {
    case "image":
      console.log("📸 Imagen recibida:", data.url);
      break;
    case "status":
      console.log("📊 Estado recibido:", data);
      break;
    default:
      console.log("🔹 Tipo no reconocido:", type);
  }

  res.json({ ok: true });
});

export default router;
