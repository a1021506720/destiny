// 天干地支数据
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHICHEN = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

// 五行属性
const WUXING = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
    '庚': '金', '辛': '金', '壬': '水', '癸': '水',
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 十神关系
const SHISHEN = {
    '同': '比肩', '劫': '劫财', '食': '食神', '伤': '伤官', '财': '正财',
    '偏财': '偏财', '官': '正官', '杀': '七杀', '印': '正印', '枭': '偏印'
};

class BaZiCalculator {
    constructor() {
        this.lunarData = this.initLunarData();
    }

    // 简化的阴历数据初始化
    initLunarData() {
        return {
            1900: [1, 31, 0, 49, 0, 38, 1, 27, 0, 46, 0, 35, 0, 23, 1, 42, 0, 31, 1, 21, 0, 40, 0, 29]
        };
    }

    // 计算干支纪年
    getYearGanZhi(year) {
        // 从1864年甲子年开始计算
        const baseYear = 1864;
        const yearDiff = year - baseYear;
        const ganIndex = yearDiff % 10;
        const zhiIndex = yearDiff % 12;
        return TIANGAN[ganIndex] + DIZHI[zhiIndex];
    }

    // 计算干支纪月
    getMonthGanZhi(year, month) {
        // 简化计算，实际应该考虑节气
        const yearGanIndex = (year - 1864) % 10;
        const monthGanIndex = (yearGanIndex * 2 + month - 1) % 10;
        const monthZhiIndex = (month - 1) % 12;
        return TIANGAN[monthGanIndex] + DIZHI[monthZhiIndex];
    }

    // 计算干支纪日
    getDayGanZhi(date) {
        // 使用简化的儒略日计算
        const baseDate = new Date(1900, 0, 1);
        const diffTime = date.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // 1900年1月1日是庚戌日
        const baseDayGanIndex = 6; // 庚
        const baseDayZhiIndex = 10; // 戌
        
        const dayGanIndex = (baseDayGanIndex + diffDays) % 10;
        const dayZhiIndex = (baseDayZhiIndex + diffDays) % 12;
        
        return TIANGAN[dayGanIndex] + DIZHI[dayZhiIndex];
    }

    // 计算干支纪时
    getHourGanZhi(hour, dayGan) {
        const hourZhiIndex = Math.floor((hour + 1) / 2) % 12;
        const dayGanIndex = TIANGAN.indexOf(dayGan);
        const hourGanIndex = (dayGanIndex * 2 + hourZhiIndex) % 10;
        
        return TIANGAN[hourGanIndex] + DIZHI[hourZhiIndex];
    }

    // 计算生辰八字
    calculateBaZi(birthDate, birthTime) {
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthTime.getHours();

        const yearGanZhi = this.getYearGanZhi(year);
        const monthGanZhi = this.getMonthGanZhi(year, month);
        const dayGanZhi = this.getDayGanZhi(birthDate);
        const hourGanZhi = this.getHourGanZhi(hour, dayGanZhi[0]);

        return {
            year: yearGanZhi,
            month: monthGanZhi,
            day: dayGanZhi,
            hour: hourGanZhi
        };
    }

    // 计算大运
    calculateDaYun(baZi, gender, birthDate) {
        const monthZhi = baZi.month[1];
        const yearGan = baZi.year[0];
        const dayGan = baZi.day[0];
        
        // 简化的起运计算
        const isYangYear = TIANGAN.indexOf(yearGan) % 2 === 0;
        const isMale = gender === 'male';
        
        let shunNi = (isYangYear && isMale) || (!isYangYear && !isMale);
        
        const dayunList = [];
        const monthGanIndex = TIANGAN.indexOf(baZi.month[0]);
        const monthZhiIndex = DIZHI.indexOf(baZi.month[1]);
        
        for (let i = 0; i < 10; i++) {
            let ganIndex, zhiIndex;
            if (shunNi) {
                ganIndex = (monthGanIndex + i + 1) % 10;
                zhiIndex = (monthZhiIndex + i + 1) % 12;
            } else {
                ganIndex = (monthGanIndex - i - 1 + 10) % 10;
                zhiIndex = (monthZhiIndex - i - 1 + 12) % 12;
            }
            
            dayunList.push({
                age: `${3 + i * 10}-${12 + i * 10}岁`,
                ganzhi: TIANGAN[ganIndex] + DIZHI[zhiIndex]
            });
        }
        
        return dayunList;
    }

    // 生成命理解读
    generateInterpretation(baZi, gender, name) {
        const dayGan = baZi.day[0];
        const dayZhi = baZi.day[1];
        const dayGanWuxing = WUXING[dayGan];
        const monthGan = baZi.month[0];
        const monthWuxing = WUXING[monthGan];
        
        let interpretation = `${name}，您好！根据您的生辰八字分析：\n\n`;
        
        interpretation += `【基本信息】\n`;
        interpretation += `日主：${dayGan}${dayZhi}，五行属${dayGanWuxing}，代表您的本命特质。\n\n`;
        
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

// 主应用类
class DestinyApp {
    constructor() {
        this.calculator = new BaZiCalculator();
        this.init();
    }

    init() {
        const form = document.getElementById('birthForm');
        form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const gender = formData.get('gender');
        const birthDateStr = formData.get('birthDate');
        const birthTimeStr = formData.get('birthTime');
        
        if (!name || !gender || !birthDateStr || !birthTimeStr) {
            alert('请填写完整信息');
            return;
        }
        
        const birthDate = new Date(birthDateStr);
        const [hours, minutes] = birthTimeStr.split(':');
        const birthTime = new Date();
        birthTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        this.calculate(name, gender, birthDate, birthTime);
    }

    calculate(name, gender, birthDate, birthTime) {
        try {
            // 计算生辰八字
            const baZi = this.calculator.calculateBaZi(birthDate, birthTime);
            
            // 计算大运
            const dayun = this.calculator.calculateDaYun(baZi, gender, birthDate);
            
            // 生成解读
            const interpretation = this.calculator.generateInterpretation(baZi, gender, name);
            
            // 显示结果
            this.displayResults(baZi, dayun, interpretation);
            
        } catch (error) {
            console.error('计算出错:', error);
            alert('计算过程中出现错误，请检查输入信息');
        }
    }

    displayResults(baZi, dayun, interpretation) {
        // 显示八字
        const baziResult = document.getElementById('baziResult');
        baziResult.innerHTML = `
            <div class="pillar">
                <h3>年柱</h3>
                <div class="tiangan">${baZi.year[0]}</div>
                <div class="dizhi">${baZi.year[1]}</div>
            </div>
            <div class="pillar">
                <h3>月柱</h3>
                <div class="tiangan">${baZi.month[0]}</div>
                <div class="dizhi">${baZi.month[1]}</div>
            </div>
            <div class="pillar">
                <h3>日柱</h3>
                <div class="tiangan">${baZi.day[0]}</div>
                <div class="dizhi">${baZi.day[1]}</div>
            </div>
            <div class="pillar">
                <h3>时柱</h3>
                <div class="tiangan">${baZi.hour[0]}</div>
                <div class="dizhi">${baZi.hour[1]}</div>
            </div>
        `;

        // 显示大运
        const dayunResult = document.getElementById('dayunResult');
        dayunResult.innerHTML = dayun.map(dy => `
            <div class="dayun-item">
                <div class="age">${dy.age}</div>
                <div class="ganzhi">${dy.ganzhi}</div>
            </div>
        `).join('');

        // 显示解读
        const interpretationResult = document.getElementById('interpretationResult');
        interpretationResult.innerHTML = `<pre>${interpretation}</pre>`;

        // 显示结果区域
        document.getElementById('result').style.display = 'block';
        
        // 滚动到结果区域
        document.getElementById('result').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new DestinyApp();
});