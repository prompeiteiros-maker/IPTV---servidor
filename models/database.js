const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', config.database.path);
const db = new sqlite3.Database(dbPath);

const initialize = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          active INTEGER DEFAULT 1
        )
      `);

      // Tabela de canais
      db.run(`
        CREATE TABLE IF NOT EXISTS channels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          logo_url TEXT,
          stream_url TEXT NOT NULL,
          category TEXT,
          country TEXT,
          language TEXT,
          quality TEXT DEFAULT 'medium',
          active INTEGER DEFAULT 1,
          views INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de VOD (Video on Demand)
      db.run(`
        CREATE TABLE IF NOT EXISTS vod (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          thumbnail_url TEXT,
          video_url TEXT NOT NULL,
          duration INTEGER,
          category TEXT,
          year INTEGER,
          rating REAL,
          views INTEGER DEFAULT 0,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de categorias
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL,
          icon TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de estatísticas
      db.run(`
        CREATE TABLE IF NOT EXISTS stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content_type TEXT NOT NULL,
          content_id INTEGER NOT NULL,
          user_id INTEGER,
          action TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Criar usuário admin padrão
      const hashedPassword = bcrypt.hashSync(config.admin.defaultPassword, 10);
      db.run(
        'INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
        [config.admin.defaultUsername, hashedPassword, 'admin'],
        (err) => {
          if (err) {
            console.error('Erro ao criar usuário admin:', err);
          } else {
            console.log('✅ Banco de dados inicializado com sucesso');
          }
        }
      );

      // Inserir categorias padrão
      const defaultCategories = [
        { name: 'Esportes', type: 'channel', icon: '⚽' },
        { name: 'Notícias', type: 'channel', icon: '📰' },
        { name: 'Filmes', type: 'channel', icon: '🎬' },
        { name: 'Séries', type: 'channel', icon: '📺' },
        { name: 'Documentários', type: 'vod', icon: '🎥' },
        { name: 'Música', type: 'channel', icon: '🎵' },
        { name: 'Infantil', type: 'channel', icon: '👶' },
        { name: 'Entretenimento', type: 'channel', icon: '🎭' }
      ];

      defaultCategories.forEach(cat => {
        db.run(
          'INSERT OR IGNORE INTO categories (name, type, icon) VALUES (?, ?, ?)',
          [cat.name, cat.type, cat.icon]
        );
      });

      resolve();
    });
  });
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

module.exports = {
  db,
  initialize,
  query,
  run,
  get
};
