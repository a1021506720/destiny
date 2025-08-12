// HTTPS混合内容临时解决方案

// 检测是否是HTTPS环境
function isHttpsEnvironment() {
    return window.location.protocol === 'https:';
}

// 获取适合当前环境的API基础URL
function getApiBaseURL() {
    const config = getCurrentConfig();
    
    // 如果是HTTPS环境但API是HTTP，使用代理
    if (isHttpsEnvironment() && config.apiBaseURL.startsWith('http:')) {
        console.warn('检测到HTTPS混合内容问题，使用代理服务');
        // 方案1：使用allorigins代理
        return `https://api.allorigins.win/raw?url=${encodeURIComponent(config.apiBaseURL)}`;
        
        // 方案2：使用codetabs代理（备用）
        // return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(config.apiBaseURL)}`;
    }
    
    return config.apiBaseURL;
}

// 修改原有的getCurrentConfig函数
const originalGetCurrentConfig = getCurrentConfig;
getCurrentConfig = function() {
    const config = originalGetCurrentConfig();
    // 动态调整API地址
    config.apiBaseURL = getApiBaseURL();
    return config;
};

// 在页面加载时显示警告信息
document.addEventListener('DOMContentLoaded', function() {
    if (isHttpsEnvironment() && originalGetCurrentConfig().apiBaseURL.startsWith('http:')) {
        console.warn('⚠️ 当前使用HTTPS访问，但后端API是HTTP，正在使用代理服务');
        console.info('💡 建议为后端API配置SSL证书以获得最佳性能');
    }
});