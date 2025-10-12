// ===============================
// src/routes/images.routes.js
// ===============================
import { Router } from 'express';

const router = Router();

// Almacenamiento temporal en memoria
const images = [];

/**
 * POST /api/robot/image
 * Recibe metadatos de una imagen capturada por el robot.
 * Espera que el Bridge ya haya subido la imagen (por ejemplo, a R2)
 * y nos envíe la URL y la clasificación.
 */
router.post('/', (req, res) => {
  const { robotId, url, type, description, timestamp } = req.body;

  // Validaciones mínimas
  if (!robotId) return res.status(400).json({ error: 'robotId es requerido' });
  if (!url) return res.status(400).json({ error: 'url es requerida' });
  if (!['qr', 'sign', 'other'].includes(type || 'other')) {
    return res.status(400).json({ error: 'type debe ser "qr" | "sign" | "other"' });
  }

  const img = {
    _id: images.length + 1,
    robotId,
    url,
    type,                          // "qr" | "sign" | "other"
    description: description || '',// e.g. contenido del QR o "flecha izquierda"
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  };

  images.push(img);

  res.json({
    ok: true,
    message: 'Imagen registrada',
    image: img,
  });
});

/**
 * GET /api/robot/image
 * Lista de imágenes recibidas (en memoria, para verificación).
 */
router.get('/', (_, res) => {
  res.json({ total: images.length, images });
});

export default router;
