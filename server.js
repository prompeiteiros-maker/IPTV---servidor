const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config/config');
const db = require('./models/database');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/streams', express.static('streams'));
app.use('/uploads', express.static('uploads'));

// Rotas
const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const streamRoutes = require('./routes/streams');

app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/streams', streamRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota do admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Rota do player
app.get('/player/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'player.html'));
});

// Rota do tutorial
app.get('/tutorial', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tutorial.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicializar banco de dados e servidor
db.initialize().then(() => {
  app.listen(config.server.port, config.server.host, () => {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║       SERVIDOR IPTV INICIALIZADO            ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log(`🌐 Servidor rodando em: http://${config.server.host}:${config.server.port}`);
    console.log(`📺 Painel Admin: http://${config.server.host}:${config.server.port}/admin`);
    console.log(`🔑 Login padrão: admin / admin123`);
    console.log('═══════════════════════════════════════════════');
  });
}).catch(err => {
  console.error('Erro ao inicializar o servidor:', err);
  process.exit(1);
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
