// API服务类
class ApiService {
    constructor() {
        this.baseURL = getCurrentConfig().apiBaseURL;
    }

    async calculateBazi(date, time, dateType = 'SOLAR', leapMonth = false) {
        const requestData = {
            date: date,
            time: time,
            dateType: dateType,
            leapMonth: leapMonth
        };

        try {
            const response = await fetch(`${this.baseURL}/api/bazi/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP错误: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    }

    async calculateDayun(date, time, dateType = 'SOLAR', gender, years = 80, leapMonth = false) {
        const requestData = {
            date: date,
            time: time,
            dateType: dateType,
            gender: gender,
            years: years,
            leapMonth: leapMonth
        };

        try {
            const response = await fetch(`${this.baseURL}/api/bazi/dayun`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP错误: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('大运计算API调用失败:', error);
            throw error;
        }
    }

    async calculateZiping(date, time, dateType = 'SOLAR', leapMonth = false) {
        const requestData = {
            date: date,
            time: time,
            dateType: dateType,
            leapMonth: leapMonth
        };

        try {
            const response = await fetch(`${this.baseURL}/api/bazi/ziping`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP错误: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('子平术分析API调用失败:', error);
            throw error;
        }
    }

    async getApiInfo() {
        try {
            const response = await fetch(`${this.baseURL}/api/bazi/info`);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('获取API信息失败:', error);
            throw error;
        }
    }
}

// 大运计算类（用于补充后端可能没有的大运功能）
class DayunCalculator {
    constructor() {
        this.TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        this.DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    }

    calculateDayun(yearPillar, monthPillar, gender, birthYear) {
        const yearGan = yearPillar[0];
        const monthGan = monthPillar[0];
        const monthZhi = monthPillar[1];
        
        const isYangYear = this.TIANGAN.indexOf(yearGan) % 2 === 0;
        const isMale = gender === 'MALE';
        
        let shunNi = (isYangYear && isMale) || (!isYangYear && !isMale);
        
        const dayunList = [];
        const monthGanIndex = this.TIANGAN.indexOf(monthGan);
        const monthZhiIndex = this.DIZHI.indexOf(monthZhi);
        
        for (let i = 0; i < 10; i++) {
            let ganIndex, zhiIndex;
            if (shunNi) {
                ganIndex = (monthGanIndex + i + 1) % 10;
                zhiIndex = (monthZhiIndex + i + 1) % 12;
            } else {
                ganIndex = (monthGanIndex - i - 1 + 10) % 10;
                zhiIndex = (monthZhiIndex - i - 1 + 12) % 12;
            }
            
            const startAge = 3 + i * 10;
            const endAge = 12 + i * 10;
            
            dayunList.push({
                age: `${startAge}-${endAge}岁`,
                ganzhi: this.TIANGAN[ganIndex] + this.DIZHI[zhiIndex]
            });
        }
        
        return dayunList;
    }
}

// 命理解读生成器
class InterpretationGenerator {
    constructor() {
        this.WUXING = {
            '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
            '庚': '金', '辛': '金', '壬': '水', '癸': '水',
            '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
            '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
        };
    }

    generateInterpretation(baziResponse, gender, name) {
        const dayGan = baziResponse.dayPillar[0];
        const dayZhi = baziResponse.dayPillar[1];
        const dayGanWuxing = this.WUXING[dayGan];
        
        let interpretation = `${name}，您好！根据您的生辰八字分析：\n\n`;
        
        interpretation += `【基本信息】\n`;
        interpretation += `阳历：${baziResponse.solarDate}\n`;
        interpretation += `农历：${baziResponse.lunarDate}\n`;
        interpretation += `八字：${baziResponse.bazi}\n`;
        interpretation += `日主：${dayGan}${dayZhi}，五行属${dayGanWuxing}，代表您的本命特质。\n\n`;
        
        if (baziResponse.description) {
            interpretation += `【详细说明】\n${baziResponse.description}\n\n`;
        }
        
        interpretation += `【性格特征】\n`;
        switch(dayGanWuxing) {
            case '木':
                interpretation += `您的性格如木之特性，富有生机活力，善于成长和发展。具有仁慈之心，做事有条理，但有时过于固执。\n`;
                break;
            case '火':
                interpretation += `您的性格如火之特性，热情开朗，积极主动，具有领导才能。做事雷厉风行，但有时过于急躁。\n`;
                break;
            case '土':
                interpretation += `您的性格如土之特性，稳重踏实，诚实守信，具有很好的包容性。做事认真负责，但有时过于保守。\n`;
                break;
            case '金':
                interpretation += `您的性格如金之特性，意志坚强，原则性强，具有正义感。做事果断干脆，但有时过于严厉。\n`;
                break;
            case '水':
                interpretation += `您的性格如水之特性，聪明智慧，适应能力强，具有很好的变通性。做事灵活机动，但有时过于善变。\n`;
                break;
        }
        
        interpretation += `\n【事业运势】\n`;
        interpretation += `从您的八字来看，适合从事与${dayGanWuxing}相关的行业。建议在人生的关键节点把握机遇，稳中求进。\n\n`;
        
        interpretation += `【健康提醒】\n`;
        interpretation += `注意保养与${dayGanWuxing}相关的身体部位，保持作息规律，适当运动。\n\n`;
        
        interpretation += `【人生建议】\n`;
        interpretation += `命运在自己手中，八字只是参考。保持积极向上的心态，通过努力和智慧创造美好人生。`;
        
        return interpretation;
    }
}