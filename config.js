// 应用配置文件
const CONFIG = {
    // 后端API地址配置
    // 开发环境：本地后端服务
    development: {
        apiBaseURL: 'http://localhost:8080',
        corsEnabled: true
    },
    // 生产环境：部署后的后端地址
    production: {
        apiBaseURL: 'http://43.138.140.233:8080',
        corsEnabled: false
    },
    // 当前环境（development 或 production）
    // 可以根据 hostname 和 protocol 自动判断，或手动设置
    currentEnv: (function() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // 如果是本地文件协议或本地主机，使用开发环境
        if (protocol === 'file:' || 
            hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname === '' ||
            hostname.endsWith('.local')) {
            return 'development';
        }
        
        return 'production';
    })()
};

// 获取当前环境配置
function getCurrentConfig() {
    return CONFIG[CONFIG.currentEnv];
}

// 调试函数：显示当前环境信息
function showEnvironmentInfo() {
    console.log('=== 环境配置信息 ===');
    console.log('当前URL:', window.location.href);
    console.log('协议:', window.location.protocol);
    console.log('主机名:', window.location.hostname);
    console.log('检测到的环境:', CONFIG.currentEnv);
    console.log('API地址:', getCurrentConfig().apiBaseURL);
    console.log('==================');
}

// 导出配置（如果需要在其他文件中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getCurrentConfig };
}