// 游戏存档功能
function saveGameProgress(gameId, score) {
    localStorage.setItem(`fishGame_${gameId}`, score);
}

// 读取历史最高分
function getBestScore(gameId) {
    return localStorage.getItem(`fishGame_${gameId}`) || 0;
}

// 统一返回主页按钮（添加到每个游戏页面）
function addBackButton() {
    const backBtn = document.createElement('button');
    backBtn.textContent = '返回主页';
    backBtn.style.position = 'fixed';
    backBtn.style.top = '10px';
    backBtn.style.right = '10px';
    backBtn.onclick = () => window.location.href = 'index.html';
    document.body.appendChild(backBtn);
}