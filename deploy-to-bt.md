# 📱 在宝塔面板部署前端

## 方法1：直接上传到宝塔服务器

### 1. 登录宝塔面板
访问：http://43.138.140.233:8888

### 2. 创建网站
- 点击 **"网站"** → **"添加站点"**
- 域名：输入你的域名或使用IP
- 根目录：`/www/wwwroot/destiny-frontend`
- 点击 **"提交"**

### 3. 上传前端文件
- 点击 **"文件"** 管理
- 进入 `/www/wwwroot/destiny-frontend/`
- 上传所有前端文件：
  - index.html
  - report.html
  - style.css
  - report.css
  - script.js
  - report.js
  - api-services.js
  - config.js
  - test-flow.html

### 4. 配置Nginx（可选）
如果需要更好的性能，可以配置Nginx：
- 点击网站 **"设置"** → **"配置文件"**
- 添加以下配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 5. 访问测试
访问：http://43.138.140.233/（或你配置的域名）

---

## 方法2：使用宝塔反向代理

### 配置反向代理
1. 在宝塔面板添加网站
2. 设置 **"反向代理"**：
   - 代理名称：frontend
   - 目标URL：http://localhost:3000
   - 用于开发环境

---

## 访问地址
- **前端**：http://43.138.140.233/
- **后端API**：http://43.138.140.233:8080
- **健康检查**：http://43.138.140.233:8080/actuator/health