// script.js
// 基本变量
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let points = [];
let selectedPoint = null;
let lines = [];
let score = 0;
let time = 60;
let timer;
let colors = ["#FF5722", "#4CAF50", "#2196F3", "#FFEB3B", "#9C27B0"];
let level = 1;

// 初始化游戏
function initGame() {
    generatePoints(5 + level);
    drawBoard();
    timer = setInterval(updateTime, 1000);
}

// 生成点点
function generatePoints(num) {
    points = [];
    for (let i = 0; i < num; i++) {
        points.push({
            x: Math.random() * 360 + 20,
            y: Math.random() * 360 + 20,
            color: colors[i % colors.length],
            connected: false,
        });
    }
}

// 绘制游戏面板
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画已连线
    lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 4;
        ctx.stroke();
    });

    // 画点
    points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
    });
}

// 检测点击
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 检测点击的点
    points.forEach((point) => {
        const distance = Math.sqrt(
            (point.x - mouseX) ** 2 + (point.y - mouseY) ** 2
        );
        if (distance < 12) {
            handlePointClick(point);
        }
    });
});

// 处理点击逻辑
function handlePointClick(point) {
    if (!selectedPoint) {
        selectedPoint = point;
    } else {
        if (
            selectedPoint !== point &&
            selectedPoint.color === point.color &&
            !point.connected &&
            !selectedPoint.connected
        ) {
            lines.push({ start: selectedPoint, end: point, color: point.color });
            selectedPoint.connected = true;
            point.connected = true;
            selectedPoint = null;
            updateScore();
            checkWin();
        } else {
            selectedPoint = null;
        }
    }
    drawBoard();
}

// 更新分数
function updateScore() {
    score += 10;
    document.getElementById("score").innerText = score;
}

// 检查胜利
function checkWin() {
    if (points.every((p) => p.connected)) {
        levelUp();
    }
}

// 关卡升级
function levelUp() {
    level++;
    time += 10; // 每升一级增加 10 秒
    generatePoints(5 + level);
    drawBoard();
}

// 更新倒计时
function updateTime() {
    if (time > 0) {
        time--;
        document.getElementById("time").innerText = time;
    } else {
        endGame(false);
    }
}

// 结束游戏
function endGame(win) {
    clearInterval(timer);
    document.getElementById("game-over").classList.remove("hidden");
    canvas.classList.add("hidden");
    document.getElementById("final-score").innerText = score;
    document.getElementById("game-message").innerText = win
        ? "🎉 恭喜！挑战成功！"
        : "⏰ 时间结束！再接再厉！";
}

// 重新开始
function restartGame() {
    score = 0;
    time = 60;
    level = 1;
    document.getElementById("score").innerText = score;
    document.getElementById("time").innerText = time;
    canvas.classList.remove("hidden");
    document.getElementById("game-over").classList.add("hidden");
    initGame();
}

// 启动游戏
initGame();
