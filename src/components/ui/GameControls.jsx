// Game Controls - Drag to Aim (Fixed Stale State Bug)
import { useState, useCallback, useRef, useEffect } from 'react';
import './GameControls.css';

const GameControls = ({ onShoot, onAimChange }) => {
    const [isAiming, setIsAiming] = useState(false);
    const [direction, setDirection] = useState(0);
    const [power, setPower] = useState(0.5);

    // Refs to hold latest values for event listeners (Fixes Stale Closure)
    const directionRef = useRef(0);
    const powerRef = useRef(0.5);
    const touchStartRef = useRef(null);
    const aimAreaRef = useRef(null);

    // Notify parent of aim changes
    useEffect(() => {
        onAimChange?.({ direction, power, isAiming });
    }, [direction, power, isAiming, onAimChange]);

    const handlePointerDown = (e) => {
        // Only prevent default on mouse, not touch (passive listener issue)
        if (e.type === 'mousedown') {
            e.preventDefault();
        }

        const rect = aimAreaRef.current?.getBoundingClientRect();
        if (!rect) return;

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        touchStartRef.current = { x: clientX, y: clientY };

        setIsAiming(true);
        // Do not reset direction/power here, allow picking up where left off or start center
        setDirection(0);
        setPower(0.5);
        directionRef.current = 0;
        powerRef.current = 0.5;
    };

    const handlePointerMove = useCallback((e) => {
        if (!isAiming || !touchStartRef.current) return;

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        if (clientX === undefined || clientY === undefined) return;

        // Calculate direction based on horizontal drag
        const deltaX = clientX - touchStartRef.current.x;
        // Sensitivity: 150px drag = full direction (1.0)
        const newDirection = Math.max(-1, Math.min(1, deltaX / 150));

        setDirection(newDirection);
        directionRef.current = newDirection;

        // Calculate power based on vertical drag (drag up = more power)
        const deltaY = touchStartRef.current.y - clientY;
        // Sensitivity: 200px drag = full power bonus
        const newPower = Math.max(0.2, Math.min(1, 0.5 + deltaY / 200));

        setPower(newPower);
        powerRef.current = newPower;
    }, [isAiming]);

    const handlePointerUp = useCallback(() => {
        if (isAiming) {
            // Use REF values to ensure we get the latest state
            const finalDirection = directionRef.current;
            const finalPower = powerRef.current;

            console.log(`Releasing shot: dir=${finalDirection.toFixed(2)}, power=${finalPower.toFixed(2)}`);
            onShoot?.(finalDirection, finalPower);

            // Reset
            setIsAiming(false);
            setDirection(0);
            setPower(0.5);
            directionRef.current = 0;
            powerRef.current = 0.5;
            touchStartRef.current = null;
        }
    }, [isAiming, onShoot]);

    // Global event listeners
    useEffect(() => {
        if (isAiming) {
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('mouseup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove, { passive: false });
            window.addEventListener('touchend', handlePointerUp);
        }

        return () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        };
    }, [isAiming, handlePointerMove, handlePointerUp]);

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
                        <div className="aiming-overlay">
                            {/* Visual crosshair following touch */}
                            <div className="aim-stats">
                                <span className="direction-label">{getDirectionLabel()}</span>
                                <span className="power-label" style={{ color: getPowerColor() }}>
                                    {Math.round(power * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Power Bar (vertical) */}
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
        </div>
    );
};

export default GameControls;
