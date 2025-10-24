import { Router } from 'express';

const router = Router();

// Base simulada de lecturas de sensores
const readings = [];

/**
 * POST /api/sensors/data
 * Recibe datos de sensores (ultrasonic o camera)
 */
router.post('/', (req, res) => {
  const { robotId, type, distance, imageId } = req.body;

  if (!robotId || !type)
    return res.status(400).json({ error: 'Campos requeridos: robotId, type.' });

  if (type !== 'camera' && type !== 'ultrasonic')
    return res.status(400).json({ error: 'El campo type debe ser "camera" o "ultrasonic".' });

  const reading = {
    _id: readings.length + 1,
    robotId,
    type,
    distance: type === 'ultrasonic' ? distance || null : null,
    imageId: type === 'camera' ? imageId || null : null,
    timestamp: new Date(),
  };

  readings.push(reading);

  res.json({
    ok: true,
    message: `Lectura de sensor ${type} registrada.`,
    reading,
  });
});

/**
 * GET /api/sensors/data
 * Devuelve todas las lecturas guardadas (simuladas)
 */
router.get('/', (_, res) => {
  res.json({ total: readings.length, readings });
});

export default router;
