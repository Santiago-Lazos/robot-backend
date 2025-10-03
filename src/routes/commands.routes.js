import { Router } from 'express';
import { publishCommand } from '../mqtt.js';
import { commandSchema } from '../libs/validator.js';

const router = Router();

// Envía comando al robot (MQTT)
router.post('/', (req, res) => {
  const parse = commandSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  publishCommand(parse.data.command);
  res.json({ ok: true, sent: parse.data.command });
});

export default router;
