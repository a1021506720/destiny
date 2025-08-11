# 生辰八字算命 Web 应用

一个基于传统中国命理学的生辰八字算命web应用，提供八字排盘、大运计算和命理解读功能。支持前后端分离架构。

## 功能特性

- 🎯 **精准八字计算** - 通过后端API计算准确的生辰八字
- 🔮 **大运排盘** - 计算人生各阶段大运走势
- 📖 **智能解读** - 基于五行理论提供性格、事业、健康建议
- 💫 **简约设计** - 现代化UI界面，支持移动端访问
- 🔗 **前后端分离** - 前端负责展示，后端负责计算
- ⚡ **异步处理** - 支持加载状态和错误处理

## 技术栈

### 前端
- HTML5
- CSS3 (响应式设计)
- Vanilla JavaScript
- Fetch API 用于后端通信

### 后端
- Java Spring Boot
- REST API 接口
- 传统干支纪年算法

## 项目结构

```
destiny/
├── index.html          # 主页面（用户输入）
├── report.html         # 报告展示页面
├── test.html           # API测试页面
├── style.css           # 公共样式文件
├── report.css          # 报告页面专用样式
├── script.js           # 主页面逻辑和API调用
├── report.js           # 报告页面逻辑
├── config.js           # 配置文件（API地址等）
└── README.md           # 项目说明
```

## 使用方法

### 1. 启动后端服务
确保后端项目 `destiny_online` 正在运行：
```bash
cd /Users/zenghao/Documents/project/destiny_online
./mvnw spring-boot:run
```
后端将在 `http://localhost:8080` 启动

### 2. 配置前端
在 `config.js` 中配置正确的后端地址：
```javascript
development: {
    apiBaseURL: 'http://localhost:8080'
}
```

### 3. 访问应用
1. 打开 `index.html` 文件
2. 阅读系统介绍，点击"开始测算"
3. 输入姓名、性别、日期类型（公历/农历）、出生日期和时辰
4. 点击"生成命理报告"按钮
5. 自动跳转到专业的报告展示页面
6. 可分享报告或重新测算

### 4. API测试
打开 `test.html` 文件可以单独测试后端API的连接状态和功能。

## 🌐 在线部署

### 后端部署 (Railway)
1. 创建GitHub仓库推送后端代码
2. Railway自动检测Spring Boot项目
3. 获得生产URL: `https://destiny-online-production.up.railway.app`

### 前端部署 (推荐Vercel)
1. 创建GitHub仓库推送前端代码  
2. Vercel自动部署静态网站
3. 自动识别生产环境切换API地址

### 部署后的完整链接
- 前端: [待部署后更新]
- 后端API: `https://destiny-online-production.up.railway.app`

## 算法说明

- 采用传统干支纪年法计算八字
- 基于五行相生相克理论
- 考虑性别差异的大运起法
- 结合现代心理学的性格分析

## 免责声明

本应用仅供娱乐参考，不构成任何人生建议。命运掌握在自己手中，请理性对待算命结果。

## 开发者

如需定制开发或技术咨询，欢迎联系。