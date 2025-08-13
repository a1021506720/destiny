// API配置
const API_CONFIG = {
    baseURL: getCurrentConfig().apiBaseURL,
    endpoints: {
        calculate: '/api/bazi/calculate',
        info: '/api/bazi/info'
    }
};


// 主应用类
class DestinyApp {
    constructor() {
        this.apiService = new ApiService();
        this.init();
    }

    async init() {
        await this.showIntroModal();
        
        const form = document.getElementById('birthForm');
        form.addEventListener('submit', this.handleSubmit.bind(this));
        
        const startBtn = document.getElementById('startBtn');
        startBtn.addEventListener('click', this.closeIntroModal.bind(this));
    }

    async showIntroModal() {
        try {
            // 设置5秒超时
            const apiInfo = await Promise.race([
                this.apiService.getApiInfo(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('请求超时')), 5000)
                )
            ]);
            this.displayIntroContent(apiInfo);
        } catch (error) {
            console.error('获取API信息失败:', error);
            this.displayIntroContent(null);
        }
    }

    displayIntroContent(apiInfo) {
        const introContent = document.getElementById('introContent');
        const startBtn = document.getElementById('startBtn');
        
        if (apiInfo) {
            introContent.innerHTML = `
                <div class="intro-text">
                    <h3>🎯 ${apiInfo.description}</h3>
                    <p>欢迎使用我们的生辰八字算命系统，基于传统命理学理论，为您提供专业的命理分析。</p>
                    
                    <h3>✨ 系统功能</h3>
                    <ul>
                        <li>精准的生辰八字计算</li>
                        <li>详细的人生大运分析</li>
                        <li>个性化的命理解读</li>
                        <li>支持公历、农历日期</li>
                    </ul>
                    
                    <h3>📋 使用说明</h3>
                    <ul>
                        <li>日期格式：${apiInfo.notes['日期格式']}</li>
                        <li>时间说明：${apiInfo.notes['子时说明']}</li>
                        <li>日期类型：${apiInfo.notes['日期类型']}</li>
                    </ul>
                    
                    <p style="margin-top: 20px; color: #999; font-size: 0.9rem;">
                        * 本系统仅供娱乐参考，请理性对待测算结果
                    </p>
                </div>
            `;
        } else {
            introContent.innerHTML = `
                <div class="intro-text">
                    <h3>🎯 生辰八字算命系统</h3>
                    <p>欢迎使用我们的生辰八字算命系统，基于传统命理学理论，为您提供专业的命理分析。</p>
                    
                    <h3>✨ 系统功能</h3>
                    <ul>
                        <li>精准的生辰八字计算</li>
                        <li>详细的人生大运分析</li>
                        <li>个性化的命理解读</li>
                        <li>支持公历、农历日期</li>
                    </ul>
                    
                    <p style="margin-top: 20px; color: #999; font-size: 0.9rem;">
                        * 本系统仅供娱乐参考，请理性对待测算结果
                    </p>
                </div>
            `;
        }
        
        startBtn.disabled = false;
    }

    closeIntroModal() {
        const modal = document.getElementById('introModal');
        const container = document.querySelector('.container');
        
        modal.style.display = 'none';
        container.classList.add('show');
    }

    handleSubmit(e) {
        e.preventDefault();
        
        console.log('=== 表单提交 ===');
        
        const formData = new FormData(e.target);
        
        // 收集报告类型选择
        const reportTypes = [];
        const reportTypeCheckboxes = document.querySelectorAll('input[name="reportType"]:checked');
        reportTypeCheckboxes.forEach(checkbox => {
            reportTypes.push(checkbox.value);
        });
        
        const userData = {
            name: formData.get('name'),
            gender: formData.get('gender'),
            dateType: formData.get('dateType'),
            birthDate: formData.get('birthDate'),
            birthHour: formData.get('birthHour'),
            reportTypes: reportTypes
        };
        
        console.log('用户输入数据:', userData);
        
        if (!userData.name || !userData.gender || !userData.birthDate || !userData.birthHour) {
            this.showError('请填写完整信息');
            return;
        }
        
        if (reportTypes.length === 0) {
            this.showError('请至少选择一种分析类型');
            return;
        }
        
        // 转换时辰为时间格式
        const hourMapping = {
            '0': '23:30', '1': '01:30', '2': '03:30', '3': '05:30',
            '4': '07:30', '5': '09:30', '6': '11:30', '7': '13:30',
            '8': '15:30', '9': '17:30', '10': '19:30', '11': '21:30'
        };
        
        userData.birthTime = hourMapping[userData.birthHour];
        
        console.log('处理后的用户数据:', userData);
        
        // 跳转到报告页面
        this.navigateToReport(userData);
    }

    navigateToReport(userData) {
        // 将用户数据存储到sessionStorage
        sessionStorage.setItem('destinyUserData', JSON.stringify(userData));
        
        // 跳转到报告页面
        window.location.href = 'report.html';
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.remove();
        }

        const newErrorDiv = document.createElement('div');
        newErrorDiv.id = 'errorMessage';
        newErrorDiv.className = 'error-message';
        newErrorDiv.textContent = message;
        
        const form = document.getElementById('birthForm');
        form.appendChild(newErrorDiv);
        
        setTimeout(() => {
            newErrorDiv.remove();
        }, 5000);
    }
}

// 显示环境信息函数
function showEnvironmentInfo() {
    const config = getCurrentConfig();
    console.log('🌍 环境信息:', {
        当前环境: CONFIG.currentEnv,
        API地址: config.apiBaseURL,
        CORS启用: config.corsEnabled,
        页面协议: window.location.protocol,
        主机名: window.location.hostname
    });
}

// 初始化应用（仅在主页面）
document.addEventListener('DOMContentLoaded', () => {
    // 显示环境配置信息（方便调试）
    showEnvironmentInfo();
    
    // 只在主页面初始化应用
    if (document.getElementById('birthForm')) {
        new DestinyApp();
    }
});