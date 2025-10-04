#!/bin/bash

# ===========================================
# SERVER SETUP SCRIPT FOR CI/CD
# ===========================================
# Этот скрипт настраивает сервер для автоматического деплоя

set -e

echo "🚀 Setting up server for CI/CD deployment..."

# Проверяем права root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Обновляем систему
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
echo "🔧 Installing required packages..."
apt install -y curl wget git nano htop

# Устанавливаем Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Устанавливаем Docker Compose
echo "🐙 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Создаем пользователя для деплоя
echo "👤 Setting up deployment user..."
if ! id "deploy" &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG docker deploy
    echo "✅ Deploy user created"
else
    echo "✅ Deploy user already exists"
fi

# Создаем директорию проекта
echo "📁 Setting up project directory..."
PROJECT_DIR="/opt/coin"
mkdir -p $PROJECT_DIR
chown deploy:deploy $PROJECT_DIR

# Настраиваем SSH для CI/CD
echo "🔑 Setting up SSH for CI/CD..."
DEPLOY_HOME="/home/deploy"
mkdir -p $DEPLOY_HOME/.ssh
chmod 700 $DEPLOY_HOME/.ssh
chown deploy:deploy $DEPLOY_HOME/.ssh

# Создаем SSH ключ для CI/CD
if [ ! -f $DEPLOY_HOME/.ssh/id_rsa ]; then
    echo "🔐 Generating SSH key for CI/CD..."
    sudo -u deploy ssh-keygen -t rsa -b 4096 -f $DEPLOY_HOME/.ssh/id_rsa -N ""
    chmod 600 $DEPLOY_HOME/.ssh/id_rsa
    chmod 644 $DEPLOY_HOME/.ssh/id_rsa.pub
    echo "✅ SSH key generated"
else
    echo "✅ SSH key already exists"
fi

# Настраиваем authorized_keys
echo "🔓 Setting up SSH access..."
if [ ! -f $DEPLOY_HOME/.ssh/authorized_keys ]; then
    cp $DEPLOY_HOME/.ssh/id_rsa.pub $DEPLOY_HOME/.ssh/authorized_keys
    chmod 600 $DEPLOY_HOME/.ssh/authorized_keys
    chown deploy:deploy $DEPLOY_HOME/.ssh/authorized_keys
    echo "✅ SSH access configured"
else
    echo "✅ SSH access already configured"
fi

# Настраиваем firewall
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000:3002/tcp
    ufw allow 5175/tcp
    ufw allow 8200/tcp
    ufw --force enable
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW not found, configure firewall manually"
fi

# Создаем systemd сервис для автозапуска
echo "⚙️  Setting up auto-start service..."
cat > /etc/systemd/system/coin.service << EOF
[Unit]
Description=Coin Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=deploy
Group=deploy

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable coin.service
echo "✅ Auto-start service configured"

# Создаем скрипт для обновления
echo "📝 Creating update script..."
cat > $PROJECT_DIR/update.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 Updating Coin application..."

# Переходим в директорию проекта
cd /opt/coin

# Останавливаем сервисы
echo "⏹️  Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Обновляем код
echo "📥 Pulling latest code..."
git pull origin main

# Обновляем образы
echo "🐳 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Запускаем сервисы
echo "▶️  Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Очищаем старые образы
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Update completed!"
echo "🌐 Application is running at:"
echo "  - Backend: http://localhost:3000"
echo "  - Admin: http://localhost:3001"
echo "  - Frontend: http://localhost:3002"
echo "  - Docs: http://localhost:5175"
echo "  - Vault: http://localhost:8200"
EOF

chmod +x $PROJECT_DIR/update.sh
chown deploy:deploy $PROJECT_DIR/update.sh
echo "✅ Update script created"

# Выводим информацию
echo ""
echo "🎉 Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your GitHub repository to $PROJECT_DIR"
echo "2. Configure environment files:"
echo "   - $PROJECT_DIR/vault/vault.env"
echo "   - $PROJECT_DIR/backend/.env.production"
echo "3. Add SSH public key to GitHub Actions secrets:"
echo "   $(cat $DEPLOY_HOME/.ssh/id_rsa.pub)"
echo "4. Configure GitHub Actions secrets:"
echo "   - HOST: $(hostname -I | awk '{print $1}')"
echo "   - USERNAME: deploy"
echo "   - SSH_KEY: $(cat $DEPLOY_HOME/.ssh/id_rsa)"
echo "   - PROJECT_PATH: $PROJECT_DIR"
echo ""
echo "🔧 Useful commands:"
echo "  - Check status: systemctl status coin"
echo "  - Start: systemctl start coin"
echo "  - Stop: systemctl stop coin"
echo "  - Update: $PROJECT_DIR/update.sh"
echo ""
echo "🌐 Application will be available at:"
echo "  - Backend: http://$(hostname -I | awk '{print $1}'):3000"
echo "  - Admin: http://$(hostname -I | awk '{print $1}'):3001"
echo "  - Frontend: http://$(hostname -I | awk '{print $1}'):3002"
echo "  - Docs: http://$(hostname -I | awk '{print $1}'):5175"
echo "  - Vault: http://$(hostname -I | awk '{print $1}'):8200"
