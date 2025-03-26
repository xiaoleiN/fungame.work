let startTime = 0;
let bestTime = localStorage.getItem('bestTime') || 0;
let velocity = 0;
let isPlaying = true;
const balloon = document.getElementById('balloon');
const timerElement = document.getElementById('timer');
const bestTimeElement = document.getElementById('bestTime');

// 添加重力显示相关变量
const gravityBar = document.getElementById('gravityFill');
const gravityText = document.getElementById('gravityText');
const INITIAL_GRAVITY = 0.15;
const MAX_GRAVITY = 0.25;  // 降低最大重力值

// 初始化显示
bestTimeElement.textContent = bestTime;

// 初始化气球位置
Object.assign(balloon.style, {
    left: '50%',
    top: '70%',
    transform: 'translate(-50%, -50%)'
});

// 基础参数
let gravity = 0.15;  // 初始重力
let combo = 0;  // 连击数
let lastStarTime = 0;  // 上次收集星星的时间
let comboMultiplier = 1;  // 连击倍数
let isGravityEffectActive = false;  // 是否处于重力效果中
let baseGravity = 0.15;  // 基础重力值
let lastGravityUpdateTime = 0;  // 上次重力更新时间
const GRAVITY_UPDATE_INTERVAL = 500;  // 每0.5秒更新一次
const TOTAL_DIFFICULTY_TIME = 180000;  // 3分钟内达到最大难度

// 收集物类型定义
const COLLECTIBLE_TYPES = [
    { class: 'star', emoji: '⭐️', effect: '闪耀加持~', gravityReduction: 0.85, prob: 0.4 },
    { class: 'cloud', emoji: '☁️', effect: '云朵托起~', gravityReduction: 0.9, prob: 0.25 },
    { class: 'rainbow', emoji: '🌈', effect: '彩虹之力~', gravityReduction: 0.75, prob: 0.15 },
    { class: 'bomb', emoji: '💣', effect: '重力加强!', gravityIncrease: 1.25, prob: 0.1 },
    { class: 'clock', emoji: '🕙', effect: '时间暂停!', isPause: true, prob: 0.1 }
];

// 更新重力显示
function updateGravityDisplay() {
    const gravityPercentage = ((gravity - INITIAL_GRAVITY) / (MAX_GRAVITY - INITIAL_GRAVITY)) * 100;
    gravityBar.style.width = `${Math.min(100, Math.max(0, gravityPercentage))}%`;
    gravityText.textContent = `重力: ${gravity.toFixed(2)}`;
}

function gameLoop() {
    if (!isPlaying) return;
    
    // 计时系统
    if (startTime === 0) startTime = Date.now();
    const currentTime = Date.now();
    const gameTime = Math.floor((currentTime - startTime) / 1000);
    timerElement.textContent = gameTime;

    // 更平滑的难度增加
    if (currentTime - lastGravityUpdateTime >= GRAVITY_UPDATE_INTERVAL) {
        // 计算已经过去的时间比例（0-1之间）
        const timeProgress = Math.min((currentTime - startTime) / TOTAL_DIFFICULTY_TIME, 1);
        
        // 使用平方根函数使增长更平缓
        const growthFactor = Math.sqrt(timeProgress);
        
        // 计算新的基础重力值
        const gravityRange = MAX_GRAVITY - INITIAL_GRAVITY;
        baseGravity = INITIAL_GRAVITY + (gravityRange * growthFactor);
        
        // 如果没有特殊效果，则应用新的重力值
        if (!isGravityEffectActive) {
            gravity = baseGravity;
            updateGravityDisplay();
        }
        
        lastGravityUpdateTime = currentTime;
    }

    velocity += gravity;
    const currentTop = parseFloat(balloon.style.top) || 0;
    const newTop = Math.max(0, Math.min(window.innerHeight - 50, currentTop + velocity));

    // 难度补偿机制
    const boundaryThreshold = 100;
    if (newTop < boundaryThreshold || newTop > window.innerHeight - boundaryThreshold - 50) {
        document.getElementById('topBoundary').style.opacity = (newTop < boundaryThreshold) ? 0.5 : 0;
        document.getElementById('bottomBoundary').style.opacity = (newTop > window.innerHeight - boundaryThreshold - 50) ? 0.5 : 0;
    }

    balloon.style.top = `${newTop}px`;
    balloon.style.transform = `translate(-50%, -50%) rotate(${velocity * 2}deg)`;

    // 碰撞检测
    if (newTop >= window.innerHeight - 50 || newTop <= 0) {
        gameOver();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('collectible')) {
        handleStarClick(e);
    } else {
        velocity = -4.5;
        balloon.style.transform = 'translate(-50%, -50%) rotate(-15deg)';
    }
});

function handleStarClick(e) {
    const currentTime = Date.now();
    const collectible = e.target;
    const collectibleType = COLLECTIBLE_TYPES.find(type => collectible.classList.contains(type.class));
    
    // 计算连击
    if (currentTime - lastStarTime < 2200) {
        combo++;
        comboMultiplier = Math.min(comboMultiplier + 0.2, 2.2);
        createComboEffect(e.clientX, e.clientY, combo, comboMultiplier);
    } else {
        combo = 1;
        comboMultiplier = 1;
    }
    
    lastStarTime = currentTime;
    
    if (collectibleType.isPause) {
        // 时钟效果：完全暂停
        isGravityEffectActive = true;
        gravity = baseGravity * 0;
        updateGravityDisplay();
        
        setTimeout(() => {
            gravity = baseGravity;
            isGravityEffectActive = false;
            updateGravityDisplay();
        }, 3000);
    } else if (collectibleType.gravityIncrease) {
        // 炸弹效果：临时增加重力
        isGravityEffectActive = true;
        gravity = baseGravity * collectibleType.gravityIncrease;
        updateGravityDisplay();
        
        setTimeout(() => {
            gravity = baseGravity;
            isGravityEffectActive = false;
            updateGravityDisplay();
        }, 3000);
    } else {
        // 普通收集物效果
        isGravityEffectActive = true;
        const gravityReduction = collectibleType.gravityReduction * comboMultiplier;
        gravity = baseGravity * gravityReduction;
        updateGravityDisplay();
        
        setTimeout(() => {
            gravity = baseGravity;
            isGravityEffectActive = false;
            updateGravityDisplay();
        }, 3500);
    }
    
    // 显示效果
    createCollectibleEffect(e.clientX, e.clientY, collectibleType.effect, collectibleType.class);
    
    // 添加消失动画
    collectible.classList.add('disappearing');
    
    // 动画结束后移除元素
    setTimeout(() => {
        collectible.remove();
    }, 500);
}

function createComboEffect(x, y, combo, multiplier) {
    const effect = document.createElement('div');
    effect.className = 'combo-effect';
    effect.innerHTML = `${combo}连击!<br>${multiplier.toFixed(1)}倍`;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

function createCollectibleEffect(x, y, text, type) {
    const effect = document.createElement('div');
    effect.className = `collectible-effect ${type}-effect`;
    effect.textContent = text;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 800);
}

function createStar() {
    let cumulative = 0;
    const rand = Math.random();
    let selectedType;

    for (const type of COLLECTIBLE_TYPES) {
        cumulative += type.prob;
        if (rand < cumulative) {
            selectedType = type;
            break;
        }
    }

    const collectible = document.createElement('div');
    collectible.className = `collectible ${selectedType.class}`;
    collectible.textContent = selectedType.emoji;

    // 获取当前时间
    const currentTime = Math.floor((Date.now() - startTime) / 1000);
    
    // 根据时间决定生成位置
    if (currentTime < 30) {  // 前30秒
        // 获取气球当前位置
        const balloonRect = balloon.getBoundingClientRect();
        const balloonX = balloonRect.left + balloonRect.width / 2;
        const balloonY = balloonRect.top + balloonRect.height / 2;
        
        // 在气球周围随机生成（范围：气球位置±200像素）
        const randomX = balloonX + (Math.random() * 400 - 200);
        const randomY = balloonY + (Math.random() * 400 - 200);
        
        // 确保在屏幕范围内
        collectible.style.left = `${Math.max(0, Math.min(window.innerWidth - 50, randomX))}px`;
        collectible.style.top = `${Math.max(0, Math.min(window.innerHeight - 50, randomY))}px`;
    } else {  // 30秒后随机生成
        collectible.style.left = `${Math.random() * 95}%`;
        collectible.style.top = `${Math.random() * 90}%`;
    }

    document.getElementById('game').appendChild(collectible);
}

setInterval(() => {
    if (isPlaying) {
        const currentTime = Math.floor((Date.now() - startTime) / 1000);
        if (currentTime < 30) {  // 前30秒更频繁生成
            if (Math.random() < 0.25) createStar();  // 增加生成概率到25%
        } else {  // 30秒后降低生成频率
            if (Math.random() < 0.15) createStar();  // 增加生成概率到15%
        }
    }
}, 500);

function gameOver() {
    isPlaying = false;
    const finalTime = Math.floor((Date.now() - startTime) / 1000);

    // 更新最佳记录
    if (finalTime > bestTime) {
        bestTime = finalTime;
        localStorage.setItem('bestTime', bestTime);
        bestTimeElement.textContent = bestTime;
    }

    balloon.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 36 48\'><path fill=\'%23999999\' d=\'M18 3C10 3 3 10 3 18v24h30V18c0-8-7-15-15-15z\'/></svg>")';

    const timeDiff = bestTime - finalTime;
    const message = timeDiff > 0
        ? `差${timeDiff}秒打破纪录！`
        : "🎉 恭喜创造新纪录！";

    alert(`${message}\n本次存活：${finalTime}秒\n历史最佳：${bestTime}秒`);
    location.reload();
}

gameLoop();