// 应用配置文件
const CONFIG = {
    // 后端API地址配置
    // 开发环境：本地后端服务
    development: {
        apiBaseURL: 'http://localhost:8081',
        corsEnabled: true
    },
    // 生产环境：部署后的后端地址
    production: {
        apiBaseURL: 'https://api.zipingdestiny.cloud',  // 后端API域名
        corsEnabled: false
    },
    // 当前环境（development 或 production）
    // 可以根据 hostname 和 protocol 自动判断，或手动设置
    currentEnv: (function() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // 如果是file协议或本地主机，使用开发环境
        if (protocol === 'file:' || 
            hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname === '' ||
            hostname.includes('localhost')) {
            return 'development';
        }
        
        return 'production';
    })()
};

// 获取当前环境配置
function getCurrentConfig() {
    return CONFIG[CONFIG.currentEnv];
}

// 导出配置（如果需要在其他文件中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getCurrentConfig };
}