// 游戏常量
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const GRID_SIZE = 20;
const INITIAL_SPEED = 150; // 初始速度（毫秒）
const SPEED_INCREASE = 2; // 每次加速减少的毫秒数
const MIN_SPEED = 50; // 最小速度限制

// 游戏状态
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let score = 0;
let gameInterval;
let isGameRunning = false;
let gameSpeed = INITIAL_SPEED;

// DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 初始化游戏
function initGame() {
    // 重置蛇的位置和方向
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    
    // 更新分数显示
    updateScore();
    
    // 生成第一个食物
    generateFood();
    
    // 渲染初始状态
    render();
}

// 生成食物
function generateFood() {
    let newFood;
    // 确保食物不会出现在蛇身上
    do {
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 添加新头部
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        updateScore();
        
        // 生成新食物
        generateFood();
        
        // 增加游戏速度
        if (gameSpeed > MIN_SPEED) {
            gameSpeed = Math.max(MIN_SPEED, gameSpeed - SPEED_INCREASE);
            // 重置游戏间隔以应用新速度
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        // 移除尾部
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE ||
        head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    
    return false;
}

// 渲染游戏
function render() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头和身体颜色不同
        ctx.fillStyle = index === 0 ? '#333' : '#4CAF50';
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1
        );
    });
    
    // 绘制食物
    ctx.fillStyle = '#ff5252';
    ctx.fillRect(
        food.x * GRID_SIZE,
        food.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
    );
    
    // 绘制网格线（可选）
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

// 更新分数
function updateScore() {
    scoreElement.textContent = score;
}

// 游戏主循环
function gameLoop() {
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    render();
}

// 开始游戏
function startGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// 暂停游戏
function pauseGame() {
    if (isGameRunning) {
        isGameRunning = false;
        clearInterval(gameInterval);
        pauseBtn.textContent = '继续';
    } else {
        isGameRunning = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
        pauseBtn.textContent = '暂停';
    }
}

// 重置游戏
function resetGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    pauseBtn.textContent = '暂停';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    initGame();
}

// 游戏结束
function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // 在Electron环境中使用更友好的对话框
    if (window.process && window.process.type === 'renderer') {
        const { dialog } = require('electron').remote;
        dialog.showMessageBox({
            type: 'info',
            title: '游戏结束',
            message: `游戏结束！您的得分是：${score}`,
            buttons: ['确定']
        }).then(() => {
            resetGame();
        });
    } else {
        // 网页环境中使用alert
        alert(`游戏结束！您的得分是：${score}`);
        resetGame();
    }
}

// 处理键盘输入
function handleKeyPress(e) {
    // 防止按键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
    }
    
    // 只在游戏运行时接受方向输入
    if (!isGameRunning && !(e.key === ' ' || e.key.toLowerCase() === 'enter')) {
        return;
    }
    
    // 开始游戏快捷键
    if ((e.key === ' ' || e.key.toLowerCase() === 'enter') && !isGameRunning) {
        startGame();
        return;
    }
    
    // 暂停/继续快捷键
    if (e.key.toLowerCase() === 'p' && startBtn.disabled) {
        pauseGame();
        return;
    }
    
    // 重置游戏快捷键
    if (e.key.toLowerCase() === 'r') {
        resetGame();
        return;
    }
    
    // 方向控制
    const newDir = e.key.toLowerCase();
    
    // 确保不会直接反向移动（例如从向右立即变为向左）
    if ((newDir === 'arrowup' || newDir === 'w') && direction !== 'down') {
        nextDirection = 'up';
    } else if ((newDir === 'arrowdown' || newDir === 's') && direction !== 'up') {
        nextDirection = 'down';
    } else if ((newDir === 'arrowleft' || newDir === 'a') && direction !== 'right') {
        nextDirection = 'left';
    } else if ((newDir === 'arrowright' || newDir === 'd') && direction !== 'left') {
        nextDirection = 'right';
    }
}

// 添加触摸控制（移动设备支持）
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    // 仅在非Electron环境或支持触摸的设备上启用
    if (!window.process || navigator.maxTouchPoints > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}

function handleTouchMove(e) {
    // 仅在非Electron环境或支持触摸的设备上启用
    if (!window.process || navigator.maxTouchPoints > 0) {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // 判断滑动方向
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            if (diffX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (diffY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        // 重置触摸起点
        touchStartX = 0;
        touchStartY = 0;
    }
}

// 事件监听器
window.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);

// 初始化游戏
window.addEventListener('load', initGame);