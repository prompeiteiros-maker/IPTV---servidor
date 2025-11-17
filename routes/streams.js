const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const streamController = require('../controllers/streamController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const config = require('../config/config');

// Configurar multer para upload de vídeos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.upload.allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não permitido'));
    }
  }
});

// Rotas de streaming
router.post('/start', authMiddleware, adminMiddleware, streamController.startStream);
router.delete('/:streamId', authMiddleware, adminMiddleware, streamController.stopStream);
router.get('/active', authMiddleware, streamController.getActiveStreams);
router.get('/stats', authMiddleware, streamController.getStats);

// Upload de vídeos
router.post('/upload', authMiddleware, adminMiddleware, upload.single('video'), streamController.uploadVideo);

// Proxy de stream
router.get('/proxy', streamController.proxyStream);

module.exports = router;
