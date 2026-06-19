import { createWindow } from '../window-manager';

export function openFlappyBird() {
    const html = `
        <div class="game-container">
            <div class="score-display current-score">Score: <span id="id-game-score">0</span></div>
            <div class="score-display high-score">High: <span id="id-high-score">0</span></div>
            <canvas id="game-canvas" width="320" height="480"></canvas>
            <div id="game-overlay" class="game-overlay">
                <div id="start-screen">
                    <h2 id="game-status">FLAPPY BIRD</h2>
                    <p>Press ARROW UP or SPACE to Jump</p>
                </div>
            </div>
        </div>
    `;

    createWindow('Flappy Bird', html, 320, 520);

    setTimeout(() => {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const birdImg = new Image();
        birdImg.src = './img/flappy-bird_img.png';

        let birdY = 200;
        let birdVelocity = 0;
        const gravity = 0.25;
        const jump = -4.5;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('flappy-high-score') || '0');
        const highScoreEl = document.getElementById('id-high-score');
        if (highScoreEl) highScoreEl.textContent = highScore.toString();

        let gameActive = false;
        let pipes: { x: number, y: number }[] = [];
        const pipeGap = 120;
        const pipeWidth = 50;
        let animationId: number;

        function createPipe() {
            const minPipeHeight = 50;
            const maxPipeHeight = canvas.height - pipeGap - minPipeHeight;
            const height = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
            pipes.push({ x: canvas.width, y: height });
        }

        function draw() {
            if (!ctx) return;
            // Background
            ctx.fillStyle = '#70c5ce';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Bird
            if (birdImg.complete) {
                ctx.save();
                ctx.translate(50 + 15, birdY + 15);
                ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, birdVelocity * 0.1)));
                ctx.drawImage(birdImg, -15, -15, 30, 30);
                ctx.restore();
            } else {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(50, birdY, 30, 30);
            }

            if (gameActive) {
                birdVelocity += gravity;
                birdY += birdVelocity;

                // Pipes
                if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
                    createPipe();
                }

                pipes.forEach((pipe, index) => {
                    pipe.x -= 2;

                    // Draw pipes
                    ctx.fillStyle = '#73be2e';
                    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y); // Top
                    ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap); // Bottom

                    // Collision
                    if (
                        50 + 25 > pipe.x && 50 + 5 < pipe.x + pipeWidth &&
                        (birdY + 5 < pipe.y || birdY + 25 > pipe.y + pipeGap)
                    ) {
                        gameOver();
                    }

                    // Score
                    if (pipe.x === 50) {
                        score++;
                        const scoreEl = document.getElementById('id-game-score');
                        if (scoreEl) scoreEl.textContent = score.toString();

                        if (score > highScore) {
                            highScore = score;
                            localStorage.setItem('flappy-high-score', highScore.toString());
                            if (highScoreEl) highScoreEl.textContent = highScore.toString();
                        }
                    }

                    // Remove off-screen pipes
                    if (pipe.x < -pipeWidth) {
                        pipes.splice(index, 1);
                    }
                });

                // Floor/Ceiling collision
                if (birdY > canvas.height - 30 || birdY < 0) {
                    gameOver();
                }
            }

            animationId = requestAnimationFrame(draw);
        }

        function gameOver() {
            gameActive = false;
            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.style.display = 'block';
            const statusEl = document.getElementById('game-status');
            if (statusEl) statusEl.textContent = 'GAME OVER';
            setTimeout(() => {
                resetGame();
            }, 1500);
        }

        function resetGame() {
            birdY = 200;
            birdVelocity = 0;
            pipes = [];
            score = 0;
            const scoreEl = document.getElementById('id-game-score');
            if (scoreEl) scoreEl.textContent = '0';
            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.style.display = 'block';
            const statusEl = document.getElementById('game-status');
            if (statusEl) statusEl.textContent = 'READY?';
            gameActive = false;
        }

        const jumpBird = () => {
            if (!gameActive) {
                gameActive = true;
                const startScreen = document.getElementById('start-screen');
                if (startScreen) startScreen.style.display = 'none';
            }
            birdVelocity = jump;
        };

        const handleInput = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                jumpBird();
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleInput);
        canvas.addEventListener('mousedown', (e) => {
            jumpBird();
            e.preventDefault();
        });
        canvas.addEventListener('touchstart', (e) => {
            jumpBird();
            e.preventDefault();
        }, { passive: false });

        // Clean up on window close
        const closeBtn = canvas.closest('.window')?.querySelector('.close');
        closeBtn?.addEventListener('click', () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleInput);
        });

        draw();
    }, 100);
}
