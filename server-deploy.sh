#!/bin/bash

# 子平命理系统 - 云服务器部署脚本
# 适用于 Ubuntu/CentOS/Debian 等 Linux 服务器

echo "🚀 子平命理系统云服务器部署脚本"
echo "=================================="

# 检查系统类型
if [ -f /etc/debian_version ]; then
    OS="debian"
    echo "📋 检测到 Debian/Ubuntu 系统"
elif [ -f /etc/redhat-release ]; then
    OS="redhat" 
    echo "📋 检测到 RedHat/CentOS 系统"
else
    echo "❌ 不支持的操作系统"
    exit 1
fi

echo ""
echo "🌐 部署选项："
echo "1) 完整部署（安装 Nginx + SSL + 防火墙配置）"
echo "2) 仅部署前端文件"
echo "3) 生成服务器配置文件"
echo "4) SSL 证书配置"

read -p "请选择 (1-4): " choice

case $choice in
  1)
    echo "🔧 开始完整部署..."
    
    # 更新系统
    echo "📦 更新系统包..."
    if [ "$OS" = "debian" ]; then
        sudo apt update && sudo apt upgrade -y
        sudo apt install -y nginx certbot python3-certbot-nginx git curl
    else
        sudo yum update -y
        sudo yum install -y nginx certbot python3-certbot-nginx git curl
        sudo systemctl enable nginx
    fi
    
    # 创建网站目录
    echo "📁 创建网站目录..."
    sudo mkdir -p /var/www/zipingdestiny
    sudo chown -R $USER:$USER /var/www/zipingdestiny
    sudo chmod -R 755 /var/www/zipingdestiny
    
    # 复制文件
    echo "📂 复制前端文件..."
    cp -r dist/* /var/www/zipingdestiny/
    
    # 生成 Nginx 配置
    echo "⚙️ 配置 Nginx..."
    sudo tee /etc/nginx/sites-available/zipingdestiny > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name www.zipingdestiny.cloud zipingdestiny.cloud;
    
    root /var/www/zipingdestiny;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 主路由 - SPA 支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # API 代理（如果后端在同一服务器）
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # 隐藏 Nginx 版本
    server_tokens off;
}
EOF
    
    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/zipingdestiny /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试 Nginx 配置
    echo "🔍 测试 Nginx 配置..."
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl restart nginx
        sudo systemctl enable nginx
        echo "✅ Nginx 配置成功"
    else
        echo "❌ Nginx 配置错误"
        exit 1
    fi
    
    # SSL 证书
    echo "🔒 配置 SSL 证书..."
    sudo certbot --nginx -d www.zipingdestiny.cloud -d zipingdestiny.cloud --non-interactive --agree-tos --email your-email@example.com
    
    # 设置 SSL 证书自动续期
    sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
    
    # 防火墙配置
    echo "🛡️ 配置防火墙..."
    if command -v ufw >/dev/null 2>&1; then
        sudo ufw allow 'Nginx Full'
        sudo ufw allow ssh
        sudo ufw --force enable
    elif command -v firewall-cmd >/dev/null 2>&1; then
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --permanent --add-service=ssh
        sudo firewall-cmd --reload
    fi
    
    echo "🎉 部署完成！"
    echo "🔗 请访问: https://www.zipingdestiny.cloud"
    ;;
    
  2)
    echo "📂 仅部署前端文件..."
    
    # 备份现有文件
    if [ -d "/var/www/zipingdestiny" ]; then
        sudo cp -r /var/www/zipingdestiny /var/www/zipingdestiny.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ 已备份现有文件"
    fi
    
    # 创建目录
    sudo mkdir -p /var/www/zipingdestiny
    sudo chown -R $USER:$USER /var/www/zipingdestiny
    
    # 复制文件
    cp -r dist/* /var/www/zipingdestiny/
    echo "✅ 前端文件部署完成"
    
    # 重启 Nginx
    sudo systemctl reload nginx
    echo "🔄 Nginx 已重新加载"
    ;;
    
  3)
    echo "📝 生成服务器配置文件..."
    
    # 生成完整的部署文档
    cat > server-setup-guide.md << 'EOF'
# 子平命理系统服务器部署指南

## 服务器要求
- Ubuntu 18.04+ / CentOS 7+ / Debian 9+
- 至少 1GB RAM，1个 CPU 核心
- 10GB 可用磁盘空间
- 公网 IP 和域名

## 域名 DNS 配置

### A 记录配置
```
类型: A
名称: @
值: 您的服务器IP
TTL: 600

类型: A  
名称: www
值: 您的服务器IP
TTL: 600
```

### CNAME 配置（可选）
```
类型: CNAME
名称: www
值: zipingdestiny.cloud
TTL: 600
```

## 手动部署步骤

### 1. 服务器基础配置
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必需软件
sudo apt install -y nginx certbot python3-certbot-nginx git curl

# 创建用户（可选）
sudo adduser zipingdestiny
sudo usermod -aG sudo zipingdestiny
```

### 2. 防火墙配置
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp  
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### 3. Nginx 配置
```bash
# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 创建站点配置文件
sudo nano /etc/nginx/sites-available/zipingdestiny
```

### 4. 站点目录准备
```bash
# 创建网站目录
sudo mkdir -p /var/www/zipingdestiny
sudo chown -R $USER:www-data /var/www/zipingdestiny
sudo chmod -R 755 /var/www/zipingdestiny
```

### 5. SSL 证书申请
```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d zipingdestiny.cloud -d www.zipingdestiny.cloud

# 设置自动续期
sudo crontab -e
# 添加这行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 监控和维护

### 系统状态检查
```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 SSL 证书
sudo certbot certificates

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 性能优化
```bash
# 启用 Nginx 缓存
# 在 nginx.conf 中添加：
# proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;
```

## 备份策略
```bash
# 网站文件备份
tar -czf /backup/zipingdestiny-$(date +%Y%m%d).tar.gz /var/www/zipingdestiny

# 数据库备份（如果有）
mysqldump -u root -p your_database > /backup/database-$(date +%Y%m%d).sql
```
EOF
    
    echo "✅ 配置文件已生成: server-setup-guide.md"
    ;;
    
  4)
    echo "🔒 SSL 证书配置..."
    
    echo "请确保域名已正确解析到此服务器"
    read -p "输入您的域名（如: zipingdestiny.cloud）: " domain
    read -p "输入您的邮箱: " email
    
    # 申请 SSL 证书
    sudo certbot --nginx -d $domain -d www.$domain --email $email --agree-tos --non-interactive
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL 证书配置成功"
        echo "🔄 设置自动续期..."
        (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
    else
        echo "❌ SSL 证书配置失败"
        echo "请检查域名解析是否正确"
    fi
    ;;
    
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac

echo ""
echo "📊 部署信息："
echo "- 网站目录: /var/www/zipingdestiny"
echo "- Nginx 配置: /etc/nginx/sites-available/zipingdestiny"
echo "- SSL 证书: Let's Encrypt"
echo "- 域名: www.zipingdestiny.cloud"
