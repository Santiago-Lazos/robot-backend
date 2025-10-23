import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; 
import mongoose from 'mongoose'; 
import { config } from './config.js';
import commandsRoutes from './routes/commands.routes.js';
import statusRoutes from './routes/status.routes.js';
import sensorsRoutes from './routes/sensors.routes.js';
import imagesRoutes from './routes/images.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import streamRoutes from "./routes/stream.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(morgan('dev'));

// Endpoint de verificación

app.get('/health', (_, res) => res.json({ ok: true }));

// Conexion a MongoDB Atlas

async function connectMongo() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB conectado correctamente');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err.message);
  }
}
connectMongo();

// Rutas de la API

app.use('/api/robot/command', commandsRoutes);
app.use('/api/sensors/data', sensorsRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/robot/image', imagesRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/webhook', webhookRoutes);
app.use("/api/stream", streamRoutes);

// ===============================
app.listen(config.port, () => {
  console.log(`✅ API escuchando en http://localhost:${config.port}`);
});
