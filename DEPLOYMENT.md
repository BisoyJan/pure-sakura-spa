# 🌸 Pure Sakura Healing - VPS Deployment Guide

## Server Details
- **VPS IP:** 82.29.178.224
- **Domain:** puresakurahealing.com
- **Hosting:** Hostinger VPS

---

## 📋 Pre-Deployment Checklist

### 1. DNS Configuration (Hostinger Panel)
Point your domain to your VPS by adding these DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 82.29.178.224 | 3600 |
| A | www | 82.29.178.224 | 3600 |

> ⚠️ DNS propagation can take up to 24-48 hours

### 2. Prepare Your Environment File
Create `.env.local` with your Google Sheets credentials:
```env
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
NEXT_PUBLIC_SITE_URL=https://puresakurahealing.com
```

---

## 🚀 Deployment Steps

### Step 1: Connect to Your VPS
```bash
ssh root@82.29.178.224
```

### Step 2: Update System & Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install Git
apt install -y git
```

### Step 3: Create Application Directory
```bash
mkdir -p /var/www/puresakurahealing.com
cd /var/www/puresakurahealing.com
```

### Step 4: Upload Your Project

**Option A: Using Git (Recommended)**
```bash
# If you have a Git repository
git clone https://github.com/YOUR_USERNAME/pure-sakura-spa.git .
```

**Option B: Using SCP (From your local machine)**
```bash
# Run this from your Windows machine (PowerShell/CMD)
# First, create a zip of your project (excluding node_modules)
scp pure-sakura-spa.zip root@82.29.178.224:/var/www/puresakurahealing.com/

# Then on the VPS
cd /var/www/puresakurahealing.com
unzip pure-sakura-spa.zip
```

**Option C: Using SFTP**
Use FileZilla or WinSCP:
- Host: 82.29.178.224
- Username: root
- Password: your VPS password
- Upload files to: /var/www/puresakurahealing.com

### Step 5: Setup Environment Variables
```bash
cd /var/www/puresakurahealing.com

# Create .env.local file
nano .env.local
```

Paste your environment variables:
```env
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
NEXT_PUBLIC_SITE_URL=https://puresakurahealing.com
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Install Dependencies & Build
```bash
cd /var/www/puresakurahealing.com

# Install dependencies
npm ci

# Build the application
npm run build
```

### Step 7: Setup PM2 Process Manager
```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs

# Verify it's running
pm2 status
pm2 logs pure-sakura-spa
```

### Step 8: Configure Nginx
```bash
# Copy nginx config
cp /var/www/puresakurahealing.com/nginx.conf /etc/nginx/sites-available/puresakurahealing.com

# Create symlink
ln -sf /etc/nginx/sites-available/puresakurahealing.com /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# If test passes, restart nginx
systemctl restart nginx
```

### Step 9: Setup SSL Certificate
> ⚠️ Make sure your DNS is pointing to your VPS before this step!

```bash
# Get SSL certificate (without SSL first - comment out SSL lines in nginx.conf temporarily)
# Or use this simpler approach:
certbot --nginx -d puresakurahealing.com -d www.puresakurahealing.com
```

Follow the prompts:
1. Enter your email: pshealing250@gmail.com
2. Agree to terms: Y
3. Share email: N (optional)
4. Redirect HTTP to HTTPS: 2 (Yes)

### Step 10: Configure Firewall
```bash
# Allow Nginx
ufw allow 'Nginx Full'

# Allow SSH
ufw allow OpenSSH

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## ✅ Verification

1. **Check if app is running:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Check Nginx:**
   ```bash
   systemctl status nginx
   ```

3. **Visit your site:**
   - http://82.29.178.224 (should redirect to HTTPS)
   - https://puresakurahealing.com

---

## 🔧 Common Commands

### Application Management
```bash
# View logs
pm2 logs pure-sakura-spa

# Restart app
pm2 restart pure-sakura-spa

# Stop app
pm2 stop pure-sakura-spa

# View app status
pm2 status
```

### Updates & Redeployment
```bash
cd /var/www/puresakurahealing.com

# Pull latest changes (if using Git)
git pull origin main

# Install new dependencies
npm ci

# Rebuild
npm run build

# Restart PM2
pm2 restart pure-sakura-spa
```

### Nginx Management
```bash
# Test config
nginx -t

# Restart
systemctl restart nginx

# View logs
tail -f /var/log/nginx/error.log
```

### SSL Certificate Renewal
```bash
# Test renewal
certbot renew --dry-run

# Force renewal
certbot renew
```

---

## 🐛 Troubleshooting

### App not starting?
```bash
# Check PM2 logs
pm2 logs pure-sakura-spa --lines 100

# Check if port 3000 is in use
lsof -i :3000
```

### 502 Bad Gateway?
```bash
# Make sure app is running
pm2 status

# Check if it's listening on port 3000
curl http://localhost:3000
```

### SSL certificate issues?
```bash
# Make sure DNS is pointing to your VPS
dig puresakurahealing.com

# Re-run certbot
certbot --nginx -d puresakurahealing.com -d www.puresakurahealing.com
```

### Permission issues?
```bash
# Fix ownership
chown -R www-data:www-data /var/www/puresakurahealing.com
chmod -R 755 /var/www/puresakurahealing.com
```

---

## 📞 Support

If you encounter issues, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `tail -f /var/log/nginx/error.log`
3. System logs: `journalctl -xe`
