const express = require('express');
const multer = require('multer');
const path = require('node:path');
const { diagnoseDisease } = require('../controllers/diseaseController');
const router = express.Router();

// The diagnosis screen exposes a few bundled benchmark images. Serve only this
// explicit allowlist so the convenience picker cannot become a file-read route.
const SAMPLE_IMAGES = Object.freeze({
  tomato_early_blight: 'tomato_early_blight.png',
  potato_late_blight: 'potato_late_blight.png',
  corn_common_rust: 'corn_common_rust.png',
  grape_black_rot: 'grape_black_rot.png',
});
const SAMPLE_IMAGE_DIR = path.resolve(__dirname, '../../test_images');

router.get('/samples/:sampleId', (req, res) => {
  const filename = SAMPLE_IMAGES[req.params.sampleId];
  if (!filename) return res.status(404).json({ success: false, error: 'Sample image not found.' });
  return res.set('Cache-Control', 'public, max-age=86400').sendFile(filename, { root: SAMPLE_IMAGE_DIR }, error => {
    if (error && !res.headersSent) res.status(error.statusCode || 500).json({ success: false, error: 'Sample image is unavailable.' });
  });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 2,
    fields: 20,
    fieldSize: 1024 * 1024,
    parts: 30,
  },
  fileFilter(req, file, cb) {
    const rawMime = (file.mimetype || '').split(';')[0].trim().toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/pjpeg',
      'image/png',
      'image/x-png',
      'image/webp',
      'image/bmp',
      'image/x-ms-bmp',
      'application/octet-stream',
    ];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];
    if (allowedMimes.includes(rawMime) || allowedExts.includes(ext) || rawMime.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Upload one JPEG, PNG, WebP or BMP image.'));
    }
  },
}).fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }, { name: 'photo', maxCount: 1 }]);

router.post('/diagnose', (req, res, next) => {
  upload(req, res, error => {
    if (error) {
      console.error('[DiseaseRoutes] Upload error:', error.message || error);
      const isSize = error.code === 'LIMIT_FILE_SIZE';
      return res.status(isSize ? 413 : 400).json({
        success: false,
        error: isSize ? 'Image must be no larger than 20 MB.' : (error.message || 'Upload one JPEG, PNG, WebP or BMP image.')
      });
    }
    req.file = req.files?.image?.[0] || req.files?.file?.[0] || req.files?.photo?.[0];
    next();
  });
}, diagnoseDisease);
module.exports = router;
