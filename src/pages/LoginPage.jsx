// Romantic Login Page with Love/Futsal Theme
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { sendOTP, verifyOTP, error, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate('/game');
        return null;
    }

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await sendOTP(phoneNumber);
        if (success) {
            setOtpSent(true);
        }
        setIsLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await verifyOTP(otp);
        if (success) {
            navigate('/game');
        }
        setIsLoading(false);
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

                {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="login-form">
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
                            disabled={isLoading || phoneNumber.length < 10}
                        >
                            {isLoading ? (
                                <span className="loading-text">
                                    <span className="spinner">💫</span> Sending...
                                </span>
                            ) : (
                                <>Enter the Game 💕</>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="login-form">
                        <div className="input-group">
                            <label htmlFor="otp">🔐 Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                className="otp-input"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading || otp.length < 6}
                        >
                            {isLoading ? (
                                <span className="loading-text">
                                    <span className="spinner">💫</span> Verifying...
                                </span>
                            ) : (
                                <>Let's Play! ⚽</>
                            )}
                        </button>

                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => {
                                setOtpSent(false);
                                setOtp('');
                            }}
                        >
                            ← Change Number
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

            {/* Hidden recaptcha container */}
            <div id="recaptcha-container"></div>
        </div>
    );
};

export default LoginPage;
