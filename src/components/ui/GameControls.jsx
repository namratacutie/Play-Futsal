// Game Controls - Drag to Aim with Trajectory Preview
import { useState, useCallback, useRef, useEffect } from 'react';
import './GameControls.css';

const GameControls = ({ onShoot, onAimChange }) => {
    const [isAiming, setIsAiming] = useState(false);
    const [direction, setDirection] = useState(0);
    const [power, setPower] = useState(0.5);
    const [touchStart, setTouchStart] = useState(null);
    const aimAreaRef = useRef(null);

    // Notify parent of aim changes for trajectory preview
    useEffect(() => {
        onAimChange?.({ direction, power, isAiming });
    }, [direction, power, isAiming, onAimChange]);

    const handlePointerDown = (e) => {
        e.preventDefault();
        const rect = aimAreaRef.current?.getBoundingClientRect();
        if (!rect) return;

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        setTouchStart({ x: clientX, y: clientY, rect });
        setIsAiming(true);
    };

    const handlePointerMove = useCallback((e) => {
        if (!isAiming || !touchStart) return;

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        // Calculate direction based on horizontal drag
        const deltaX = clientX - touchStart.x;
        const newDirection = Math.max(-1, Math.min(1, deltaX / 100));
        setDirection(newDirection);

        // Calculate power based on vertical drag (drag up = more power)
        const deltaY = touchStart.y - clientY;
        const newPower = Math.max(0.2, Math.min(1, 0.5 + deltaY / 150));
        setPower(newPower);
    }, [isAiming, touchStart]);

    const handlePointerUp = () => {
        if (isAiming) {
            // Shoot!
            onShoot?.(direction, power);

            // Reset after shooting
            setTimeout(() => {
                setIsAiming(false);
                setDirection(0);
                setPower(0.5);
                setTouchStart(null);
            }, 100);
        }
    };

    // Global event listeners for drag
    useEffect(() => {
        if (isAiming) {
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('mouseup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove);
            window.addEventListener('touchend', handlePointerUp);
        }

        return () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        };
    }, [isAiming, handlePointerMove]);

    const getPowerColor = () => {
        if (power < 0.4) return '#2ecc71';
        if (power < 0.7) return '#f1c40f';
        return '#ff6b95';
    };

    const getDirectionLabel = () => {
        if (direction < -0.3) return '← Left';
        if (direction > 0.3) return 'Right →';
        return 'Center';
    };

    return (
        <div className="game-controls">
            {/* Aim Area */}
            <div
                ref={aimAreaRef}
                className={`aim-area ${isAiming ? 'aiming' : ''}`}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
            >
                {!isAiming ? (
                    <div className="aim-prompt">
                        <span className="aim-icon">🎯</span>
                        <p>Drag to Aim & Shoot!</p>
                        <span className="aim-hint">↔️ Drag left/right to aim</span>
                        <span className="aim-hint">↕️ Drag up for more power</span>
                    </div>
                ) : (
                    <div className="aiming-display">
                        <div className="aim-crosshair">
                            <div
                                className="crosshair-dot"
                                style={{
                                    transform: `translate(${direction * 60}px, ${-(power - 0.5) * 80}px)`
                                }}
                            >
                                ⚽
                            </div>
                        </div>
                        <div className="aim-stats">
                            <span className="direction-label">{getDirectionLabel()}</span>
                            <span className="power-label" style={{ color: getPowerColor() }}>
                                Power: {Math.round(power * 100)}%
                            </span>
                        </div>
                        <p className="release-hint">Release to SHOOT! 🚀</p>
                    </div>
                )}
            </div>

            {/* Power Bar (always visible when aiming) */}
            {isAiming && (
                <div className="power-indicator">
                    <div className="power-bar-vertical">
                        <div
                            className="power-fill-vertical"
                            style={{
                                height: `${power * 100}%`,
                                backgroundColor: getPowerColor()
                            }}
                        />
                    </div>
                    <span className="power-emoji">
                        {power < 0.4 ? '💕' : power < 0.7 ? '⚽' : '🔥'}
                    </span>
                </div>
            )}

            {/* Direction Indicator */}
            {isAiming && (
                <div className="direction-indicator">
                    <div className="goal-preview">
                        <div className="post left"></div>
                        <div
                            className="ball-marker"
                            style={{ left: `${50 + direction * 40}%` }}
                        >
                            ⚽
                        </div>
                        <div className="post right"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameControls;
