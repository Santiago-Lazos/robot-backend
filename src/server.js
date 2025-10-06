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

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ ok: true }));

// Rutas actualizadas según tareas asignadas
app.use('/api/robot/command', commandsRoutes);
app.use('/api/sensors/data', sensorsRoutes);
app.use('/api/status', statusRoutes);

app.listen(config.port, () => {
  console.log(`✅ API escuchando en http://localhost:${config.port}`);
});
