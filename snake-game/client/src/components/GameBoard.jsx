import { useRef, useEffect, useCallback } from 'react';
import { GRID_SIZE, CELL_SIZE, CANVAS_SIZE, DIRECTIONS } from '../hooks/gameReducer';

const COLORS = {
    bg: '#0a0a0a',
    grid: 'rgba(255,255,255,0.03)',
    snakeHead: '#00ff88',
    snakeBody: '#00cc6a',
    snakeTail: '#009950',
    food: '#ff4444',
    foodGlow: 'rgba(255,68,68,0.6)',
};

function drawGrid(ctx) {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
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
}

function drawFood(ctx, food) {
    const cx = food.x * CELL_SIZE + CELL_SIZE / 2;
    const cy = food.y * CELL_SIZE + CELL_SIZE / 2;
    const r = CELL_SIZE / 2 - 3;
    ctx.save();
    ctx.shadowColor = COLORS.foodGlow;
    ctx.shadowBlur = 14;
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.3, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawSnake(ctx, snake) {
    snake.forEach((segment, i) => {
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        const isHead = i === 0;
        const ratio = 1 - (i / snake.length) * 0.5;
        ctx.save();

        if (isHead) {
            ctx.shadowColor = COLORS.snakeHead;
            ctx.shadowBlur = 18;
            ctx.fillStyle = COLORS.snakeHead;
        } else {
            ctx.shadowBlur = 0;
            const g = Math.round(204 * ratio);
            ctx.fillStyle = `rgb(0, ${g}, ${Math.round(g * 0.6)})`;
        }

        const padding = isHead ? 1 : 2;
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2, isHead ? 6 : 3);
        ctx.fill();
        ctx.restore();
    });
}

export default function GameBoard({ gameState, dispatch, isShaking }) {
    const canvasRef = useRef(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        drawGrid(ctx);
        drawFood(ctx, gameState.food);
        drawSnake(ctx, gameState.snake);
    }, [gameState.snake, gameState.food]);

    useEffect(() => {
        draw();
    }, [draw]);

    return (
        <div className="canvas-wrapper" style={{ position: 'relative' }}>
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className={`canvas-inner${isShaking ? ' shake' : ''}`}
                style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                aria-label="Snake Game Board"
            />

            {/* Paused Overlay */}
            {gameState.status === 'paused' && (
                <div className="canvas-overlay">
                    <p className="font-arcade text-neon" style={{ fontSize: '1.5rem', textAlign: 'center', lineHeight: '2' }}>
                        PAUSED
                    </p>
                    <p className="text-dim" style={{ fontSize: '0.8rem' }}>Press P or click to resume</p>
                    <button
                        className="btn-arcade"
                        onClick={() => dispatch({ type: 'PAUSE' })}
                    >
                        RESUME
                    </button>
                </div>
            )}

            {/* Game Over Overlay */}
            {gameState.status === 'gameover' && (
                <div className="canvas-overlay">
                    <p className="font-arcade text-red" style={{ fontSize: '1.2rem', textAlign: 'center' }}>
                        GAME OVER
                    </p>
                    <div style={{ textAlign: 'center', lineHeight: '2.2' }}>
                        <p className="font-arcade text-neon" style={{ fontSize: '0.75rem' }}>
                            SCORE: {gameState.score}
                        </p>
                        <p className="font-arcade" style={{ fontSize: '0.6rem', color: '#888' }}>
                            LEVEL {gameState.level}
                        </p>
                    </div>
                    <button
                        className="btn-arcade"
                        onClick={() => dispatch({ type: 'START' })}
                    >
                        PLAY AGAIN
                    </button>
                </div>
            )}
        </div>
    );
}
