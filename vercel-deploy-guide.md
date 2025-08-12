# Vercel 部署指南

## 方法一：命令行部署

### 1. 登录 Vercel
```bash
vercel login
```
选择您的登录方式（GitHub/GitLab/Bitbucket）

### 2. 初始化项目
```bash
vercel
```
第一次运行时会询问：
- Set up and deploy? → Y
- Which scope? → 选择您的账户
- Link to existing project? → N  
- What's your project's name? → ziping-destiny
- In which directory is your code located? → ./

### 3. 生产环境部署
```bash
vercel --prod
```

### 4. 配置自定义域名
在项目部署成功后：
1. 访问 Vercel Dashboard
2. 进入项目设置 → Domains
3. 添加域名：
   - www.zipingdestiny.cloud
   - zipingdestiny.cloud

## 方法二：GitHub 集成部署

### 1. 推送代码到 GitHub
```bash
git init
git add .
git commit -m "Initial commit: 子平命理系统"
git branch -M main
git remote add origin https://github.com/您的用户名/ziping-destiny.git
git push -u origin main
```

### 2. 在 Vercel 中导入项目
1. 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 点击 "Import Project"
3. 选择您的 GitHub 仓库
4. 配置构建设置：
   - Framework Preset: Other
   - Build Command: ./deploy.sh
   - Output Directory: dist
   - Install Command: (留空)

### 3. 配置环境变量（如果需要）
在 Vercel 项目设置中添加环境变量

### 4. 添加自定义域名
项目 → Settings → Domains → Add Domain

## DNS 配置

### A 记录配置
```
类型: A
名称: @
值: 76.76.19.61
```

### CNAME 记录配置  
```
类型: CNAME
名称: www
值: cname.vercel-dns.com
```

## 验证部署

### 检查网站状态
```bash
curl -I https://www.zipingdestiny.cloud/
```

### 测试功能
1. 访问主页
2. 测试八字排盘
3. 检查报告生成
4. 验证 API 调用
