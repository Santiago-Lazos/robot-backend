import multer from 'multer';

// Multer config: memory storage keeps files in RAM (Buffer) so we don't write to disk
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/bmp'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Formato no soportado. Use PNG/JPEG/WebP/BMP.'));
  }
});
