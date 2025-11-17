module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'seu-secret-super-seguro-mude-isso',
    expiresIn: '24h'
  },
  database: {
    path: './database.sqlite'
  },
  streaming: {
    hlsSegmentDuration: 4,
    hlsPlaylistSize: 5,
    transcodingPresets: {
      low: { videoBitrate: '500k', audioBitrate: '64k', resolution: '640x360' },
      medium: { videoBitrate: '1500k', audioBitrate: '128k', resolution: '1280x720' },
      high: { videoBitrate: '3000k', audioBitrate: '192k', resolution: '1920x1080' }
    }
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
    allowedFormats: ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.ts', '.m3u8']
  },
  admin: {
    defaultUsername: 'admin',
    defaultPassword: 'admin123' // Será hasheado na inicialização
  }
};
