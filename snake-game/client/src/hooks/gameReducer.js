// --- Constants ---
export const GRID_SIZE = 20;
export const CELL_SIZE = 30;
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 600

export const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
};

export const OPPOSITES = {
    UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
};

const BASE_SPEED = 150;
const SPEED_INCREMENT = 10;
const SPEED_BOOST_EVERY = 5;
const MIN_SPEED = 60;

export function getSpeed(level) {
    return Math.max(MIN_SPEED, BASE_SPEED - (level - 1) * SPEED_INCREMENT);
}

function randomFood(snake) {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
}

// --- Initial State ---
const INITIAL_STATE = {
    snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ],
    direction: DIRECTIONS.RIGHT,
    directionKey: 'RIGHT',
    food: { x: 15, y: 10 },
    score: 0,
    level: 1,
    foodEaten: 0,
    status: 'idle', // idle | playing | paused | gameover
    isNewHighScore: false,
};

// --- Reducer ---
export function gameReducer(state, action) {
    switch (action.type) {

        case 'START':
            return {
                ...INITIAL_STATE,
                status: 'playing',
                food: randomFood(INITIAL_STATE.snake),
                isNewHighScore: false,
            };

        case 'PAUSE':
            if (state.status !== 'playing' && state.status !== 'paused') return state;
            return { ...state, status: state.status === 'playing' ? 'paused' : 'playing' };

        case 'CHANGE_DIRECTION': {
            const { key } = action;
            if (!DIRECTIONS[key]) return state;
            if (OPPOSITES[key] === state.directionKey) return state; // no 180°
            return {
                ...state,
                direction: DIRECTIONS[key],
                directionKey: key,
            };
        }

        case 'TICK': {
            if (state.status !== 'playing') return state;
            const head = state.snake[0];
            const newHead = {
                x: ((head.x + state.direction.x) + GRID_SIZE) % GRID_SIZE,
                y: ((head.y + state.direction.y) + GRID_SIZE) % GRID_SIZE,
            };

            // Self collision only — snake wraps through walls
            if (state.snake.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y)) {
                return { ...state, status: 'gameover' };
            }

            const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;
            const newSnake = ateFood
                ? [newHead, ...state.snake]
                : [newHead, ...state.snake.slice(0, -1)];

            if (!ateFood) {
                return { ...state, snake: newSnake };
            }

            const newFoodEaten = state.foodEaten + 1;
            const newLevel = Math.floor(newFoodEaten / SPEED_BOOST_EVERY) + 1;
            const newScore = state.score + (10 * newLevel);
            const newFood = randomFood(newSnake);

            return {
                ...state,
                snake: newSnake,
                food: newFood,
                score: newScore,
                foodEaten: newFoodEaten,
                level: newLevel,
            };
        }

        case 'SET_NEW_HIGHSCORE':
            return { ...state, isNewHighScore: true };

        default:
            return state;
    }
}
