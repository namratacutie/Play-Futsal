// Game Controls - Shoot direction and power
import { useState, useCallback } from 'react';
import './GameControls.css';

const GameControls = ({ onShoot }) => {
    const [direction, setDirection] = useState(0); // -1 to 1
    const [power, setPower] = useState(50);
    const [isCharging, setIsCharging] = useState(false);
    const [chargeDirection, setChargeDirection] = useState(1);

    // Power charge animation
    const startCharging = useCallback(() => {
        setIsCharging(true);

        const interval = setInterval(() => {
            setPower(prev => {
                let newPower;
                if (chargeDirection === 1) {
                    newPower = prev + 2;
                    if (newPower >= 100) {
                        setChargeDirection(-1);
                        return 100;
                    }
                } else {
                    newPower = prev - 2;
                    if (newPower <= 20) {
                        setChargeDirection(1);
                        return 20;
                    }
                }
                return newPower;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [chargeDirection]);

    const handleShoot = () => {
        if (isCharging) {
            setIsCharging(false);
            onShoot?.(direction, power / 100);
            // Reset
            setTimeout(() => {
                setPower(50);
                setDirection(0);
            }, 500);
        } else {
            startCharging();
        }
    };

    const handleDirectionChange = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const normalized = (x / rect.width) * 2 - 1;
        setDirection(Math.max(-1, Math.min(1, normalized)));
    };

    const getPowerEmoji = () => {
        if (power < 40) return '💕';
        if (power < 70) return '⚽';
        return '🔥';
    };

    return (
        <div className="game-controls">
            {/* Direction Control */}
            <div className="direction-control">
                <p className="control-label">🎯 Aim Direction</p>
                <div
                    className="direction-slider"
                    onClick={handleDirectionChange}
                    onMouseMove={(e) => e.buttons === 1 && handleDirectionChange(e)}
                >
                    <div className="goal-indicator">
                        <span className="post left">|</span>
                        <span className="post right">|</span>
                    </div>
                    <div
                        className="direction-marker"
                        style={{ left: `${(direction + 1) * 50}%` }}
                    >
                        ⚽
                    </div>
                </div>
                <div className="direction-labels">
                    <span>← Left</span>
                    <span>Center</span>
                    <span>Right →</span>
                </div>
            </div>

            {/* Power Indicator */}
            <div className="power-control">
                <p className="control-label">{getPowerEmoji()} Power: {power}%</p>
                <div className="power-bar">
                    <div
                        className="power-fill"
                        style={{
                            width: `${power}%`,
                            background: power < 40 ? '#2ecc71' : power < 70 ? '#f1c40f' : '#ff6b95'
                        }}
                    />
                </div>
            </div>

            {/* Shoot Button */}
            <button
                className={`shoot-btn ${isCharging ? 'charging' : ''}`}
                onClick={handleShoot}
            >
                {isCharging ? (
                    <>
                        <span className="shoot-icon">🎯</span>
                        <span>RELEASE TO SHOOT!</span>
                    </>
                ) : (
                    <>
                        <span className="shoot-icon">⚽</span>
                        <span>HOLD TO CHARGE</span>
                    </>
                )}
            </button>

            <p className="controls-hint">
                Click to start charging, click again to shoot! 💕
            </p>
        </div>
    );
};

export default GameControls;
