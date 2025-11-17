const db = require('../models/database');

const getAllChannels = async (req, res) => {
  try {
    const { category, country, search, active = 1 } = req.query;
    let sql = 'SELECT * FROM channels WHERE active = ?';
    const params = [active];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (country) {
      sql += ' AND country = ?';
      params.push(country);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY name ASC';

    const channels = await db.query(sql, params);
    res.json(channels);
  } catch (error) {
    console.error('Erro ao buscar canais:', error);
    res.status(500).json({ error: 'Erro ao buscar canais' });
  }
};

const getChannelById = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await db.get('SELECT * FROM channels WHERE id = ?', [id]);

    if (!channel) {
      return res.status(404).json({ error: 'Canal não encontrado' });
    }

    // Incrementar visualizações
    await db.run('UPDATE channels SET views = views + 1 WHERE id = ?', [id]);

    // Registrar estatística
    await db.run(
      'INSERT INTO stats (content_type, content_id, action) VALUES (?, ?, ?)',
      ['channel', id, 'view']
    );

    res.json(channel);
  } catch (error) {
    console.error('Erro ao buscar canal:', error);
    res.status(500).json({ error: 'Erro ao buscar canal' });
  }
};

const createChannel = async (req, res) => {
  try {
    const { name, description, logo_url, stream_url, category, country, language, quality } = req.body;

    if (!name || !stream_url) {
      return res.status(400).json({ error: 'Nome e URL do stream são obrigatórios' });
    }

    const result = await db.run(
      `INSERT INTO channels (name, description, logo_url, stream_url, category, country, language, quality)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, logo_url, stream_url, category, country, language, quality || 'medium']
    );

    res.status(201).json({
      message: 'Canal criado com sucesso',
      channelId: result.id
    });
  } catch (error) {
    console.error('Erro ao criar canal:', error);
    res.status(500).json({ error: 'Erro ao criar canal' });
  }
};

const updateChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logo_url, stream_url, category, country, language, quality, active } = req.body;

    await db.run(
      `UPDATE channels
       SET name = ?, description = ?, logo_url = ?, stream_url = ?, category = ?,
           country = ?, language = ?, quality = ?, active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, logo_url, stream_url, category, country, language, quality, active, id]
    );

    res.json({ message: 'Canal atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar canal:', error);
    res.status(500).json({ error: 'Erro ao atualizar canal' });
  }
};

const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM channels WHERE id = ?', [id]);
    res.json({ message: 'Canal deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar canal:', error);
    res.status(500).json({ error: 'Erro ao deletar canal' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories WHERE type = ? ORDER BY name ASC', ['channel']);
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

const getVOD = async (req, res) => {
  try {
    const { category, search, active = 1 } = req.query;
    let sql = 'SELECT * FROM vod WHERE active = ?';
    const params = [active];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const videos = await db.query(sql, params);
    res.json(videos);
  } catch (error) {
    console.error('Erro ao buscar VOD:', error);
    res.status(500).json({ error: 'Erro ao buscar VOD' });
  }
};

const getVODById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await db.get('SELECT * FROM vod WHERE id = ?', [id]);

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    // Incrementar visualizações
    await db.run('UPDATE vod SET views = views + 1 WHERE id = ?', [id]);

    // Registrar estatística
    await db.run(
      'INSERT INTO stats (content_type, content_id, action) VALUES (?, ?, ?)',
      ['vod', id, 'view']
    );

    res.json(video);
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error);
    res.status(500).json({ error: 'Erro ao buscar vídeo' });
  }
};

const createVOD = async (req, res) => {
  try {
    const { title, description, thumbnail_url, video_url, duration, category, year, rating } = req.body;

    if (!title || !video_url) {
      return res.status(400).json({ error: 'Título e URL do vídeo são obrigatórios' });
    }

    const result = await db.run(
      `INSERT INTO vod (title, description, thumbnail_url, video_url, duration, category, year, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, thumbnail_url, video_url, duration, category, year, rating]
    );

    res.status(201).json({
      message: 'VOD criado com sucesso',
      vodId: result.id
    });
  } catch (error) {
    console.error('Erro ao criar VOD:', error);
    res.status(500).json({ error: 'Erro ao criar VOD' });
  }
};

const updateVOD = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail_url, video_url, duration, category, year, rating, active } = req.body;

    await db.run(
      `UPDATE vod
       SET title = ?, description = ?, thumbnail_url = ?, video_url = ?, duration = ?,
           category = ?, year = ?, rating = ?, active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, thumbnail_url, video_url, duration, category, year, rating, active, id]
    );

    res.json({ message: 'VOD atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar VOD:', error);
    res.status(500).json({ error: 'Erro ao atualizar VOD' });
  }
};

const deleteVOD = async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM vod WHERE id = ?', [id]);
    res.json({ message: 'VOD deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar VOD:', error);
    res.status(500).json({ error: 'Erro ao deletar VOD' });
  }
};

// Gerar playlist M3U para apps de IPTV
const getM3UPlaylist = async (req, res) => {
  try {
    const { username, category } = req.query;
    let sql = 'SELECT * FROM channels WHERE active = 1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY category, name ASC';

    const channels = await db.query(sql, params);

    // Gerar arquivo M3U
    let m3u = '#EXTM3U\n';

    channels.forEach(channel => {
      const tvgLogo = channel.logo_url || '';
      const groupTitle = channel.category || 'Geral';
      const tvgId = `channel-${channel.id}`;

      m3u += `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${channel.name}" tvg-logo="${tvgLogo}" group-title="${groupTitle}",${channel.name}\n`;
      m3u += `${channel.stream_url}\n`;
    });

    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Content-Disposition', 'attachment; filename="playlist.m3u8"');
    res.send(m3u);
  } catch (error) {
    console.error('Erro ao gerar playlist M3U:', error);
    res.status(500).json({ error: 'Erro ao gerar playlist M3U' });
  }
};

// Gerar Xtream Codes API compatível
const getXtreamCategories = async (req, res) => {
  try {
    const categories = await db.query(
      'SELECT DISTINCT category FROM channels WHERE active = 1 AND category IS NOT NULL ORDER BY category'
    );

    const formattedCategories = categories.map((cat, index) => ({
      category_id: index + 1,
      category_name: cat.category,
      parent_id: 0
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error('Erro ao buscar categorias Xtream:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

const getXtreamChannels = async (req, res) => {
  try {
    const { category_id } = req.query;
    const channels = await db.query('SELECT * FROM channels WHERE active = 1 ORDER BY name');

    const formattedChannels = channels.map(ch => ({
      num: ch.id,
      name: ch.name,
      stream_type: 'live',
      stream_id: ch.id,
      stream_icon: ch.logo_url || '',
      epg_channel_id: `channel-${ch.id}`,
      added: ch.created_at,
      category_id: ch.category || 'Geral',
      custom_sid: '',
      tv_archive: 0,
      direct_source: ch.stream_url,
      tv_archive_duration: 0
    }));

    res.json(formattedChannels);
  } catch (error) {
    console.error('Erro ao buscar canais Xtream:', error);
    res.status(500).json({ error: 'Erro ao buscar canais' });
  }
};

module.exports = {
  getAllChannels,
  getChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
  getCategories,
  getVOD,
  getVODById,
  createVOD,
  updateVOD,
  deleteVOD,
  getM3UPlaylist,
  getXtreamCategories,
  getXtreamChannels
};
