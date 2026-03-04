export default function Controls({ onDPad }) {

    return (
        <div style={{ width: '100%' }}>

            {/* Keyboard hints — desktop */}
            <div className="panel" style={{ marginBottom: '1rem' }}>
                <h3 className="font-arcade text-dim" style={{ fontSize: '0.5rem', marginBottom: '0.8rem', letterSpacing: '2px' }}>CONTROLS</h3>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p className="text-dim" style={{ fontSize: '0.6rem', marginBottom: '4px' }}>MOVE</p>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <KeyBadge>W</KeyBadge>
                            </div>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <KeyBadge>A</KeyBadge><KeyBadge>S</KeyBadge><KeyBadge>D</KeyBadge>
                            </div>
                            <p className="text-dim" style={{ fontSize: '0.55rem' }}>or Arrow Keys</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p className="text-dim" style={{ fontSize: '0.6rem', marginBottom: '4px' }}>PAUSE</p>
                        <KeyBadge>P</KeyBadge>
                    </div>
                </div>
            </div>

            {/* Mobile D-Pad */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p className="font-arcade text-dim" style={{ fontSize: '0.45rem', marginBottom: '0.6rem', letterSpacing: '2px' }}>D-PAD</p>
                <div className="dpad">
                    {/* Row 1 */}
                    <div />
                    <button type="button" className="dpad-btn" aria-label="Up" onPointerDown={() => onDPad('UP')}>▲</button>
                    <div />
                    {/* Row 2 */}
                    <button type="button" className="dpad-btn" aria-label="Left" onPointerDown={() => onDPad('LEFT')}>◀</button>
                    <div className="dpad-center" />
                    <button type="button" className="dpad-btn" aria-label="Right" onPointerDown={() => onDPad('RIGHT')}>▶</button>
                    {/* Row 3 */}
                    <div />
                    <button type="button" className="dpad-btn" aria-label="Down" onPointerDown={() => onDPad('DOWN')}>▼</button>
                    <div />
                </div>
            </div>
        </div>
    );
}

function KeyBadge({ children }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 28, height: 28, padding: '0 6px',
            background: '#1a1a1a', border: '1px solid #333',
            borderRadius: 4, color: '#ccc', fontSize: '0.7rem',
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            boxShadow: '0 2px 0 #111',
        }}>
            {children}
        </span>
    );
}
