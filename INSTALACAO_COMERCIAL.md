# 💼 Guia de Instalação Comercial - IPTV Server

Este guia ensina como configurar e vender seu servidor IPTV usando ferramentas gratuitas.

## 🎯 Hospedagem Gratuita (Opções)

### Opção 1: Oracle Cloud (RECOMENDADO)
- **Custo**: 100% GRATUITO para sempre
- **Recursos**: 2 VMs com 1GB RAM, 200GB storage
- **Tráfego**: 10TB/mês GRÁTIS

**Passos:**
1. Crie conta em: https://cloud.oracle.com/
2. Escolha "Always Free Tier"
3. Crie uma VM Ubuntu 22.04
4. Abra as portas 3000, 80, 443

### Opção 2: Google Cloud Platform
- **Custo**: $300 em créditos grátis (3 meses)
- **VM**: e2-micro (sempre grátis com limites)

### Opção 3: AWS EC2
- **Custo**: 12 meses grátis (750h/mês)
- **VM**: t2.micro ou t3.micro

### Opção 4: Railway.app
- **Custo**: $5 grátis/mês
- **Fácil**: Deploy com 1 clique

## 🚀 Instalação Rápida (5 minutos)

### 1. Conectar ao Servidor
```bash
ssh ubuntu@SEU_IP_DO_SERVIDOR
```

### 2. Instalar Dependências
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar FFmpeg
sudo apt install -y ffmpeg

# Verificar instalações
node --version
npm --version
ffmpeg -version
```

### 3. Baixar e Configurar o Servidor
```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/IPTV---servidor.git
cd IPTV---servidor

# Instalar dependências
npm install

# Configurar para produção
nano .env
```

Adicione no arquivo `.env`:
```env
PORT=3000
HOST=0.0.0.0
JWT_SECRET=troque-por-senha-super-segura-aleatoria
```

### 4. Iniciar o Servidor
```bash
# Testar primeiro
npm start

# Para rodar sempre (usando PM2)
sudo npm install -g pm2
pm2 start server.js --name iptv-server
pm2 startup
pm2 save
```

### 5. Configurar Domínio (OPCIONAL mas RECOMENDADO)

**Domínio Gratuito:**
- FreeDNS: https://freedns.afraid.org/
- No-IP: https://www.noip.com/
- DuckDNS: https://www.duckdns.org/

**Configurar NGINX:**
```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/iptv
```

Cole isso:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/iptv /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**SSL Gratuito (HTTPS):**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## 💰 Modelo de Negócio

### Planos Sugeridos

**Plano Básico** - R$ 19,90/mês
- Acesso a todos os canais
- Qualidade SD/HD
- 1 conexão simultânea

**Plano Padrão** - R$ 29,90/mês
- Acesso a todos os canais
- Qualidade HD/Full HD
- 2 conexões simultâneas
- Suporte prioritário

**Plano Premium** - R$ 39,90/mês
- Acesso a todos os canais + VOD
- Qualidade Full HD/4K
- 3 conexões simultâneas
- Suporte VIP

### Como Receber Pagamentos (GRATUITO)

1. **Mercado Pago** - Sem mensalidade, apenas taxa por transação
2. **PayPal** - Aceito mundialmente
3. **PicPay** - Popular no Brasil
4. **PIX** - Manual mas sem taxas

## 📊 Gerenciar Assinantes

### Sistema Simples de Controle

Crie uma planilha ou use o banco de dados:
- Nome do cliente
- Email/WhatsApp
- Data de vencimento
- Plano contratado
- Status (ativo/inativo)

### Automatizar com Webhook
Integre com Mercado Pago/PayPal para ativar/desativar automaticamente.

## 📺 Adicionar Canais

### Fontes de Streams GRATUITAS

1. **GitHub IPTV Lists**: https://github.com/iptv-org/iptv
2. **Free IPTV**: Várias listas públicas
3. **YouTube Live**: Canais de notícias ao vivo

### Adicionar via Painel Admin

1. Acesse: `http://seu-servidor.com/admin`
2. Login: admin / admin123 (MUDE ISSO!)
3. Vá em "Canais"
4. Clique em "Adicionar Canal"
5. Preencha:
   - Nome: Ex: "Globo News"
   - URL do Stream: Cole o link m3u8 ou stream
   - Categoria: Ex: "Notícias"
   - País: "Brasil"

### Adicionar em Massa (via API)

```bash
curl -X POST http://seu-servidor.com/api/channels/channels \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Canal Exemplo",
    "stream_url": "http://exemplo.com/stream.m3u8",
    "category": "Esportes"
  }'
```

## 🔒 Segurança IMPORTANTE

### Trocar Senha Admin
```bash
# Acesse o painel admin e crie um novo usuário admin
# Depois delete o usuário padrão
```

### Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

### Backup Automático
```bash
# Criar script de backup
nano backup.sh
```

```bash
#!/bin/bash
tar -czf backup-$(date +%Y%m%d).tar.gz IPTV---servidor/
```

```bash
chmod +x backup.sh
# Adicionar ao cron (diário)
crontab -e
# Adicione: 0 2 * * * /home/ubuntu/backup.sh
```

## 📱 Divulgação GRATUITA

1. **WhatsApp Business** - Crie grupos e status
2. **Telegram** - Crie um canal
3. **Instagram** - Poste conteúdo sobre IPTV
4. **Facebook Marketplace** - Anuncie gratuitamente
5. **Grupos do Facebook** - Entre em grupos locais
6. **OLX** - Anuncie seu serviço
7. **Indicação** - Dê desconto para quem indicar

## 🎁 Teste Grátis

Ofereça:
- 24h ou 48h de teste grátis
- Gera mais confiança
- Cliente testa antes de pagar

Para criar teste:
1. Crie usuário no painel
2. Desative após o período

## 📈 Escalando o Negócio

### Quando crescer:
1. Migre para VPS pago (mais recursos)
2. Use CDN (Cloudflare - GRÁTIS)
3. Contrate revendedores (40% comissão)
4. Automatize tudo

### Monitoramento
```bash
# Ver logs do servidor
pm2 logs iptv-server

# Ver status
pm2 status

# Reiniciar se necessário
pm2 restart iptv-server
```

## ⚠️ Avisos Legais

- Use apenas conteúdo com direitos ou domínio público
- Não distribua conteúdo pirata
- Consulte um advogado sobre legalidade no seu país
- Este servidor é para uso educacional

## 💬 Suporte aos Clientes

### Templates de Mensagens

**Boas-vindas:**
```
Olá! Seja bem-vindo(a) ao [NOME DO SEU SERVIÇO]!

Seu acesso foi ativado ✅

🔗 Link: http://seu-servidor.com/player/channels
👤 Usuário: [USUARIO]
🔑 Senha: [SENHA]

📱 Tutorial para TV: http://seu-servidor.com/tutorial

Qualquer dúvida, estou à disposição!
```

**Renovação:**
```
Olá [NOME]!

Seu plano vence em 3 dias (dia XX/XX).

💳 Para renovar:
PIX: [SEU PIX]
Valor: R$ XX,XX

Após pagar, me envie o comprovante!
```

## 🎯 Metas Realistas

### Mês 1
- 10 clientes = R$ 199,00

### Mês 3
- 50 clientes = R$ 995,00

### Mês 6
- 200 clientes = R$ 3.980,00

### Mês 12
- 500 clientes = R$ 9.950,00

## 📞 Onde Conseguir Ajuda

1. Comunidades no Telegram sobre IPTV
2. Fóruns brasileiros de tecnologia
3. YouTube - tutoriais de IPTV
4. Documentação deste projeto

---

**Boa sorte com seu negócio! 🚀**
