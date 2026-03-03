import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import { gameReducer, DIRECTIONS, getSpeed } from './hooks/gameReducer';
import { api } from './api/scores';
import GameBoard from './components/GameBoard';
import ScorePanel from './components/ScorePanel';
import Leaderboard from './components/Leaderboard';
import NameInput from './components/NameInput';
import Controls from './components/Controls';

const KEY_MAP = {
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
  W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
};

export default function App() {
  const [gameState, dispatch] = useReducer(gameReducer, {
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    direction: DIRECTIONS.RIGHT,
    directionKey: 'RIGHT',
    food: { x: 15, y: 10 },
    score: 0, level: 1, foodEaten: 0,
    status: 'idle',
    isNewHighScore: false,
  });

  const [playerName, setPlayerName] = useState('');
  const [highscore, setHighscore] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [lbRefreshKey, setLbRefreshKey] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [newRecord, setNewRecord] = useState(false);

  const dirBufferRef = useRef([]);
  const prevStatusRef = useRef('idle');
  const intervalRef = useRef(null);

  // Fetch highscore when player name is set
  useEffect(() => {
    if (!playerName) return;
    api.getHighscore(playerName)
      .then(res => setHighscore(res.data.highscore || 0))
      .catch(() => { });
  }, [playerName]);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      clearInterval(intervalRef.current);
      return;
    }
    const speed = getSpeed(gameState.level);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      // Drain direction buffer
      if (dirBufferRef.current.length > 0) {
        const nextDir = dirBufferRef.current.shift();
        dispatch({ type: 'CHANGE_DIRECTION', key: nextDir });
      }
      dispatch({ type: 'TICK' });
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [gameState.status, gameState.level]);

  // Detect game over → save score + shake
  useEffect(() => {
    if (prevStatusRef.current !== 'gameover' && gameState.status === 'gameover') {
      // Shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Save score
      if (playerName && gameState.score > 0 && !scoreSaved) {
        setScoreSaved(true);
        api.saveScore(playerName, gameState.score, gameState.level)
          .then(res => {
            setLbRefreshKey(k => k + 1);
            // Check for new record
            if (gameState.score > highscore) {
              setHighscore(gameState.score);
              setNewRecord(true);
              setTimeout(() => setNewRecord(false), 3000);
            }
          })
          .catch(console.error);
      }
    }
    // Reset scoreSaved flag when game restarts
    if (prevStatusRef.current === 'gameover' && gameState.status === 'playing') {
      setScoreSaved(false);
      setNewRecord(false);
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status, gameState.score, gameState.level, playerName, highscore, scoreSaved]);

  // Keyboard handler
  const handleKeyDown = useCallback((e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'p' || e.key === 'P') {
      dispatch({ type: 'PAUSE' });
      return;
    }
    if (e.key === ' ' && gameState.status === 'idle') {
      if (playerName) dispatch({ type: 'START' });
      return;
    }
    const dir = KEY_MAP[e.key];
    if (dir) {
      dirBufferRef.current = [...dirBufferRef.current.slice(-1), dir];
    }
  }, [gameState.status, playerName]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // D-pad handler
  const handleDPad = useCallback((dir) => {
    if (gameState.status === 'playing') {
      dirBufferRef.current = [...dirBufferRef.current.slice(-1), dir];
    }
  }, [gameState.status]);

  const handleStart = (name) => {
    setPlayerName(name);
    dispatch({ type: 'START' });
    setScoreSaved(false);
    setNewRecord(false);
  };

  const handleRestart = () => {
    setScoreSaved(false);
    dispatch({ type: 'START' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem' }}>
      {/* Name Input Modal */}
      {gameState.status === 'idle' && !playerName && (
        <NameInput onStart={handleStart} />
      )}

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 className="font-arcade text-neon" style={{ fontSize: 'clamp(1rem, 4vw, 1.8rem)', lineHeight: 1.5 }}>
          🐍 SNAKE GAME
        </h1>
        {playerName && (
          <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            Player: <span className="font-arcade text-neon" style={{ fontSize: '0.6rem' }}>{playerName}</span>
          </p>
        )}
        {newRecord && (
          <p className="font-arcade text-gold record-bounce" style={{ fontSize: '0.65rem', marginTop: '8px' }}>
            🏆 NEW RECORD!
          </p>
        )}
      </header>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', width: '100%', maxWidth: '1100px' }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <ScorePanel
            score={gameState.score}
            highscore={Math.max(highscore, gameState.score)}
            level={gameState.level}
          />
          <div className="panel" style={{ width: '100%' }}>
            {/* Pause button */}
            {(gameState.status === 'playing' || gameState.status === 'paused') && (
              <button className="btn-arcade" onClick={() => dispatch({ type: 'PAUSE' })} style={{ width: '100%', marginBottom: '0.5rem' }}>
                {gameState.status === 'paused' ? '▶ RESUME' : '⏸ PAUSE'}
              </button>
            )}
            {gameState.status === 'gameover' && playerName && (
              <button className="btn-arcade" onClick={handleRestart} style={{ width: '100%' }}>
                🔄 PLAY AGAIN
              </button>
            )}
            {gameState.status === 'idle' && playerName && (
              <button className="btn-arcade" onClick={() => dispatch({ type: 'START' })} style={{ width: '100%' }}>
                ▶ START GAME
              </button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <GameBoard
            gameState={gameState}
            dispatch={dispatch}
            isShaking={isShaking}
          />
          {/* Mobile D-Pad (shown below canvas on small screens) */}
          <div className="dpad-mobile" style={{ display: 'block' }}>
            <Controls onDPad={handleDPad} status={gameState.status} />
          </div>
        </div>

        {/* Right panel: Leaderboard */}
        <Leaderboard refreshKey={lbRefreshKey} />
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p className="text-dim" style={{ fontSize: '0.6rem' }}>
          🐍 SNAKE ARCADE — Built with React + Node.js + PostgreSQL
        </p>
      </footer>
    </div>
  );
}
