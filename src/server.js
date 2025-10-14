// ===============================
// src/server.js
// ===============================
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import commandsRoutes from './routes/commands.routes.js';
import statusRoutes from './routes/status.routes.js';
import sensorsRoutes from './routes/sensors.routes.js';
import imagesRoutes from './routes/images.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

const app = express();

app.use(cors());
// Aumentamos el límite de tamaño del body para imágenes base64
app.use(express.json({ limit: '20mb' }));
app.use(morgan('dev'));

// Endpoint de verificación
app.get('/health', (_, res) => res.json({ ok: true }));

// ===============================
// RUTAS DE LA API
// ===============================
app.use('/api/robot/command', commandsRoutes);
app.use('/api/sensors/data', sensorsRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/robot/image', imagesRoutes);

// Webhook principal (alineado con la rama del líder)
app.use('/api/webhook', webhookRoutes);

// Compatibilidad temporal por si alguien usa la vieja ruta
app.use('/webhook', webhookRoutes);

// ===============================
app.listen(config.port, () => {
  console.log(`✅ API escuchando en http://localhost:${config.port}`);
});
