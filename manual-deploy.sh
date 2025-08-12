#!/bin/bash

# 针对服务器 43.138.140.233 的手动部署脚本

SERVER_IP="43.138.140.233"
USERNAME="root"

echo "🚀 子平命理系统 - 手动部署到 $SERVER_IP"
echo "============================================"

echo "📋 选择操作："
echo "1) 重新上传前端文件"
echo "2) 仅配置服务器环境"
echo "3) 完整手动部署"
echo "4) 检查服务器状态"

read -p "请选择 (1-4): " choice

case $choice in
  1)
    echo "📤 重新上传前端文件..."
    
    # 先在服务器创建目录
    ssh $USERNAME@$SERVER_IP "mkdir -p /tmp/zipingdestiny-dist && mkdir -p /var/www/zipingdestiny"
    
    # 上传前端文件
    scp -r dist/* $USERNAME@$SERVER_IP:/tmp/zipingdestiny-dist/
    
    # 移动文件到正确位置
    ssh $USERNAME@$SERVER_IP << 'ENDSSH'
cp -r /tmp/zipingdestiny-dist/* /var/www/zipingdestiny/
chown -R root:root /var/www/zipingdestiny/
chmod -R 755 /var/www/zipingdestiny/
ls -la /var/www/zipingdestiny/
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo "✅ 前端文件上传成功"
    else
        echo "❌ 前端文件上传失败"
    fi
    ;;
    
  2)
    echo "⚙️ 配置服务器环境..."
    
    ssh $USERNAME@$SERVER_IP << 'ENDSSH'
# 检查系统类型
if command -v apt-get >/dev/null 2>&1; then
    echo "📋 检测到 Ubuntu/Debian 系统"
    
    # 更新系统
    apt update
    
    # 安装必需软件
    apt install -y nginx certbot python3-certbot-nginx
    
    # 启动服务
    systemctl enable nginx
    systemctl start nginx
    
elif command -v yum >/dev/null 2>&1; then
    echo "📋 检测到 CentOS/RHEL 系统"
    
    # 更新系统
    yum update -y
    
    # 安装必需软件
    yum install -y nginx certbot python3-certbot-nginx
    
    # 启动服务
    systemctl enable nginx
    systemctl start nginx
else
    echo "❌ 不支持的操作系统"
fi

# 检查服务状态
systemctl status nginx --no-pager
ENDSSH
    ;;
    
  3)
    echo "🚀 完整手动部署..."
    
    # 步骤1: 上传前端文件
    echo "📤 步骤1: 上传前端文件..."
    ssh $USERNAME@$SERVER_IP "mkdir -p /var/www/zipingdestiny"
    scp -r dist/* $USERNAME@$SERVER_IP:/var/www/zipingdestiny/
    
    # 步骤2: 上传配置文件
    echo "⚙️ 步骤2: 上传配置文件..."
    scp nginx-config.conf $USERNAME@$SERVER_IP:/tmp/zipingdestiny.conf
    
    # 步骤3: 配置服务器
    echo "🔧 步骤3: 配置服务器..."
    ssh $USERNAME@$SERVER_IP << 'ENDSSH'
# 安装 Nginx
if command -v apt-get >/dev/null 2>&1; then
    apt update && apt install -y nginx certbot python3-certbot-nginx
elif command -v yum >/dev/null 2>&1; then
    yum update -y && yum install -y nginx certbot python3-certbot-nginx
fi

# 配置网站目录权限
chown -R root:root /var/www/zipingdestiny/
chmod -R 755 /var/www/zipingdestiny/

# 配置 Nginx
cp /tmp/zipingdestiny.conf /etc/nginx/sites-available/zipingdestiny 2>/dev/null || \
cp /tmp/zipingdestiny.conf /etc/nginx/conf.d/zipingdestiny.conf

# 启用站点 (Ubuntu/Debian)
if [ -d "/etc/nginx/sites-enabled" ]; then
    ln -sf /etc/nginx/sites-available/zipingdestiny /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
fi

# 测试配置
nginx -t

# 启动服务
systemctl enable nginx
systemctl restart nginx

# 检查状态
systemctl status nginx --no-pager

# 显示监听端口
netstat -tulpn | grep nginx || ss -tulpn | grep nginx

echo "✅ 基础配置完成"
echo "📝 接下来需要配置 SSL 证书"
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo "✅ 服务器配置成功"
        echo "🔒 现在配置 SSL 证书..."
        
        ssh $USERNAME@$SERVER_IP << 'ENDSSH'
echo "🔒 配置 SSL 证书..."
certbot --nginx -d www.zipingdestiny.cloud -d zipingdestiny.cloud --non-interactive --agree-tos --email admin@zipingdestiny.cloud --redirect

if [ $? -eq 0 ]; then
    echo "✅ SSL 证书配置成功"
    # 设置自动续期
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
else
    echo "⚠️ SSL 证书配置失败，可能需要等待 DNS 解析生效"
    echo "手动执行: certbot --nginx -d www.zipingdestiny.cloud -d zipingdestiny.cloud"
fi
ENDSSH
    else
        echo "❌ 服务器配置失败"
    fi
    ;;
    
  4)
    echo "📊 检查服务器状态..."
    
    ssh $USERNAME@$SERVER_IP << 'ENDSSH'
echo "🔍 系统信息:"
uname -a
echo ""

echo "📂 网站文件:"
ls -la /var/www/zipingdestiny/ 2>/dev/null || echo "网站目录不存在"
echo ""

echo "⚙️ Nginx 状态:"
systemctl status nginx --no-pager 2>/dev/null || echo "Nginx 未安装或未运行"
echo ""

echo "🌐 端口监听:"
netstat -tulpn | grep :80 2>/dev/null || ss -tulpn | grep :80 2>/dev/null || echo "端口80未监听"
netstat -tulpn | grep :443 2>/dev/null || ss -tulpn | grep :443 2>/dev/null || echo "端口443未监听"
echo ""

echo "🔒 SSL 证书:"
ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "SSL 证书未配置"
echo ""

echo "🛡️ 防火墙状态:"
ufw status 2>/dev/null || firewall-cmd --list-all 2>/dev/null || iptables -L INPUT -n 2>/dev/null || echo "防火墙信息获取失败"
ENDSSH
    ;;
    
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac

echo ""
echo "🎯 部署完成后请检查:"
echo "1. DNS 解析: ping www.zipingdestiny.cloud"
echo "2. HTTP 访问: curl -I http://$SERVER_IP"  
echo "3. HTTPS 访问: curl -I https://www.zipingdestiny.cloud"
echo "4. 网站功能: 在浏览器中测试八字排盘功能"
