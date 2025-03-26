// game-extensions.js

// 音效管理系统
const AudioManager = (() => {
    const audioFiles = {
        flip: './assets/audio/flip.mp3',
        match: './assets/audio/match.mp3',
        win: './assets/audio/win.mp3'
    };

    const cache = {};

    // 预加载音频
    function preload() {
        Object.entries(audioFiles).forEach(([name, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            cache[name] = audio;
        });
    }

    // 播放音效
    function play(name) {
        if (cache[name]) {
            const clone = cache[name].cloneNode(true);
            clone.play().catch(error => console.log('自动播放被阻止:', error));
        }
    }

    return { preload, play };
})();

// 本地存储系统
const StorageManager = {
    // 获取最高分
    getHighScore() {
        return parseInt(localStorage.getItem('officeMemoryHighScore')) || 0;
    },

    // 更新最高分
    updateHighScore(score) {
        const current = this.getHighScore();
        if (score > current) {
            localStorage.setItem('officeMemoryHighScore', score);
            return score;
        }
        return current;
    },

    // 重置记录
    resetScore() {
        localStorage.removeItem('officeMemoryHighScore');
    }
};

// 教学系统
const Tutorial = {
    steps: [
        {
            text: "点击卡牌翻开寻找相同物品",
            position: "center",
            delay: 2000
        },
        {
            text: "匹配成功获得分数加成",
            position: "bottom",
            delay: 2500
        },
        {
            text: "注意时间限制哦！",
            position: "top",
            delay: 2000
        }
    ],

    // 显示教学提示
    show() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
        `;

        let currentStep = 0;
        
        const showNextStep = () => {
            if (currentStep >= this.steps.length) {
                overlay.remove();
                return;
            }

            const step = this.steps[currentStep];
            const tip = document.createElement('div');
            tip.style.cssText = `
                padding: 20px;
                background: rgba(255,255,255,0.9);
                color: #2c3e50;
                border-radius: 10px;
                margin: 10px;
                max-width: 80%;
                text-align: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                animation: fadeIn 0.5s;
            `;
            tip.textContent = step.text;
            overlay.appendChild(tip);

            setTimeout(() => {
                tip.remove();
                currentStep++;
                showNextStep();
            }, step.delay);
        };

        document.body.appendChild(overlay);
        showNextStep();
    }
};

// 导出模块
export { AudioManager, StorageManager, Tutorial };