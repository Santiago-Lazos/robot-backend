import { Router } from 'express';
import { upload } from '../utils/upload.js';
import { decodeQRFromBuffer } from '../utils/decodeQRFromBuffer.js';

const router = Router();

// TODO Elegir uno de los 3 métodos de escaneo de QR (multipart/form-data, URL, base64)

// Escanea QR desde imagen subida por multipart/form-data
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

// Escanea QR desde URL
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

// Escanea QR desde base64
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

export default router;
