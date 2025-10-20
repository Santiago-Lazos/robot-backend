// ===============================
// src/routes/images.routes.js
// ===============================
import { Router } from 'express';
import { Image } from '../models/Image.js';

const router = Router();

/**
 * POST /api/robot/image
 * Guarda los metadatos de una imagen en MongoDB.
 * La imagen ya fue subida a Cloudflare por otro servicio (Bridge o IA).
 */
router.post('/', async (req, res) => {
  try {
    const { robotId, url, type, description, timestamp } = req.body;

    // Validaciones básicas
    if (!robotId) return res.status(400).json({ error: 'robotId es requerido' });
    if (!url) return res.status(400).json({ error: 'url es requerida' });

    // Crear y guardar en MongoDB
    const image = await Image.create({
      robotId,
      url,
      type: type || 'other',
      description: description || '',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    res.json({
      ok: true,
      message: '✅ Imagen registrada en MongoDB',
      image,
    });
  } catch (err) {
    console.error('❌ Error al guardar imagen:', err.message);
    res.status(500).json({ error: 'Error interno al guardar la imagen.' });
  }
});

/**
 * GET /api/robot/image
 * Obtiene todas las imágenes almacenadas en MongoDB.
 */
router.get('/', async (_, res) => {
  try {
    const images = await Image.find().sort({ timestamp: -1 });
    res.json({ total: images.length, images });
  } catch (err) {
    console.error('❌ Error al obtener imágenes:', err.message);
    res.status(500).json({ error: 'Error interno al obtener imágenes.' });
  }
});

export default router;
