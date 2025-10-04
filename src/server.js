import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config.js';
import commandsRoutes from './routes/commands.routes.js';
import statusRoutes from './routes/status.routes.js';
import imagesRoutes from './routes/images.routes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/commands', commandsRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/images', imagesRoutes);

async function start() {
  if (config.mongoUri) {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB conectado');
  } else {
    console.log('⚠️  MONGO_URI no configurado. Corriendo sin persistencia.');
  }

  app.listen(config.port, () => {
    console.log(`API escuchando en http://localhost:${config.port}`);
  });
}
start();
