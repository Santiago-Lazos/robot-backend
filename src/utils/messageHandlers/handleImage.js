import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import AWS from 'aws-sdk';
import { config } from '../../config.js';
import { Image } from '../../models/Image.js';
import { decodeQRFromBuffer } from '../../utils/decodeQRFromBuffer.js';
import { analyzeImageWithAI } from '../../utils/analyzeImageWithAI.js';

const TEMP_DIR = path.join(process.cwd(), 'temp');

const s3 = new AWS.S3({
  endpoint: config.r2CdnUrl,
  accessKeyId: config.r2AccessKeyId,
  secretAccessKey: config.r2SecretAccessKey,
  region: 'auto',
  signatureVersion: 'v4'
});

export const handleImage = async (body) => {
  let { base64 } = body;

  let tempFilePath = null;

  try {
    if (!base64) {
      console.error('Falta base64 en el body JSON.');
    }

    // Remover prefijo `data` de la base64 si está presente
    base64 = base64.replace(/^data:\w+\/[-+.\w]+;base64,/, '');

    // Guardar el archivo temporalmente
    tempFilePath = path.join(TEMP_DIR, `image-${Date.now()}`);

    const buffer = Buffer.from(base64, 'base64');
    await fs.promises.writeFile(tempFilePath, buffer);

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
    const fileName = `${type}-${Date.now()}`;

    try {
      await s3
        .putObject({
          Bucket: config.r2BucketName,
          Key: fileName,
          Body: buffer,
          ContentType: 'image/jpeg'
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

    return {
      result: analysisResult,
      type,
      url: publicUrl,
      imageId: image._id
    };
  } catch (error) {
    console.error('❌ Error al procesar la imagen:', error);
    throw error;
  } finally {
    if (tempFilePath) {
      await fs.promises.unlink(tempFilePath).catch(() => {});
    }
  }
};
