const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const db = require('../models/database');

const activeStreams = new Map();

const startStream = async (req, res) => {
  try {
    const { channelId, quality = 'medium' } = req.body;

    const channel = await db.get('SELECT * FROM channels WHERE id = ? AND active = 1', [channelId]);

    if (!channel) {
      return res.status(404).json({ error: 'Canal não encontrado' });
    }

    const streamId = `channel_${channelId}_${Date.now()}`;
    const outputDir = path.join(__dirname, '..', 'streams', streamId);

    // Criar diretório para o stream
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const preset = config.streaming.transcodingPresets[quality] || config.streaming.transcodingPresets.medium;

    // Configurar FFmpeg para HLS
    const stream = ffmpeg(channel.stream_url)
      .outputOptions([
        '-c:v libx264',
        `-b:v ${preset.videoBitrate}`,
        `-b:a ${preset.audioBitrate}`,
        `-s ${preset.resolution}`,
        '-preset veryfast',
        '-g 48',
        '-sc_threshold 0',
        '-f hls',
        `-hls_time ${config.streaming.hlsSegmentDuration}`,
        `-hls_list_size ${config.streaming.hlsPlaylistSize}`,
        '-hls_flags delete_segments',
        '-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts')
      ])
      .output(path.join(outputDir, 'playlist.m3u8'))
      .on('start', (commandLine) => {
        console.log(`Stream iniciado: ${streamId}`);
        console.log('FFmpeg command:', commandLine);
      })
      .on('error', (err) => {
        console.error(`Erro no stream ${streamId}:`, err);
        activeStreams.delete(streamId);
      })
      .on('end', () => {
        console.log(`Stream finalizado: ${streamId}`);
        activeStreams.delete(streamId);
      });

    stream.run();

    activeStreams.set(streamId, {
      stream,
      channelId,
      quality,
      startTime: Date.now()
    });

    res.json({
      streamId,
      playlistUrl: `/streams/${streamId}/playlist.m3u8`,
      message: 'Stream iniciado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao iniciar stream:', error);
    res.status(500).json({ error: 'Erro ao iniciar stream' });
  }
};

const stopStream = async (req, res) => {
  try {
    const { streamId } = req.params;

    const streamData = activeStreams.get(streamId);

    if (!streamData) {
      return res.status(404).json({ error: 'Stream não encontrado' });
    }

    streamData.stream.kill('SIGKILL');
    activeStreams.delete(streamId);

    res.json({ message: 'Stream parado com sucesso' });
  } catch (error) {
    console.error('Erro ao parar stream:', error);
    res.status(500).json({ error: 'Erro ao parar stream' });
  }
};

const getActiveStreams = async (req, res) => {
  try {
    const streams = [];

    for (const [streamId, data] of activeStreams.entries()) {
      streams.push({
        streamId,
        channelId: data.channelId,
        quality: data.quality,
        uptime: Date.now() - data.startTime,
        playlistUrl: `/streams/${streamId}/playlist.m3u8`
      });
    }

    res.json(streams);
  } catch (error) {
    console.error('Erro ao buscar streams ativos:', error);
    res.status(500).json({ error: 'Erro ao buscar streams ativos' });
  }
};

const getStats = async (req, res) => {
  try {
    const channelCount = await db.get('SELECT COUNT(*) as count FROM channels WHERE active = 1');
    const vodCount = await db.get('SELECT COUNT(*) as count FROM vod WHERE active = 1');
    const userCount = await db.get('SELECT COUNT(*) as count FROM users WHERE active = 1');

    const topChannels = await db.query(
      'SELECT id, name, views, category FROM channels WHERE active = 1 ORDER BY views DESC LIMIT 10'
    );

    const topVOD = await db.query(
      'SELECT id, title, views, category FROM vod WHERE active = 1 ORDER BY views DESC LIMIT 10'
    );

    const recentActivity = await db.query(
      'SELECT * FROM stats ORDER BY timestamp DESC LIMIT 50'
    );

    res.json({
      overview: {
        channels: channelCount.count,
        vod: vodCount.count,
        users: userCount.count,
        activeStreams: activeStreams.size
      },
      topChannels,
      topVOD,
      recentActivity
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'Vídeo enviado com sucesso',
      videoUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do vídeo' });
  }
};

const proxyStream = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL não fornecida' });
    }

    // Fazer proxy do stream
    const axios = require('axios');
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000
    });

    res.set('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    console.error('Erro no proxy de stream:', error);
    res.status(500).json({ error: 'Erro ao fazer proxy do stream' });
  }
};

module.exports = {
  startStream,
  stopStream,
  getActiveStreams,
  getStats,
  uploadVideo,
  proxyStream
};
