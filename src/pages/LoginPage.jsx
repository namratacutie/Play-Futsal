// Romantic Login Page with Password Authentication
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, setupPassword, error, isAuthenticated, isAllowedPhone, hasPassword } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/game');
        }
    }, [isAuthenticated, navigate]);

    const handlePhoneSubmit = (e) => {
        e.preventDefault();

        if (!isAllowedPhone(phoneNumber)) {
            return;
        }

        // Check if user needs to set up password
        if (!hasPassword(phoneNumber)) {
            setIsSetupMode(true);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(phoneNumber, password);

        if (result.needsSetup) {
            setIsSetupMode(true);
        } else if (result.success) {
            navigate('/game');
        }

        setIsLoading(false);
    };

    const handleSetupPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match! 💔');
            return;
        }

        setIsLoading(true);
        const success = await setupPassword(phoneNumber, password);

        if (success) {
            navigate('/game');
        }

        setIsLoading(false);
    };

    const getPlayerName = () => {
        const normalized = phoneNumber.replace(/\D/g, '');
        if (normalized === '9742246521') return 'Suprem 👨';
        if (normalized === '9841001742') return 'Nammu 👩';
        return null;
    };

    return (
        <div className="login-container">
            {/* Floating hearts background */}
            <div className="floating-hearts">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="heart"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    >
                        ❤️
                    </div>
                ))}
            </div>

            {/* Main card */}
            <div className="login-card">
                <div className="logo-section">
                    <span className="ball-emoji">⚽</span>
                    <h1 className="title">
                        <span className="title-play">Play</span>
                        <span className="title-futsal">Futsal</span>
                    </h1>
                    <p className="subtitle">A Game Made with 💕</p>
                </div>

                <div className="romantic-message">
                    <span className="sparkle">✨</span>
                    <p>Where love meets the beautiful game</p>
                    <span className="sparkle">✨</span>
                </div>

                {/* Show player name when phone is valid */}
                {getPlayerName() && phoneNumber.length >= 10 && (
                    <div className="player-greeting">
                        <span className="greeting-text">Welcome, {getPlayerName()}!</span>
                    </div>
                )}

                {isSetupMode ? (
                    /* Password Setup Form */
                    <form onSubmit={handleSetupPassword} className="login-form">
                        <div className="setup-header">
                            <span className="lock-emoji">🔐</span>
                            <h3>Set Your Secret Password</h3>
                            <p>This will be your key to enter the game!</p>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">💕 Create Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a secret password"
                                className="password-input"
                                minLength={4}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">💕 Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="password-input"
                                minLength={4}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading || password.length < 4 || password !== confirmPassword}
                        >
                            {isLoading ? (
                                <span className="loading-text">
                                    <span className="spinner">💫</span> Setting up...
                                </span>
                            ) : (
                                <>Save & Enter Game 💕</>
                            )}
                        </button>

                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => {
                                setIsSetupMode(false);
                                setPassword('');
                                setConfirmPassword('');
                            }}
                        >
                            ← Back
                        </button>
                    </form>
                ) : hasPassword(phoneNumber) && phoneNumber.length >= 10 ? (
                    /* Password Login Form */
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <label htmlFor="password">🔐 Your Secret Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="password-input"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading || password.length < 4}
                        >
                            {isLoading ? (
                                <span className="loading-text">
                                    <span className="spinner">💫</span> Entering...
                                </span>
                            ) : (
                                <>Enter the Game 💕</>
                            )}
                        </button>

                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => {
                                setPhoneNumber('');
                                setPassword('');
                            }}
                        >
                            ← Change Number
                        </button>
                    </form>
                ) : (
                    /* Phone Number Form */
                    <form onSubmit={handlePhoneSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="phone">📱 Your Phone Number</label>
                            <div className="phone-input-wrapper">
                                <span className="country-code">+977</span>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder="98XXXXXXXX"
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={phoneNumber.length < 10 || !isAllowedPhone(phoneNumber)}
                        >
                            Continue 💕
                        </button>
                    </form>
                )}

                {error && (
                    <div className="error-message">
                        <span>😢</span> {error}
                    </div>
                )}

                <div className="players-section">
                    <p className="players-label">Special Players Only</p>
                    <div className="players">
                        <div className="player suprem">
                            <span className="player-avatar">👨</span>
                            <span className="player-name">Suprem</span>
                        </div>
                        <span className="heart-divider">❤️</span>
                        <div className="player nammu">
                            <span className="player-avatar">👩</span>
                            <span className="player-name">Nammu</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
