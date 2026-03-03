import { useEffect, useRef } from 'react';

export default function ScorePanel({ score, highscore, level, scorePulse }) {
    const scoreRef = useRef(null);
    const prevScore = useRef(score);

    useEffect(() => {
        if (score !== prevScore.current && scoreRef.current) {
            scoreRef.current.classList.remove('score-pulse');
            void scoreRef.current.offsetWidth;
            scoreRef.current.classList.add('score-pulse');
        }
        prevScore.current = score;
    }, [score]);

    return (
        <div className="panel" style={{ minWidth: '200px' }}>
            <h2 className="font-arcade text-dim" style={{ fontSize: '0.55rem', marginBottom: '1.5rem', letterSpacing: '2px' }}>
                SCORE PANEL
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {/* Score */}
                <div>
                    <p className="text-dim" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>SCORE</p>
                    <p
                        ref={scoreRef}
                        className="font-arcade text-neon"
                        style={{ fontSize: '1.5rem', lineHeight: 1, display: 'inline-block' }}
                    >
                        {score}
                    </p>
                </div>

                {/* High Score */}
                <div>
                    <p className="text-dim" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>BEST</p>
                    <p
                        className={`font-arcade ${score > 0 && score >= highscore && highscore > 0 ? 'highscore-glow text-gold' : 'text-gold'}`}
                        style={{ fontSize: '1.1rem', lineHeight: 1 }}
                    >
                        {Math.max(score, highscore)}
                    </p>
                </div>

                {/* Level */}
                <div>
                    <p className="text-dim" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>LEVEL</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p className="font-arcade" style={{ fontSize: '1.1rem', color: '#fff', lineHeight: 1 }}>
                            {level}
                        </p>
                        {/* Level progress dots */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: 6, height: 6, borderRadius: '50%',
                                        backgroundColor: i < (level - 1) % 5 ? 'var(--neon-green)' : '#333',
                                        transition: 'background-color 0.3s',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
