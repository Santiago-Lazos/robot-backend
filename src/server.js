<<<<<<< HEAD
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { config } from "./config.js";

// Rutas
import commandsRoutes from "./routes/commands.routes.js";
import statusRoutes from "./routes/status.routes.js";
import sensorsRoutes from "./routes/sensors.routes.js";
import imagesRoutes from "./routes/images.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import streamRoutes from "./routes/stream.routes.js";
import logsRoutes from "./routes/logs.routes.js";
=======
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
import streamRoutes from './routes/stream.routes.js';
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

<<<<<<< HEAD
// Health check
app.get("/health", (_, res) => res.json({ ok: true }));

// Conexión a MongoDB Atlas
=======
// Conexion a MongoDB Atlas
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
async function connectMongo() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("✅ MongoDB conectado correctamente");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err.message);
  }
}
connectMongo();

<<<<<<< HEAD
// Rutas principales
app.use("/api/robot/command", commandsRoutes);
app.use("/api/sensors/data", sensorsRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/images", imagesRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/logs", logsRoutes);

// Servidor
=======
// Endpoint base
app.get('/', (req, res) => {
  res.send('🤖 Robot Backend activo y funcionando correctamente 🚀');
});

// Endpoint de verificación
app.get('/health', (_, res) => res.json({ ok: true }));

// Rutas de la API
app.use('/api/robot/command', commandsRoutes);
app.use('/api/sensors/data', sensorsRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/stream', streamRoutes);

>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
app.listen(config.port, () => {
  console.log(`✅ API escuchando en http://localhost:${config.port}`);
});
