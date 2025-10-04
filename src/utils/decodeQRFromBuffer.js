import { Jimp } from 'jimp';
import QRReader from 'qrcode-reader';

// Decodificar QR desde un Buffer -> { text, points }
export function decodeQRFromBuffer(buffer) {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await Jimp.read(buffer);
      // Improve contrast for tricky images (optional)
      image.greyscale().contrast(0.3);

      const qr = new QRReader();
      qr.callback = (err, value) => {
        if (err) return reject(err);
        if (!value) return reject(new Error('No se detectó ningún QR.'));
        resolve({ text: value.result, points: value.points || null });
      };
      // qrcode-reader expects a bitmap object from Jimp
      qr.decode(image.bitmap);
    } catch (e) {
      reject(e);
    }
  });
}
