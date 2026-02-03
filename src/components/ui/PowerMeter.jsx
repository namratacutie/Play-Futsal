// Power Meter Component for Shot Strength
import { useState, useEffect } from 'react';
import './PowerMeter.css';

const PowerMeter = ({ onPowerChange, isActive }) => {
    const [power, setPower] = useState(0);
    const [increasing, setIncreasing] = useState(true);

    // Animate power bar when active
    useEffect(() => {
        if (!isActive) {
            setPower(0);
            return;
        }

        const interval = setInterval(() => {
            setPower(prev => {
                let newPower;
                if (increasing) {
                    newPower = prev + 2;
                    if (newPower >= 100) {
                        setIncreasing(false);
                        return 100;
                    }
                } else {
                    newPower = prev - 2;
                    if (newPower <= 0) {
                        setIncreasing(true);
                        return 0;
                    }
                }
                return newPower;
            });
        }, 30);

        return () => clearInterval(interval);
    }, [isActive, increasing]);

    // Notify parent of power changes
    useEffect(() => {
        onPowerChange?.(power);
    }, [power, onPowerChange]);

    const getPowerColor = () => {
        if (power < 33) return '#2ecc71';
        if (power < 66) return '#f1c40f';
        return '#ff6b95';
    };

    const getPowerLabel = () => {
        if (power < 33) return 'Soft 💕';
        if (power < 66) return 'Medium ⚽';
        return 'POWER! 🔥';
    };

    return (
        <div className="power-meter">
            <div className="power-label">{getPowerLabel()}</div>
            <div className="power-bar-container">
                <div
                    className="power-bar-fill"
                    style={{
                        width: `${power}%`,
                        backgroundColor: getPowerColor()
                    }}
                />
                <div className="power-hearts">
                    {[0, 25, 50, 75, 100].map(pos => (
                        <span
                            key={pos}
                            className={`heart-marker ${power >= pos ? 'active' : ''}`}
                            style={{ left: `${pos}%` }}
                        >
                            ❤️
                        </span>
                    ))}
                </div>
            </div>
            <div className="power-value">{power}%</div>
        </div>
    );
};

export default PowerMeter;
