import { Router } from 'express';
import { upload } from '../utils/upload.js';
import { decodeQRFromBuffer } from '../utils/decodeQRFromBuffer.js';
import { config } from '../config.js';
import AWS from 'aws-sdk';
import { Image } from '../models/Image.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { analyzeImageWithAI } from '../utils/analyzeImageWithAI.js';

const router = Router();

const s3 = new AWS.S3({
  endpoint: config.r2CdnUrl,
  accessKeyId: config.r2AccessKeyId,
  secretAccessKey: config.r2SecretAccessKey,
  region: 'auto',
  signatureVersion: 'v4'
});

// SUBIR IMAGEN: Guardar en Cloudflare R2 y registrar en MongoDB
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          'Falta el archivo. Envíe la imagen en el campo image (multipart/form-data).'
      });
    }

    // Sanitizar nombre del archivo
    const safeName = req.file.originalname
      .replace(/\s+/g, '_') // Reemplaza espacios por guiones bajos
      .replace(/[^a-zA-Z0-9._-]/g, ''); // Elimina caracteres problemáticos

    const fileName = `${Date.now()}-${safeName}`;

    await s3
      .putObject({
        Bucket: config.r2BucketName,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      })
      .promise();

    // Construir URL pública
    const publicUrl = `${config.r2PublicUrl}/intercarreras/${encodeURIComponent(
      fileName
    )}`;

    let imageId;
    try {
      const image = await Image.create({
        robotId: new mongoose.Types.ObjectId('68faa22f17d51b1089c1f1d5'), // ID del robot
        url: publicUrl,
        type: 'other',
        description: 'Imagen subida desde /api/images/upload',
        timestamp: new Date()
      });
      console.log('✅ Imagen guardada en MongoDB:', image._id);
      imageId = image._id;
    } catch (dbErr) {
      console.error('❌ Error al guardar en Mongo:', dbErr);
      throw dbErr;
    }

    res.json({
      message: 'Imagen subida correctamente',
      imageId,
      url: publicUrl,
      key: fileName
    });
  } catch (err) {
    res.status(500).json({ message: err.message || String(err) });
  }
});

// OBTENER TODAS LAS IMÁGENES
router.get('/', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message || String(err) });
  }
});

// OBTENER UNA IMAGEN POR ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    const imageObj = image.toObject(); // Convertir el documento a un objeto JS plano
    const { _id, __v, ...rest } = imageObj; // Eliminar atributos innecesarios
    res.json({
      ...rest
    });
  } catch (err) {
    res.status(500).json({ message: err.message || String(err) });
  }
});

// ESCANEAR QR: desde imagen subida por multipart/form-data
router.post('/scan-qr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          'Falta el archivo. Envíe la imagen en el campo image (multipart/form-data).'
      });
    }
    const { buffer } = req.file;
    const result = await decodeQRFromBuffer(buffer);
    res.json({
      result: result.text
    });
  } catch (err) {
    res.status(500).json({ message: err.message || String(err) });
  }
});

// ESCANEAR QR: desde URL
router.post('/scan-qr/url', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url)
      return res.status(400).json({ message: 'Falta url en el body JSON.' });

    const response = await fetch(url);
    if (!response.ok)
      return res.status(400).json({
        message: `No se pudo descargar la imagen (${response.status}).`
      });

    const contentType = response.headers.get('content-type') || '';
    if (
      !/(image\/png|image\/jpeg|image\/jpg|image\/webp|image\/bmp)/.test(
        contentType
      )
    ) {
      return res.status(400).json({
        message: `La URL no parece ser una imagen soportada. content-type: ${contentType}`
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await decodeQRFromBuffer(buffer);
    res.json({ result: result.text });
  } catch (err) {
    res.status(500).json({ message: err.message || String(err) });
  }
});

// ESCANEAR QR: desde base64
router.post('/scan-qr/base64', async (req, res) => {
  try {
    let { base64 } = req.body || {};
    if (!base64)
      return res.status(400).json({ message: 'Falta base64 en el body JSON.' });

    // Remove data URL prefix if present
    base64 = base64.replace(/^data:\w+\/[-+.\w]+;base64,/, '');

    const buffer = Buffer.from(base64, 'base64');
    const result = await decodeQRFromBuffer(buffer);
    res.json({ result: result.text });
  } catch (err) {
    res.status(500).json({ message: err.message || String(err) });
  }
});

// ANALIZAR IMAGEN CON IA
router.post('/ai-analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          'Falta el archivo. Envíe la imagen en el campo image (multipart/form-data).'
      });
    }
    const { buffer } = req.file;
    const result = await analyzeImageWithAI(buffer);
    res.json({
      result: result.text
    });
  } catch (err) {
    res.status(500).json({ message: err.message || String(err) });
  }
});

const TEMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// ANÁLISIS COMPLETO DE IMAGEN
router.post('/analyze', upload.single('image'), async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          'Falta el archivo. Envíe la imagen en el campo image (multipart/form-data).'
      });
    }

    // Guardar el archivo temporalmente
    tempFilePath = req.file
      ? path.join(TEMP_DIR, `${Date.now()}-${req.file.originalname}`)
      : null;
    await fs.promises.writeFile(tempFilePath, req.file.buffer);

    const { buffer } = req.file;
    let type = 'other';
    let analysisResult = null;

    // Intentar escanear QR
    try {
      const qrResult = await decodeQRFromBuffer(buffer);

      if (qrResult?.text) {
        type = 'qr';
        analysisResult = qrResult.text;
        console.log('✅ QR detectado:', analysisResult);
      }
    } catch (qrErr) {
      console.warn('⚠️ No se detectó QR, continuando con análisis IA.');
    }

    // Si no hay QR, analizar con IA
    if (!analysisResult) {
      const aiResult = await analyzeImageWithAI(buffer);
      type = aiResult.type;
      analysisResult = aiResult.text;
      console.log('🤖 Resultado IA:', analysisResult);
    }

    // Subir imagen a Cloudflare R2
    const safeName = req.file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    const fileName = `${Date.now()}-${safeName}`;

    try {
      await s3
        .putObject({
          Bucket: config.r2BucketName,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        })
        .promise();
    } catch (r2Err) {
      console.error('❌ Error subiendo a R2:', r2Err);
      throw new Error('Error subiendo imagen a Cloudflare R2');
    }

    const publicUrl = `${config.r2PublicUrl}/intercarreras/${encodeURIComponent(
      fileName
    )}`;

    // Guardar en MongoDB
    const image = await Image.create({
      robotId: new mongoose.Types.ObjectId('652f8c5e9a3b2f4d6c1a8e9f'), // TODO ID Temporal
      url: publicUrl,
      type,
      description: analysisResult,
      timestamp: new Date()
    });
    console.log('✅ Imagen guardada en MongoDB:', image._id);

    res.json({
      result: analysisResult,
      type,
      url: publicUrl,
      imageId: image._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message || String(err) });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

export default router;
