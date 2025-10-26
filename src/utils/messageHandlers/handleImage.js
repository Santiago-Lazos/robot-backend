import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import AWS from 'aws-sdk';
import { config } from '../../config.js';
import { Image } from '../../models/Image.js';
import { decodeQRFromBuffer } from '../../utils/decodeQRFromBuffer.js';
import { analyzeImageWithAI } from '../../utils/analyzeImageWithAI.js';
import { notifyClients } from '../../routes/stream.routes.js';
import { sendCommand } from '../sendCommand.js';
import { handleSign } from '../handleSign.js';

const TEMP_DIR = path.join(process.cwd(), 'temp');

// Inicializar cliente S3 para Cloudflare R2
const s3 = new AWS.S3({
  endpoint: config.r2CdnUrl,
  accessKeyId: config.r2AccessKeyId,
  secretAccessKey: config.r2SecretAccessKey,
  region: 'auto',
  signatureVersion: 'v4'
});

export const handleImage = async (body) => {
  const { robotId, content } = body;

  if (!content) {
    return { message: 'Falta content en el body JSON.' };
  }

  let { base64 } = content;

  let tempFilePath = null;

  try {
    if (!base64) {
      return { message: 'Falta base64 en el body JSON.' };
    }

    // Remover prefijo `data:` de la base64 si está presente
    base64 = base64.replace(/^data:\w+\/[-+.\w]+;base64,/, '');

    // 1. Guardar el archivo temporalmente
    tempFilePath = path.join(TEMP_DIR, `image-${Date.now()}.jpg`);
    const buffer = Buffer.from(base64, 'base64');
    await fs.promises.writeFile(tempFilePath, buffer);

    let type = 'other';
    let analysisResult = null;

    // 2.Intentar escanear QR
    try {
      const qrResult = await decodeQRFromBuffer(buffer);

      if (qrResult?.text) {
        type = 'qr';
        analysisResult = qrResult.text.trim();
        console.log('✅ QR detectado:', analysisResult);
      }
    } catch (qrErr) {
      console.warn('⚠️ No se detectó QR, continuando con análisis IA.');
    }

    // 3. Si no hay QR, analizar con IA
    if (!analysisResult) {
      const aiResult = await analyzeImageWithAI(buffer);
      type = aiResult.type || 'other';
      analysisResult = aiResult.text?.trim() || null;
      console.log('🤖 Resultado IA:', analysisResult);
    }

    // 4. Subir imagen a Cloudflare R2
    const fileName = `${type}-${Date.now()}.jpg`;

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
      return { message: 'Error subiendo imagen a Cloudflare R2' };
    }

    const publicUrl = `${config.r2PublicUrl}/intercarreras/${encodeURIComponent(
      fileName
    )}`;

    // 5. Guardar en MongoDB
    const image = await Image.create({
      robotId: new mongoose.Types.ObjectId(robotId),
      url: publicUrl,
      type,
      description: analysisResult,
      timestamp: new Date()
    });

    console.log('✅ Imagen guardada en MongoDB:', image._id);

    // 6. Notificar a los clientes SSE
    notifyClients('new_image', {
      robotId,
      id: image._id,
      timestamp: image.timestamp
    });

    // 7. Enviar instrucciones al robot obtenidas en la imagen (si las hay)
    if (type === 'qr' && analysisResult) {
      try {
        const parsed = JSON.parse(analysisResult);

        const isValidCommand =
          parsed &&
          (Array.isArray(parsed) ||
            (typeof parsed === 'object' && parsed.type && parsed.content));

        if (isValidCommand) {
          console.log('📡 Enviando comando(s) al robot:', parsed);
          await sendCommand(robotId, parsed);
        } else {
          console.warn('⚠️ El QR no contiene un comando válido:', parsed);
        }
      } catch (err) {
        console.warn('⚠️ El QR no es JSON válido:', analysisResult);
      }
    } else if (type === 'sign' && analysisResult) {
      const signData = handleSign(analysisResult);
      if (signData) {
        console.log('📡 Enviando comando (señal) al robot:', signData);
        await sendCommand(robotId, signData);
      }
    }

    return {
      result: analysisResult,
      type,
      url: publicUrl,
      imageId: image._id
    };
  } catch (error) {
    console.error('❌ Error al procesar la imagen:', error);
    return { message: 'Error al procesar la imagen' };
  } finally {
    if (tempFilePath) {
      await fs.promises.unlink(tempFilePath).catch(() => {});
    }
  }
};
