import { createWindow } from '../window-manager';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point { x: number; y: number }

export function openSnake() {
    const html = `
        <div class="game-container">
            <div class="score-display current-score">Score: <span id="snake-score">0</span></div>
            <div class="score-display high-score">High: <span id="snake-high-score">0</span></div>
            <canvas id="snake-canvas" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"></canvas>
            <div id="snake-overlay" class="game-overlay">
                <div id="snake-start-screen">
                    <img src="./img/snake.png" class="snake-game-icon" alt="Snake" />
                    <h2 id="snake-status">SNAKE</h2>
                    <p>Use ARROW KEYS to move</p>
                </div>
            </div>
        </div>
    `;

    createWindow('Snake', html, CANVAS_SIZE, CANVAS_SIZE + 70);

    setTimeout(() => {
        const canvas = document.getElementById('snake-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Game state
        let snake: Point[] = [];
        let food: Point = { x: 0, y: 0 };
        let direction: Direction = 'RIGHT';
        let nextDirection: Direction = 'RIGHT';
        let score = 0;
        let highScore = parseInt(localStorage.getItem('snake-high-score') || '0');
        const scoreEl = document.getElementById('snake-score');
        const highScoreEl = document.getElementById('snake-high-score');
        if (highScoreEl) highScoreEl.textContent = highScore.toString();

        let gameActive = false;
        let gameOverFlag = false;
        let animationId: number;
        let moveTimer = 0;
        const MOVE_INTERVAL = 8;

        function initGame() {
            const mid = Math.floor(GRID_SIZE / 2);
            snake = [
                { x: mid, y: mid },
                { x: mid - 1, y: mid },
                { x: mid - 2, y: mid },
            ];
            direction = 'RIGHT';
            nextDirection = 'RIGHT';
            score = 0;
            if (scoreEl) scoreEl.textContent = '0';
            spawnFood();
        }

        function spawnFood() {
            const occupied = new Set(snake.map(p => `${p.x},${p.y}`));
            let pos: Point;
            do {
                pos = {
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE),
                };
            } while (occupied.has(`${pos.x},${pos.y}`));
            food = pos;
        }

        function draw() {
            if (!ctx) return;

            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= GRID_SIZE; i++) {
                ctx.beginPath();
                ctx.moveTo(i * CELL_SIZE, 0);
                ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * CELL_SIZE);
                ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
                ctx.stroke();
            }

            ctx.fillStyle = '#ff4757';
            ctx.shadowColor = '#ff4757';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            snake.forEach((seg, i) => {
                const isHead = i === 0;
                const t = i / snake.length;
                const r = Math.round(30 + t * 50);
                const g = Math.round(180 + (1 - t) * 40);
                ctx.fillStyle = isHead ? '#2ecc71' : `rgb(${r}, ${g}, 80)`;
                const pad = isHead ? 1 : 2;
                const radius = 4;
                const x = seg.x * CELL_SIZE + pad;
                const y = seg.y * CELL_SIZE + pad;
                const w = CELL_SIZE - pad * 2;
                const h = CELL_SIZE - pad * 2;

                if (isHead) {
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, radius);
                    ctx.fill();

                    ctx.fillStyle = '#fff';
                    const eyeR = 2.5;
                    if (direction === 'RIGHT') {
                        ctx.beginPath(); ctx.arc(x + w - 5, y + 5, eyeR, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(x + w - 5, y + h - 5, eyeR, 0, Math.PI * 2); ctx.fill();
                    } else if (direction === 'LEFT') {
                        ctx.beginPath(); ctx.arc(x + 5, y + 5, eyeR, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(x + 5, y + h - 5, eyeR, 0, Math.PI * 2); ctx.fill();
                    } else if (direction === 'UP') {
                        ctx.beginPath(); ctx.arc(x + 5, y + 5, eyeR, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(x + w - 5, y + 5, eyeR, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.beginPath(); ctx.arc(x + 5, y + h - 5, eyeR, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(x + w - 5, y + h - 5, eyeR, 0, Math.PI * 2); ctx.fill();
                    }
                } else {
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, radius);
                    ctx.fill();
                }
            });

            if (gameActive && !gameOverFlag) {
                moveTimer++;
                if (moveTimer >= MOVE_INTERVAL) {
                    moveTimer = 0;
                    tick();
                }
            }

            animationId = requestAnimationFrame(draw);
        }

        function tick() {
            direction = nextDirection;
            const head = snake[0];
            let newHead: Point;

            switch (direction) {
                case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
                case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
                case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
                case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
            }

            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                gameOver();
                return;
            }

            if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
                gameOver();
                return;
            }

            snake.unshift(newHead);

            if (newHead.x === food.x && newHead.y === food.y) {
                score++;
                if (scoreEl) scoreEl.textContent = score.toString();
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('snake-high-score', highScore.toString());
                    if (highScoreEl) highScoreEl.textContent = highScore.toString();
                }
                spawnFood();
            } else {
                snake.pop();
            }
        }

        function gameOver() {
            if (gameOverFlag) return;
            gameOverFlag = true;
            gameActive = false;
            const startScreen = document.getElementById('snake-start-screen');
            if (startScreen) startScreen.style.display = 'block';
            const statusEl = document.getElementById('snake-status');
            if (statusEl) statusEl.textContent = 'GAME OVER';
            setTimeout(() => {
                resetGame();
            }, 1500);
        }

        function resetGame() {
            initGame();
            gameActive = false;
            gameOverFlag = false;
            moveTimer = 0;
            const startScreen = document.getElementById('snake-start-screen');
            if (startScreen) startScreen.style.display = 'block';
            const statusEl = document.getElementById('snake-status');
            if (statusEl) statusEl.textContent = 'READY?';
        }

        const handleInput = (e: KeyboardEvent) => {
            const opposites: Record<string, Direction> = {
                'ArrowUp': 'DOWN',
                'ArrowDown': 'UP',
                'ArrowLeft': 'RIGHT',
                'ArrowRight': 'LEFT',
            };
            const dirMap: Record<string, Direction> = {
                'ArrowUp': 'UP',
                'ArrowDown': 'DOWN',
                'ArrowLeft': 'LEFT',
                'ArrowRight': 'RIGHT',
            };

            const newDir = dirMap[e.key];
            if (!newDir) return;
            e.preventDefault();

            if (opposites[e.key] === direction) return;

            nextDirection = newDir;

            if (!gameActive) {
                gameActive = true;
                gameOverFlag = false;
                const startScreen = document.getElementById('snake-start-screen');
                if (startScreen) startScreen.style.display = 'none';
            }
        };

        window.addEventListener('keydown', handleInput);

        const closeBtn = canvas.closest('.window')?.querySelector('.close');
        closeBtn?.addEventListener('click', () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleInput);
        });

        initGame();
        draw();
    }, 100);
}
