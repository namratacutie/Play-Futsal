// Question Modal - Romantic Questions after Goals
import { useState, useEffect } from 'react';
import { getRandomQuestion } from '../../data/questions';
import './QuestionModal.css';

const QuestionModal = ({ scorer, onAnswer }) => {
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showReward, setShowReward] = useState(false);
    const [hearts, setHearts] = useState([]);

    // Get random question when modal opens
    useEffect(() => {
        const q = getRandomQuestion(scorer);
        setQuestion(q);
    }, [scorer]);

    // Generate floating hearts for celebration
    const generateHearts = () => {
        const newHearts = [];
        for (let i = 0; i < 20; i++) {
            newHearts.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 0.5,
                size: 1 + Math.random() * 1.5
            });
        }
        setHearts(newHearts);
    };

    const handleAnswerSelect = (answer, index) => {
        setSelectedAnswer(index);

        // Show reward animation
        setTimeout(() => {
            setShowReward(true);
            generateHearts();
        }, 500);

        // Close modal after celebration
        setTimeout(() => {
            onAnswer?.(answer, question?.points || 0);
        }, 3000);
    };

    if (!question) return null;

    return (
        <div className="question-modal-overlay">
            {/* Celebration hearts */}
            {hearts.map(heart => (
                <span
                    key={heart.id}
                    className="celebration-heart"
                    style={{
                        left: `${heart.left}%`,
                        animationDelay: `${heart.delay}s`,
                        fontSize: `${heart.size}rem`
                    }}
                >
                    ❤️
                </span>
            ))}

            <div className={`question-modal ${showReward ? 'celebrating' : ''}`}>
                {!showReward ? (
                    <>
                        <div className="modal-header">
                            <span className="goal-icon">⚽</span>
                            <h2>GOAL!</h2>
                            <p>{scorer} scored! 🎉</p>
                        </div>

                        <div className="question-section">
                            <div className="question-bubble">
                                <span className="question-mark">💕</span>
                                <p className="question-text">{question.question}</p>
                            </div>

                            <div className="options">
                                {question.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
                                        onClick={() => handleAnswerSelect(option, index)}
                                        disabled={selectedAnswer !== null}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="reward-section">
                        <div className="reward-icon">🎁</div>
                        <h2 className="reward-title">Amazing! 💖</h2>
                        <p className="reward-text">{question.reward}</p>
                        <div className="points-earned">
                            <span className="points">+{question.points}</span>
                            <span className="points-label">Love Points</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionModal;
