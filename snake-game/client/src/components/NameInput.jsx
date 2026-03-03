import { useState } from 'react';

export default function NameInput({ onStart }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const validate = (val) => {
        if (val.length < 2) return 'Name must be at least 2 characters';
        if (val.length > 20) return 'Name must be at most 20 characters';
        if (!/^[a-zA-Z0-9]+$/.test(val)) return 'Only letters and numbers allowed';
        return '';
    };

    const handleChange = (e) => {
        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
        setName(val);
        setError(validate(val));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const err = validate(name);
        if (err) { setError(err); return; }
        onStart(name.toUpperCase());
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                {/* Title */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="font-arcade text-neon" style={{ fontSize: '1.4rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                        🐍 SNAKE
                    </h1>
                    <p className="font-arcade" style={{ fontSize: '0.55rem', color: '#555', letterSpacing: '3px' }}>
                        ARCADE EDITION
                    </p>
                </div>

                {/* Instructions */}
                <div style={{ marginBottom: '2rem', padding: '0.75rem', background: '#0a0a0a', borderRadius: '6px', border: '1px solid #1a1a1a' }}>
                    <p className="text-dim" style={{ fontSize: '0.7rem', lineHeight: 1.8 }}>
                        🕹 Arrow Keys or WASD to move<br />
                        🍎 Eat food to grow & score<br />
                        ⚡ Speed up every 5 foods<br />
                        💀 Avoid walls and yourself
                    </p>
                </div>

                {/* Name form */}
                <form onSubmit={handleSubmit}>
                    <label className="font-arcade text-dim" style={{ fontSize: '0.5rem', display: 'block', marginBottom: '0.5rem', letterSpacing: '2px' }}>
                        ENTER YOUR NAME
                    </label>
                    <input
                        className="arcade-input"
                        type="text"
                        autoFocus
                        placeholder="PLAYER1"
                        value={name}
                        onChange={handleChange}
                        maxLength={20}
                        spellCheck={false}
                    />
                    {error && (
                        <p className="text-red" style={{ fontSize: '0.6rem', marginTop: '0.4rem', textAlign: 'left' }}>
                            ⚠ {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="btn-arcade"
                        disabled={!name || !!validate(name)}
                        style={{ marginTop: '1.5rem', width: '100%' }}
                    >
                        START GAME ▶
                    </button>
                </form>
            </div>
        </div>
    );
}
