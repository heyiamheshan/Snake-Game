import { useEffect, useState } from 'react';
import { api } from '../api/scores';

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ refreshKey }) {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        Promise.all([api.getLeaderboard(), api.getStats()])
            .then(([lbRes, statsRes]) => {
                setScores(lbRes.data.leaderboard);
                setStats(statsRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [refreshKey]);

    return (
        <div className="panel" style={{ width: '100%', maxWidth: '380px' }}>
            <h2 className="font-arcade text-neon" style={{ fontSize: '0.6rem', marginBottom: '1.2rem', letterSpacing: '2px' }}>
                🏆 LEADERBOARD
            </h2>

            {/* Stats bar */}
            {stats && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #1a1a1a' }}>
                    <div>
                        <p className="text-dim" style={{ fontSize: '0.55rem' }}>TOTAL GAMES</p>
                        <p className="font-arcade" style={{ fontSize: '0.7rem', color: '#fff' }}>{stats.totalGames}</p>
                    </div>
                    <div>
                        <p className="text-dim" style={{ fontSize: '0.55rem' }}>AVG SCORE</p>
                        <p className="font-arcade" style={{ fontSize: '0.7rem', color: '#fff' }}>{stats.averageScore}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <p className="text-dim font-arcade" style={{ fontSize: '0.55rem' }}>LOADING...</p>
                </div>
            ) : scores.length === 0 ? (
                <p className="text-dim" style={{ fontSize: '0.75rem', textAlign: 'center', padding: '1rem 0' }}>No scores yet. Be the first!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px 50px', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid #1a1a1a' }}>
                        <span className="text-dim" style={{ fontSize: '0.5rem' }}>#</span>
                        <span className="text-dim" style={{ fontSize: '0.5rem' }}>PLAYER</span>
                        <span className="text-dim" style={{ fontSize: '0.5rem', textAlign: 'right' }}>SCORE</span>
                        <span className="text-dim" style={{ fontSize: '0.5rem', textAlign: 'right' }}>DATE</span>
                    </div>
                    {scores.map((s, i) => (
                        <div
                            key={s.id}
                            className="leaderboard-row"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '28px 1fr 70px 50px',
                                gap: '8px',
                                padding: '6px 4px',
                                borderRadius: '4px',
                                background: i === 0 ? 'rgba(255,215,0,0.05)' : i === 1 ? 'rgba(192,192,192,0.04)' : i === 2 ? 'rgba(205,127,50,0.04)' : 'transparent',
                                borderLeft: i < 3 ? `2px solid ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32'}` : '2px solid transparent',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: '0.9rem' }}>{MEDAL[i] || `${i + 1}.`}</span>
                            <span className="font-arcade" style={{ fontSize: '0.55rem', color: i === 0 ? '#ffd700' : i < 3 ? '#ccc' : '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.playerName}
                            </span>
                            <span className="font-arcade text-neon" style={{ fontSize: '0.65rem', textAlign: 'right' }}>
                                {s.score}
                            </span>
                            <span className="text-dim" style={{ fontSize: '0.5rem', textAlign: 'right' }}>
                                {formatDate(s.createdAt)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
