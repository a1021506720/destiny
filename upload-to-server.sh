#!/bin/bash

# 上传到云服务器脚本

echo "📤 子平命理系统 - 上传到云服务器"
echo "================================="

# 检查构建文件
if [ ! -d "dist" ]; then
    echo "❌ 构建目录不存在，请先运行: ./deploy.sh"
    exit 1
fi

echo "请输入服务器信息："
read -p "服务器 IP 地址: " SERVER_IP
read -p "用户名 (默认: root): " USERNAME
USERNAME=${USERNAME:-root}
read -p "SSH 端口 (默认: 22): " SSH_PORT
SSH_PORT=${SSH_PORT:-22}

echo ""
echo "📋 选择操作："
echo "1) 仅上传前端文件"
echo "2) 上传文件 + 配置 Nginx"
echo "3) 完整部署（文件 + Nginx + SSL）"

read -p "请选择 (1-3): " choice

case $choice in
  1)
    echo "📂 上传前端文件到服务器..."
    
    # 创建服务器目录
    ssh -p $SSH_PORT $USERNAME@$SERVER_IP "sudo mkdir -p /var/www/zipingdestiny && sudo chown -R $USERNAME:$USERNAME /var/www/zipingdestiny"
    
    # 上传文件
    scp -P $SSH_PORT -r dist/* $USERNAME@$SERVER_IP:/var/www/zipingdestiny/
    
    if [ $? -eq 0 ]; then
        echo "✅ 文件上传成功"
        echo "🔄 重启 Nginx..."
        ssh -p $SSH_PORT $USERNAME@$SERVER_IP "sudo systemctl reload nginx"
    else
        echo "❌ 文件上传失败"
        exit 1
    fi
    ;;
    
  2)
    echo "⚙️ 上传文件并配置 Nginx..."
    
    # 上传前端文件
    ssh -p $SSH_PORT $USERNAME@$SERVER_IP "sudo mkdir -p /var/www/zipingdestiny && sudo chown -R $USERNAME:$USERNAME /var/www/zipingdestiny"
    scp -P $SSH_PORT -r dist/* $USERNAME@$SERVER_IP:/var/www/zipingdestiny/
    
    # 上传 Nginx 配置
    scp -P $SSH_PORT nginx-config.conf $USERNAME@$SERVER_IP:/tmp/zipingdestiny.conf
    
    # 配置 Nginx
    ssh -p $SSH_PORT $USERNAME@$SERVER_IP << 'ENDSSH'
sudo mv /tmp/zipingdestiny.conf /etc/nginx/sites-available/zipingdestiny
sudo ln -sf /etc/nginx/sites-available/zipingdestiny /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx 配置成功"
        echo "⚠️ 请手动配置 SSL 证书："
        echo "ssh $USERNAME@$SERVER_IP"
        echo "sudo certbot --nginx -d www.zipingdestiny.cloud -d zipingdestiny.cloud"
    else
        echo "❌ Nginx 配置失败"
    fi
    ;;
    
  3)
    echo "🚀 完整部署..."
    
    # 上传部署脚本
    scp -P $SSH_PORT server-deploy.sh $USERNAME@$SERVER_IP:/tmp/
    
    # 上传前端文件
    ssh -p $SSH_PORT $USERNAME@$SERVER_IP "mkdir -p /tmp/zipingdestiny-frontend"
    scp -P $SSH_PORT -r dist/* $USERNAME@$SERVER_IP:/tmp/zipingdestiny-frontend/
    
    echo "📝 在服务器上执行部署脚本..."
    ssh -p $SSH_PORT $USERNAME@$SERVER_IP << 'ENDSSH'
chmod +x /tmp/server-deploy.sh
cd /tmp
# 将前端文件移动到正确位置
sudo mkdir -p /var/www/zipingdestiny
sudo cp -r zipingdestiny-frontend/* /var/www/zipingdestiny/
sudo chown -R www-data:www-data /var/www/zipingdestiny
sudo chmod -R 755 /var/www/zipingdestiny

echo "请在服务器上手动运行: sudo /tmp/server-deploy.sh"
echo "或者按照以下步骤操作："
echo "1. 安装 Nginx: sudo apt install nginx -y"
echo "2. 配置站点: sudo cp nginx-config.conf /etc/nginx/sites-available/zipingdestiny"
echo "3. 启用站点: sudo ln -s /etc/nginx/sites-available/zipingdestiny /etc/nginx/sites-enabled/"
echo "4. 测试配置: sudo nginx -t"
echo "5. 重启服务: sudo systemctl restart nginx"
echo "6. 申请SSL: sudo certbot --nginx -d www.zipingdestiny.cloud"
ENDSSH
    ;;
    
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac

echo ""
echo "🎉 操作完成！"
echo "🔗 请访问: https://www.zipingdestiny.cloud"
echo ""
echo "📝 后续步骤："
echo "1. 确保域名 DNS 解析到服务器 IP: $SERVER_IP"
echo "2. 配置 SSL 证书（如果还未配置）"
echo "3. 测试网站功能"

# 生成 DNS 配置提示
echo ""
echo "📋 DNS 配置参考："
echo "类型    名称    值"
echo "A       @       $SERVER_IP"
echo "A       www     $SERVER_IP"
