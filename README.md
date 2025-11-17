# 📺 IPTV Server - Sistema Completo de Streaming

Servidor IPTV completo com streaming HLS, painel de administração, API REST e player integrado.

## 🚀 Características

- **Streaming HLS**: Transmissão de vídeo em alta qualidade usando HTTP Live Streaming
- **Painel Admin**: Interface web completa para gerenciamento
- **API REST**: API completa para integração com aplicativos externos
- **Autenticação JWT**: Sistema seguro de autenticação
- **Gerenciamento de Canais**: Adicionar, editar e remover canais ao vivo
- **VOD (Video On Demand)**: Sistema completo de vídeos sob demanda
- **Estatísticas**: Acompanhamento de visualizações e atividades
- **Transcodificação**: FFmpeg para conversão de formatos
- **Banco de Dados SQLite**: Banco de dados leve e eficiente
- **Interface Responsiva**: Funciona em desktop, tablet e mobile

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- FFmpeg instalado no sistema
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd IPTV---servidor
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure as variáveis de ambiente criando um arquivo `.env`:
```env
PORT=3000
HOST=0.0.0.0
JWT_SECRET=seu-secret-super-seguro
```

## 🚀 Executando o Servidor

### Modo de Produção
```bash
npm start
```

### Modo de Desenvolvimento (com auto-reload)
```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

## 📱 Interfaces

### Página Inicial
- URL: `http://localhost:3000/`
- Visão geral do sistema e estatísticas

### Painel Admin
- URL: `http://localhost:3000/admin`
- Login padrão:
  - **Usuário**: admin
  - **Senha**: admin123
- Funcionalidades:
  - Dashboard com estatísticas
  - Gerenciamento de canais
  - Gerenciamento de VOD
  - Gerenciamento de usuários
  - Monitoramento de streams ativos

### Player
- URL: `http://localhost:3000/player/:id`
- Player de vídeo integrado com HLS.js
- Suporte para canais ao vivo e VOD

## 🔌 API REST

### Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Registrar Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "novouser",
  "password": "senha123",
  "email": "user@example.com"
}
```

#### Obter Perfil
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Canais

#### Listar Todos os Canais
```http
GET /api/channels/channels
```

Query parameters opcionais:
- `category`: Filtrar por categoria
- `country`: Filtrar por país
- `search`: Buscar por nome ou descrição

#### Obter Canal por ID
```http
GET /api/channels/channels/:id
```

#### Criar Canal (Admin)
```http
POST /api/channels/channels
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Canal Exemplo",
  "description": "Descrição do canal",
  "stream_url": "http://example.com/stream.m3u8",
  "logo_url": "http://example.com/logo.png",
  "category": "Esportes",
  "country": "Brasil",
  "language": "pt-BR",
  "quality": "high"
}
```

#### Atualizar Canal (Admin)
```http
PUT /api/channels/channels/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Canal Atualizado",
  "active": 1
}
```

#### Deletar Canal (Admin)
```http
DELETE /api/channels/channels/:id
Authorization: Bearer <token>
```

### VOD (Video On Demand)

#### Listar VODs
```http
GET /api/channels/vod
```

#### Obter VOD por ID
```http
GET /api/channels/vod/:id
```

#### Criar VOD (Admin)
```http
POST /api/channels/vod
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Filme Exemplo",
  "description": "Descrição do filme",
  "video_url": "http://example.com/video.mp4",
  "thumbnail_url": "http://example.com/thumb.jpg",
  "duration": 7200,
  "category": "Filmes",
  "year": 2024,
  "rating": 8.5
}
```

### Streaming

#### Iniciar Stream (Admin)
```http
POST /api/streams/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "channelId": 1,
  "quality": "medium"
}
```

#### Parar Stream (Admin)
```http
DELETE /api/streams/:streamId
Authorization: Bearer <token>
```

#### Listar Streams Ativos
```http
GET /api/streams/active
Authorization: Bearer <token>
```

#### Obter Estatísticas
```http
GET /api/streams/stats
Authorization: Bearer <token>
```

#### Upload de Vídeo (Admin)
```http
POST /api/streams/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: video=<arquivo>
```

## 📁 Estrutura do Projeto

```
IPTV---servidor/
├── config/
│   └── config.js           # Configurações do servidor
├── controllers/
│   ├── authController.js   # Controller de autenticação
│   ├── channelController.js # Controller de canais/VOD
│   └── streamController.js  # Controller de streaming
├── middleware/
│   └── auth.js             # Middleware de autenticação
├── models/
│   └── database.js         # Configuração do banco de dados
├── public/
│   ├── index.html          # Página inicial
│   ├── admin.html          # Painel admin
│   └── player.html         # Player de vídeo
├── routes/
│   ├── auth.js             # Rotas de autenticação
│   ├── channels.js         # Rotas de canais
│   └── streams.js          # Rotas de streaming
├── streams/                # Diretório para arquivos HLS
├── uploads/                # Diretório para uploads
├── server.js               # Servidor principal
├── package.json            # Dependências
└── README.md              # Este arquivo
```

## 🗄️ Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:

- **users**: Usuários do sistema
- **channels**: Canais de TV ao vivo
- **vod**: Vídeos sob demanda
- **categories**: Categorias de conteúdo
- **stats**: Estatísticas de visualização

## 🔒 Segurança

- Senhas são hasheadas usando bcrypt
- Autenticação JWT com tokens que expiram em 24h
- Middleware de autorização para rotas admin
- Rate limiting para prevenir abuso da API
- Validação de tipos de arquivo no upload

## 🎥 Formatos Suportados

### Vídeo
- MP4
- MKV
- AVI
- MOV
- FLV
- TS

### Streaming
- HLS (m3u8)
- URLs de stream direto

## ⚙️ Configuração Avançada

### Alterar Qualidades de Transcodificação

Edite o arquivo `config/config.js`:

```javascript
transcodingPresets: {
  low: { videoBitrate: '500k', audioBitrate: '64k', resolution: '640x360' },
  medium: { videoBitrate: '1500k', audioBitrate: '128k', resolution: '1280x720' },
  high: { videoBitrate: '3000k', audioBitrate: '192k', resolution: '1920x1080' }
}
```

### Alterar Tamanho Máximo de Upload

Edite o arquivo `config/config.js`:

```javascript
upload: {
  maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
}
```

## 🐛 Troubleshooting

### FFmpeg não encontrado
Instale o FFmpeg no seu sistema:

**Ubuntu/Debian:**
```bash
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Baixe de: https://ffmpeg.org/download.html

### Porta já em uso
Altere a porta no arquivo `.env` ou `config/config.js`

### Erro de permissão em diretórios
Garanta que o processo Node.js tem permissão de escrita nos diretórios:
```bash
chmod -R 755 streams uploads
```

## 📝 TODO / Melhorias Futuras

- [ ] Suporte a múltiplas qualidades simultâneas
- [ ] Sistema de favoritos para usuários
- [ ] EPG (Electronic Program Guide)
- [ ] Gravação de streams
- [ ] Suporte a legendas
- [ ] Sistema de recomendação
- [ ] Integração com Telegram/Discord
- [ ] Timeshift para canais ao vivo
- [ ] Playlist M3U8 personalizada por usuário
- [ ] Sistema de notificações

## 📄 Licença

MIT License - veja o arquivo LICENSE para mais detalhes

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues e pull requests.

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no repositório do GitHub.

---

**Desenvolvido com ❤️ usando Node.js, Express e FFmpeg**
