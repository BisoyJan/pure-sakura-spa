#!/bin/bash

# Pure Sakura Healing - VPS Deployment Script
# Domain: puresakurahealing.com
# VPS IP: 82.29.178.224

set -e

echo "🌸 Starting Pure Sakura Healing deployment..."

# Variables
APP_DIR="/var/www/puresakurahealing.com"
REPO_URL="YOUR_GIT_REPO_URL"  # Replace with your Git repository URL

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone or pull repository (uncomment and modify as needed)
# cd $APP_DIR
# git clone $REPO_URL . || git pull origin main

# Navigate to app directory
cd $APP_DIR

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building application..."
npm run build

# Setup PM2
echo "🚀 Starting application with PM2..."
pm2 delete pure-sakura-spa 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup Nginx
echo "🔧 Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/puresakurahealing.com
sudo ln -sf /etc/nginx/sites-available/puresakurahealing.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Certbot
echo "🔒 Setting up SSL certificate..."
sudo certbot --nginx -d puresakurahealing.com -d www.puresakurahealing.com --non-interactive --agree-tos --email pshealing250@gmail.com

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at https://puresakurahealing.com"
