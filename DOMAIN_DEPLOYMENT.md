# 子平命理系统域名部署指南

## 域名信息
- **主域名**: https://www.zipingdestiny.cloud/
- **备用域名**: https://zipingdestiny.cloud/
- **API域名**: https://api.zipingdestiny.cloud/

## 部署方案

### 方案一：Vercel 部署（推荐）

#### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 步骤 2: 登录 Vercel
```bash
vercel login
```

#### 步骤 3: 部署项目
```bash
# 首次部署
vercel

# 生产环境部署
vercel --prod
```

#### 步骤 4: 配置自定义域名
1. 在 Vercel Dashboard 中进入项目设置
2. 点击 "Domains" 选项卡
3. 添加域名：
   - `www.zipingdestiny.cloud`
   - `zipingdestiny.cloud`
4. 按照 Vercel 提供的 DNS 配置说明设置域名解析

#### DNS 配置示例
```
类型    名称    值
A       @       76.76.19.61  (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

### 方案二：Netlify 部署

#### 步骤 1: 安装 Netlify CLI
```bash
npm install -g netlify-cli
```

#### 步骤 2: 登录 Netlify
```bash
netlify login
```

#### 步骤 3: 部署
```bash
# 构建项目
./deploy.sh

# 部署到 Netlify
netlify deploy --prod --dir=dist
```

#### 步骤 4: 配置域名
在 Netlify Dashboard 中配置自定义域名

### 方案三：传统服务器部署

#### 步骤 1: 构建项目
```bash
./deploy.sh
```

#### 步骤 2: 上传文件
将 `dist` 目录中的所有文件上传到服务器的 web 根目录

#### 步骤 3: 配置 Nginx（推荐）
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.zipingdestiny.cloud zipingdestiny.cloud;
    
    # SSL 配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # 网站根目录
    root /var/www/zipingdestiny;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

## 后端配置

### API 域名配置
确保后端服务部署到 `https://api.zipingdestiny.cloud/`

### CORS 配置
后端需要允许来自前端域名的请求：
```javascript
// 允许的域名
const allowedOrigins = [
    'https://www.zipingdestiny.cloud',
    'https://zipingdestiny.cloud',
    'http://localhost:8000',  // 开发环境
    'http://127.0.0.1:8000'   // 开发环境
];
```

## 验证部署

### 1. 检查域名解析
```bash
nslookup www.zipingdestiny.cloud
nslookup zipingdestiny.cloud
```

### 2. 检查 SSL 证书
```bash
curl -I https://www.zipingdestiny.cloud/
```

### 3. 功能测试
- 访问 https://www.zipingdestiny.cloud/
- 测试八字排盘功能
- 检查 API 调用是否正常

## 监控和维护

### 1. 设置监控
- 使用 Uptime Robot 或类似服务监控网站可用性
- 配置 SSL 证书过期提醒

### 2. 备份
- 定期备份网站文件
- 备份域名配置和 SSL 证书

### 3. 更新流程
```bash
# 1. 开发新功能
# 2. 本地测试
npm run start

# 3. 部署到生产环境
vercel --prod
# 或
netlify deploy --prod --dir=dist
```

## 注意事项

1. **SSL 证书**: 确保使用 HTTPS，可以使用 Let's Encrypt 免费证书
2. **CDN**: 考虑使用 CDN 加速静态资源加载
3. **SEO**: 配置适当的 meta 标签和 robots.txt
4. **分析**: 集成 Google Analytics 或其他分析工具
5. **错误监控**: 集成 Sentry 等错误监控服务
