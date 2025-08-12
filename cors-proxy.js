// CORS代理配置
class CorsProxy {
    constructor() {
        this.proxies = [
            // 备用CORS代理服务
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://api.allorigins.win/raw?url=',
            // 可以添加更多备用代理
        ];
        this.currentProxyIndex = 0;
    }

    getProxyUrl(originalUrl) {
        const proxy = this.proxies[this.currentProxyIndex];
        return proxy + encodeURIComponent(originalUrl);
    }

    async fetchWithProxy(url, options = {}) {
        for (let i = 0; i < this.proxies.length; i++) {
            try {
                const proxyUrl = this.getProxyUrl(url);
                console.log(`尝试使用代理 ${i + 1}: ${proxyUrl}`);
                
                const response = await fetch(proxyUrl, options);
                if (response.ok) {
                    return response;
                }
            } catch (error) {
                console.warn(`代理 ${i + 1} 失败:`, error);
                this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
            }
        }
        
        // 所有代理都失败，抛出错误
        throw new Error('所有CORS代理都不可用');
    }
}

// 导出实例
const corsProxy = new CorsProxy();