const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rotas públicas
router.get('/channels', channelController.getAllChannels);
router.get('/channels/:id', channelController.getChannelById);
router.get('/categories', channelController.getCategories);
router.get('/vod', channelController.getVOD);
router.get('/vod/:id', channelController.getVODById);

// Playlist M3U (pública)
router.get('/playlist.m3u', channelController.getM3UPlaylist);
router.get('/playlist.m3u8', channelController.getM3UPlaylist);

// Xtream Codes API (pública - compatível com apps de IPTV)
router.get('/player_api.php', channelController.getXtreamChannels);
router.get('/get.php', channelController.getM3UPlaylist);

// Rotas admin - Canais
router.post('/channels', authMiddleware, adminMiddleware, channelController.createChannel);
router.put('/channels/:id', authMiddleware, adminMiddleware, channelController.updateChannel);
router.delete('/channels/:id', authMiddleware, adminMiddleware, channelController.deleteChannel);

// Rotas admin - VOD
router.post('/vod', authMiddleware, adminMiddleware, channelController.createVOD);
router.put('/vod/:id', authMiddleware, adminMiddleware, channelController.updateVOD);
router.delete('/vod/:id', authMiddleware, adminMiddleware, channelController.deleteVOD);

module.exports = router;
