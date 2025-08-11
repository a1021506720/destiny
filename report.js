// 报告页面应用类
class ReportApp {
    constructor() {
        this.apiService = new ApiService();
        this.dayunCalculator = new DayunCalculator();
        this.interpretationGenerator = new InterpretationGenerator();
        this.userData = null;
        this.reportData = null;
        this.init();
    }

    init() {
        console.log('=== 报告页面初始化 ===');
        
        // 获取用户数据
        this.userData = this.getUserData();
        
        console.log('获取到的用户数据:', this.userData);
        
        if (!this.userData) {
            console.error('未找到用户数据');
            this.showError('未找到用户数据，请重新填写信息');
            return;
        }

        // 显示用户信息
        this.displayUserInfo();
        
        // 生成报告
        this.generateReport();
        
        // 绑定事件
        this.bindEvents();
    }

    getUserData() {
        const data = sessionStorage.getItem('destinyUserData');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('解析用户数据失败:', error);
                return null;
            }
        }
        return null;
    }

    displayUserInfo() {
        const userName = document.getElementById('userName');
        const userGender = document.getElementById('userGender');
        const userBirthInfo = document.getElementById('userBirthInfo');

        userName.textContent = this.userData.name;
        userGender.textContent = this.userData.gender === 'MALE' ? '♂ 男' : '♀ 女';
        
        const dateTypeText = this.userData.dateType === 'SOLAR' ? '公历' : '农历';
        const hourNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', 
                          '午时', '未时', '申时', '酉时', '戌时', '亥时'];
        const hourName = hourNames[parseInt(this.userData.birthHour)];
        
        userBirthInfo.innerHTML = `
            ${dateTypeText} ${this.userData.birthDate} ${hourName}
        `;
    }

    async generateReport() {
        console.log('=== 开始生成报告 ===');
        console.log('用户选择的报告类型:', this.userData.reportTypes);
        
        try {
            this.reportData = {};
            
            // 根据用户选择的报告类型调用相应API
            const reportTypes = this.userData.reportTypes || ['bazi'];
            const totalSteps = reportTypes.length + 1; // API调用 + 生成解读
            let currentStep = 0;
            
            const progressBar = document.getElementById('progressBar');
            const loadingText = document.getElementById('loadingText');
            const loadingSteps = document.getElementById('loadingSteps');
            
            for (const reportType of reportTypes) {
                // 更新进度显示
                const stepName = this.getStepName(reportType);
                loadingText.textContent = `正在${stepName}...`;
                loadingSteps.textContent = `第 ${currentStep + 1} 步，共 ${totalSteps} 步`;
                
                console.log(`正在生成 ${reportType} 报告...`);
                
                switch (reportType) {
                    case 'bazi':
                        const baziResponse = await this.apiService.calculateBazi(
                            this.userData.birthDate, 
                            this.userData.birthTime,
                            this.userData.dateType
                        );
                        console.log('八字API返回数据:', baziResponse);
                        this.reportData.bazi = baziResponse;
                        break;
                        
                    case 'dayun':
                        const dayunResponse = await this.apiService.calculateDayun(
                            this.userData.birthDate, 
                            this.userData.birthTime,
                            this.userData.dateType,
                            this.userData.gender
                        );
                        console.log('大运API返回数据:', dayunResponse);
                        this.reportData.dayun = dayunResponse;
                        break;
                        
                    case 'ziping':
                        const zipingResponse = await this.apiService.calculateZiping(
                            this.userData.birthDate, 
                            this.userData.birthTime,
                            this.userData.dateType
                        );
                        console.log('子平术API返回数据:', zipingResponse);
                        this.reportData.ziping = zipingResponse;
                        break;
                }
                
                // 更新进度条
                currentStep++;
                progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
            }
            
            // 生成基本解读（优先使用八字数据，如果没有八字数据就生成基础解读）
            if (this.reportData.bazi || reportTypes.length > 0) {
                loadingText.textContent = '正在生成个性化解读...';
                loadingSteps.textContent = `第 ${currentStep + 1} 步，共 ${totalSteps} 步`;
                
                let interpretation;
                if (this.reportData.bazi) {
                    // 基于八字生成解读
                    interpretation = this.interpretationGenerator.generateInterpretation(
                        this.reportData.bazi,
                        this.userData.gender,
                        this.userData.name
                    );
                } else {
                    // 生成基础解读
                    interpretation = this.generateBasicInterpretation();
                }
                
                this.reportData.interpretation = interpretation;
                
                // 完成进度
                currentStep++;
                progressBar.style.width = '100%';
            }
            
            loadingText.textContent = '报告生成完成，正在展示...';
            loadingSteps.textContent = '完成';
            
            console.log('最终报告数据:', this.reportData);

            // 稍微延迟一下再显示报告，让用户看到完成状态
            setTimeout(() => {
                this.displayReport();
            }, 500);

        } catch (error) {
            console.error('生成报告失败:', error);
            console.error('错误详情:', error.stack);
            this.showError(error.message || '生成报告时出现错误，请稍后重试');
        }
    }
    
    getStepName(reportType) {
        const stepNames = {
            'bazi': '计算生辰八字',
            'dayun': '分析人生大运',
            'ziping': '进行子平术分析'
        };
        return stepNames[reportType] || '处理数据';
    }
    
    generateBasicInterpretation() {
        const reportTypes = this.userData.reportTypes || [];
        const genderText = this.userData.gender === 'MALE' ? '先生' : '女士';
        
        let interpretation = `${this.userData.name}${genderText}，您好！\n\n`;
        interpretation += `根据您选择的分析类型，我们为您生成了专属的命理报告：\n\n`;
        
        if (reportTypes.includes('dayun')) {
            interpretation += `【人生大运分析】\n`;
            interpretation += `大运反映了您人生不同阶段的运势变化趋势。通过分析各个大运期的天干地支组合，可以了解每个十年大运期的特点和应注意的事项。建议结合实际情况，在有利的大运期积极进取，在不利的大运期谨慎行事。\n\n`;
        }
        
        if (reportTypes.includes('ziping')) {
            interpretation += `【子平术专业分析】\n`;
            interpretation += `子平术是传统命理学的重要分支，通过五行生克制化、十神相互关系、十二宫位分析等方法，深入剖析个人的性格特质、事业发展、财运状况、感情婚姻等各个方面。这是一套完整的命理分析体系，为您提供全方位的人生指导。\n\n`;
        }
        
        interpretation += `【温馨提示】\n`;
        interpretation += `命理分析仅供参考，真正的人生掌握在自己手中。建议您：\n`;
        interpretation += `• 保持积极乐观的心态\n`;
        interpretation += `• 通过自身努力改善命运\n`;
        interpretation += `• 理性对待命理建议\n`;
        interpretation += `• 在重要决策时多方考虑\n\n`;
        
        interpretation += `愿您前程似锦，生活美满！`;
        
        return interpretation;
    }

    displayReport() {
        // 隐藏加载状态
        document.getElementById('loadingSection').style.display = 'none';
        
        // 显示报告内容
        document.getElementById('reportContent').style.display = 'block';
        
        // 根据用户选择的报告类型显示相应内容
        const reportTypes = this.userData.reportTypes || ['bazi'];
        
        // 隐藏所有报告部分
        document.getElementById('baziSection').style.display = 'none';
        document.getElementById('dayunSection').style.display = 'none';
        document.getElementById('zipingSection').style.display = 'none';
        document.getElementById('interpretationSection').style.display = 'none';
        
        // 根据选择显示相应部分
        if (reportTypes.includes('bazi') && this.reportData.bazi) {
            document.getElementById('baziSection').style.display = 'block';
            this.displayDateInfo();
            this.displayBazi();
            console.log('✅ 显示了八字部分');
        }
        
        if (reportTypes.includes('dayun')) {
            console.log('用户选择了大运分析，检查数据:', this.reportData.dayun);
            console.log('大运数据结构检查:', {
                exists: !!this.reportData.dayun,
                hasSteps: this.reportData.dayun && !!this.reportData.dayun.dayunSteps,
                stepsLength: this.reportData.dayun && this.reportData.dayun.dayunSteps ? this.reportData.dayun.dayunSteps.length : 0,
                keys: this.reportData.dayun ? Object.keys(this.reportData.dayun) : []
            });
            
            if (this.reportData.dayun) {
                document.getElementById('dayunSection').style.display = 'block';
                this.displayDayun();
                console.log('✅ 显示了大运部分');
            } else {
                console.log('❌ 大运数据为空，显示错误提示');
                document.getElementById('dayunSection').style.display = 'block';
                document.getElementById('dayunDisplay').innerHTML = '<p>大运数据加载失败，请重试</p>';
            }
        }
        
        if (reportTypes.includes('ziping')) {
            console.log('用户选择了子平术分析，检查数据:', this.reportData.ziping);
            console.log('子平术数据结构检查:', {
                exists: !!this.reportData.ziping,
                hasWuxing: this.reportData.ziping && !!this.reportData.ziping.wuxingStats,
                hasShishen: this.reportData.ziping && !!this.reportData.ziping.shishenStats,
                hasGong: this.reportData.ziping && !!this.reportData.ziping.shierGongStats,
                keys: this.reportData.ziping ? Object.keys(this.reportData.ziping) : []
            });
            
            if (this.reportData.ziping) {
                document.getElementById('zipingSection').style.display = 'block';
                this.displayZiping();
                console.log('✅ 显示了子平术部分');
            } else {
                console.log('❌ 子平术数据为空');
            }
        }
        
        // 如果有基本解读，显示解读部分
        console.log('检查解读数据:', {
            exists: !!this.reportData.interpretation,
            length: this.reportData.interpretation ? this.reportData.interpretation.length : 0,
            preview: this.reportData.interpretation ? this.reportData.interpretation.substring(0, 50) + '...' : null
        });
        
        if (this.reportData.interpretation) {
            document.getElementById('interpretationSection').style.display = 'block';
            this.displayInterpretation();
            console.log('✅ 显示了解读部分');
        } else {
            console.log('❌ 没有解读数据');
        }
        
        // 显示生成时间
        this.displayGenerationTime();
    }

    displayDateInfo() {
        const dateInfo = document.getElementById('dateInfo');
        dateInfo.innerHTML = `
            <div><strong>阳历：</strong>${this.reportData.bazi.solarDate}</div>
            <div><strong>农历：</strong>${this.reportData.bazi.lunarDate}</div>
            <div><strong>八字：</strong>${this.reportData.bazi.bazi}</div>
            ${this.reportData.bazi.description ? `<div><strong>说明：</strong>${this.reportData.bazi.description}</div>` : ''}
        `;
    }

    displayBazi() {
        const baziDisplay = document.getElementById('baziDisplay');
        baziDisplay.innerHTML = `
            <div class="pillar">
                <h3>年柱</h3>
                <span class="tiangan">${this.reportData.bazi.yearPillar[0]}</span>
                <span class="dizhi">${this.reportData.bazi.yearPillar[1]}</span>
            </div>
            <div class="pillar">
                <h3>月柱</h3>
                <span class="tiangan">${this.reportData.bazi.monthPillar[0]}</span>
                <span class="dizhi">${this.reportData.bazi.monthPillar[1]}</span>
            </div>
            <div class="pillar">
                <h3>日柱</h3>
                <span class="tiangan">${this.reportData.bazi.dayPillar[0]}</span>
                <span class="dizhi">${this.reportData.bazi.dayPillar[1]}</span>
            </div>
            <div class="pillar">
                <h3>时柱</h3>
                <span class="tiangan">${this.reportData.bazi.hourPillar[0]}</span>
                <span class="dizhi">${this.reportData.bazi.hourPillar[1]}</span>
            </div>
        `;
    }

    displayDayun() {
        const dayunDisplay = document.getElementById('dayunDisplay');
        
        console.log('显示大运数据:', this.reportData.dayun);
        
        if (!this.reportData.dayun) {
            dayunDisplay.innerHTML = '<p>暂无大运数据</p>';
            return;
        }
        
        // 检查是否是API返回的大运数据格式
        if (this.reportData.dayun.dayunSteps) {
            // 后端API返回的实际数据格式 - dayunSteps
            dayunDisplay.innerHTML = this.reportData.dayun.dayunSteps.map(dy => `
                <div class="dayun-item">
                    <div class="age">${dy.startAge}-${dy.endAge}岁</div>
                    <div class="ganzhi">${dy.ganZhi}</div>
                    <div class="dayun-desc">第${dy.step}步大运 (${dy.startYear}-${dy.endYear}年)</div>
                </div>
            `).join('');
        } else if (this.reportData.dayun.dayunList) {
            // 旧版本API返回的数据格式
            dayunDisplay.innerHTML = this.reportData.dayun.dayunList.map(dy => `
                <div class="dayun-item">
                    <div class="age">${dy.startAge}-${dy.endAge}岁</div>
                    <div class="ganzhi">${dy.tiangan}${dy.dizhi}</div>
                    ${dy.description ? `<div class="dayun-desc">${dy.description}</div>` : ''}
                </div>
            `).join('');
        } else if (Array.isArray(this.reportData.dayun)) {
            // 本地计算的数据格式
            dayunDisplay.innerHTML = this.reportData.dayun.map(dy => `
                <div class="dayun-item">
                    <div class="age">${dy.age}</div>
                    <div class="ganzhi">${dy.ganzhi}</div>
                </div>
            `).join('');
        } else {
            // 处理其他可能的数据格式
            console.log('大运数据格式:', typeof this.reportData.dayun, this.reportData.dayun);
            
            // 尝试直接显示数据结构
            if (this.reportData.dayun.periods) {
                // 如果有periods字段
                dayunDisplay.innerHTML = this.reportData.dayun.periods.map(dy => `
                    <div class="dayun-item">
                        <div class="age">${dy.startAge || dy.age}-${dy.endAge || (dy.age + 9)}岁</div>
                        <div class="ganzhi">${dy.heavenlyStem || dy.tiangan}${dy.earthlyBranch || dy.dizhi}</div>
                        ${dy.description ? `<div class="dayun-desc">${dy.description}</div>` : ''}
                    </div>
                `).join('');
            } else {
                // 显示原始数据供调试
                dayunDisplay.innerHTML = `<pre style="font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(this.reportData.dayun, null, 2)}</pre>`;
            }
        }
    }
    
    displayZiping() {
        if (!this.reportData.ziping) return;
        
        const zipingData = this.reportData.ziping;
        
        // 显示五行分析
        if (zipingData.wuxingStats) {
            const wuxingAnalysis = document.getElementById('wuxingAnalysis');
            wuxingAnalysis.innerHTML = this.renderWuxingAnalysis(zipingData.wuxingStats);
        }
        
        // 显示十神分析
        if (zipingData.shishenStats) {
            const shishenAnalysis = document.getElementById('shishenAnalysis');
            shishenAnalysis.innerHTML = this.renderShishenAnalysis(zipingData.shishenStats);
        }
        
        // 显示十二宫分析
        if (zipingData.shierGongStats) {
            const gongweiAnalysis = document.getElementById('gongweiAnalysis');
            gongweiAnalysis.innerHTML = this.renderGongweiAnalysis(zipingData.shierGongStats);
        }
        
        // 显示旺衰分析作为综合评价
        if (zipingData.wangShuaiAnalysis) {
            const zipingConclusion = document.getElementById('zipingConclusion');
            zipingConclusion.innerHTML = this.renderWangShuaiAnalysis(zipingData.wangShuaiAnalysis);
        }
    }
    
    renderWuxingAnalysis(wuxingStats) {
        if (!wuxingStats || !wuxingStats.wuxingCounts) return '<p>暂无五行分析数据</p>';
        
        const wuxingNames = {
            '金': '金',
            '木': '木',
            '水': '水',
            '火': '火',
            '土': '土'
        };
        
        return `
            <div class="wuxing-grid">
                ${Object.entries(wuxingStats.wuxingCounts).map(([element, count]) => `
                    <div class="wuxing-item">
                        <div class="element-name">${wuxingNames[element] || element}</div>
                        <div class="element-strength">强度: ${count.toFixed(1)}</div>
                        <div class="element-description">${element === wuxingStats.strongestWuxing ? '最强' : element === wuxingStats.weakestWuxing ? '最弱' : ''}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #f8f9ff; border-radius: 8px;">
                <p><strong>日主五行:</strong> ${wuxingStats.dayMasterWuxing}</p>
                <p><strong>最强五行:</strong> ${wuxingStats.strongestWuxing}</p>
                <p><strong>最弱五行:</strong> ${wuxingStats.weakestWuxing}</p>
            </div>
        `;
    }
    
    renderShishenAnalysis(shishenStats) {
        if (!shishenStats || !shishenStats.shishenCounts) return '<p>暂无十神分析数据</p>';
        
        return `
            <div class="shishen-grid">
                ${Object.entries(shishenStats.shishenCounts).map(([shen, count]) => `
                    <div class="shishen-item">
                        <div class="shen-name">${shen}</div>
                        <div class="shen-position">数量: ${count}</div>
                        <div class="shen-description">${shen === shishenStats.dominantShishen ? '主导十神' : ''}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #f8f9ff; border-radius: 8px;">
                <p><strong>主导十神:</strong> ${shishenStats.dominantShishen}</p>
                <div style="margin-top: 10px;">
                    <strong>十神详情:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${shishenStats.shishenDetails.slice(0, 5).map(detail => 
                            `<li>${detail.gan}(${detail.position}) - ${detail.shishen}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    renderGongweiAnalysis(shierGongStats) {
        if (!shierGongStats || !shierGongStats.ganZhiGong) return '<p>暂无十二宫分析数据</p>';
        
        const gongPositions = {
            '年支': '年支宫位',
            '月支': '月支宫位', 
            '日支': '日支宫位',
            '时支': '时支宫位'
        };
        
        return `
            <div class="gongwei-grid">
                ${Object.entries(shierGongStats.ganZhiGong).map(([position, gong]) => `
                    <div class="gongwei-item">
                        <div class="gong-name">${gongPositions[position] || position}</div>
                        <div class="gong-star">${gong}</div>
                        <div class="gong-description">${position === '日支' ? '本命宫位' : ''}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #f8f9ff; border-radius: 8px;">
                <p><strong>日主月令宫位:</strong> ${shierGongStats.dayMasterYuelingGong}</p>
                <div style="margin-top: 10px;">
                    <strong>宫位统计:</strong>
                    ${Object.entries(shierGongStats.gongCounts).map(([gong, count]) => 
                        `<span style="margin-right: 15px;">${gong}: ${count}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    renderWangShuaiAnalysis(wangShuaiData) {
        if (!wangShuaiData) return '<p>暂无旺衰分析数据</p>';
        
        return `
            <div style="background: #f0f2ff; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
                <h4 style="margin-top: 0; color: #667eea;">日主旺衰分析</h4>
                <p><strong>日主强度:</strong> ${wangShuaiData.dayMasterStrength}</p>
                <p><strong>强度评分:</strong> ${wangShuaiData.strengthScore.toFixed(2)}</p>
                <p><strong>月令影响:</strong> ${wangShuaiData.yuelingEffect}</p>
                
                <div style="margin-top: 15px;">
                    <p><strong>分析要点:</strong></p>
                    <p style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.7); border-radius: 5px;">
                        ${wangShuaiData.analysis}
                    </p>
                </div>
                
                ${wangShuaiData.supportFactors && wangShuaiData.supportFactors.length > 0 ? `
                <div style="margin-top: 15px;">
                    <p><strong>助力因素:</strong></p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${wangShuaiData.supportFactors.map(factor => `<li>${factor}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${wangShuaiData.weakenFactors && wangShuaiData.weakenFactors.length > 0 ? `
                <div style="margin-top: 15px;">
                    <p><strong>削弱因素:</strong></p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${wangShuaiData.weakenFactors.map(factor => `<li>${factor}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    }

    displayInterpretation() {
        const interpretationDisplay = document.getElementById('interpretationDisplay');
        interpretationDisplay.textContent = this.reportData.interpretation;
    }

    displayGenerationTime() {
        const generationTime = document.getElementById('generationTime');
        generationTime.textContent = new Date().toLocaleString('zh-CN');
    }

    showError(message) {
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'block';
        document.getElementById('errorMessage').textContent = message;
    }

    bindEvents() {
        // 分享按钮
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.showShareModal();
        });

        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // 重试按钮
        document.getElementById('retryBtn').addEventListener('click', () => {
            location.reload();
        });

        // 返回首页按钮
        document.getElementById('backToHomeBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // 分享浮层事件
        this.bindShareEvents();
    }

    showShareModal() {
        const shareModal = document.getElementById('shareModal');
        const shareUrl = document.getElementById('shareUrl');
        
        // 生成分享链接（这里简化为当前页面地址）
        shareUrl.value = window.location.href;
        
        shareModal.style.display = 'flex';
    }

    bindShareEvents() {
        // 关闭分享浮层
        document.getElementById('closeShareModal').addEventListener('click', () => {
            document.getElementById('shareModal').style.display = 'none';
        });

        // 复制链接
        document.getElementById('copyUrlBtn').addEventListener('click', () => {
            const shareUrl = document.getElementById('shareUrl');
            shareUrl.select();
            document.execCommand('copy');
            alert('链接已复制到剪贴板');
        });

        // 分享选项
        document.querySelectorAll('.share-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.handleShare(type);
            });
        });

        // 点击浮层外部关闭
        document.getElementById('shareModal').addEventListener('click', (e) => {
            if (e.target.id === 'shareModal') {
                document.getElementById('shareModal').style.display = 'none';
            }
        });
    }

    handleShare(type) {
        const shareUrl = encodeURIComponent(window.location.href);
        const shareText = encodeURIComponent(`${this.userData.name}的生辰八字命理报告`);
        
        switch (type) {
            case 'copy':
                const urlInput = document.getElementById('shareUrl');
                urlInput.select();
                document.execCommand('copy');
                alert('链接已复制到剪贴板');
                break;
                
            case 'wechat':
                // 微信分享（实际项目中需要接入微信SDK）
                alert('请复制链接到微信分享');
                break;
                
            case 'weibo':
                // 微博分享
                const weiboUrl = `https://service.weibo.com/share/share.php?url=${shareUrl}&title=${shareText}`;
                window.open(weiboUrl, '_blank');
                break;
        }
    }
}

// 初始化报告应用
document.addEventListener('DOMContentLoaded', () => {
    showEnvironmentInfo();
    new ReportApp();
});