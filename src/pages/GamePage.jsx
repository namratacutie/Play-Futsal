// Main Game Page with 3D Canvas
import { Suspense, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../hooks/useGameState';
import FutsalField from '../components/3d/FutsalField';
import Ball from '../components/3d/Ball';
import Character from '../components/3d/Character';
import ScoreBoard from '../components/ui/ScoreBoard';
import QuestionModal from '../components/ui/QuestionModal';
import GameControls from '../components/ui/GameControls';
import './GamePage.css';

const GamePage = () => {
    const navigate = useNavigate();
    const { playerInfo, isAuthenticated, logout, loading } = useAuth();
    const { gameState, otherPlayerOnline, shootBall, recordGoal, answerQuestion } = useGameState();
    const ballRef = useRef();
    const [showGoalCelebration, setShowGoalCelebration] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="game-loading">
                <div className="loading-content">
                    <span className="loading-ball">⚽</span>
                    <p>Loading the game...</p>
                </div>
            </div>
        );
    }

    if (!playerInfo) return null;

    const isSuprem = playerInfo.name === 'Suprem';
    const opponentName = isSuprem ? 'Nammu' : 'Suprem';

    // Always allow shooting in penalty mode
    const isShooter = true;

    // Determine game mode text
    const getGameModeText = () => {
        if (otherPlayerOnline) {
            return <span className="mode-match">🔥 1v1 Match - Both Online!</span>;
        }
        return <span className="mode-penalty">⚽ Penalty Kicks vs {opponentName}</span>;
    };

    const handleShoot = (direction, power) => {
        shootBall(direction, power);
        // Trigger ball shoot in 3D
        if (ballRef.current?.shoot) {
            ballRef.current.shoot(direction, power);
        }
    };

    const handleGoal = () => {
        setShowGoalCelebration(true);
        recordGoal(playerInfo.name);
        setTimeout(() => setShowGoalCelebration(false), 2000);
    };

    return (
        <div className="game-container">
            {/* Goal Celebration Overlay */}
            {showGoalCelebration && (
                <div className="goal-celebration">
                    <span className="goal-text">⚽ GOAL! ⚽</span>
                </div>
            )}

            {/* Header */}
            <header className="game-header">
                <div className="player-info">
                    <span className="player-avatar">{playerInfo.avatar}</span>
                    <span className="player-name">{playerInfo.name}</span>
                </div>

                <div className="game-mode-badge">
                    {getGameModeText()}
                </div>

                <button className="logout-btn" onClick={logout}>
                    Exit 🚪
                </button>
            </header>

            {/* Score Board */}
            <ScoreBoard
                supremScore={gameState.suprem?.score || 0}
                nammuScore={gameState.nammu?.score || 0}
                currentPlayer={playerInfo.name}
            />

            {/* Online Status Indicator */}
            <div className="online-status">
                <div className={`status-dot ${gameState.suprem?.online ? 'online' : 'offline'}`}></div>
                <span>Suprem</span>
                <span className="status-heart">❤️</span>
                <div className={`status-dot ${gameState.nammu?.online ? 'online' : 'offline'}`}></div>
                <span>Nammu</span>
            </div>

            {/* 3D Game Canvas */}
            <div className="game-canvas-wrapper">
                <Canvas
                    shadows
                    camera={{ position: [0, 8, 15], fov: 60 }}
                >
                    <Suspense fallback={null}>
                        {/* Lighting */}
                        <ambientLight intensity={0.4} />
                        <directionalLight
                            position={[10, 20, 10]}
                            intensity={1}
                            castShadow
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                        />
                        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff6b95" />
                        <pointLight position={[10, 10, -10]} intensity={0.5} color="#6495ed" />

                        {/* Field */}
                        <FutsalField />

                        {/* Ball */}
                        <Ball
                            ref={ballRef}
                            position={gameState.ballPosition}
                            isShooter={isShooter}
                            onShoot={handleShoot}
                            onGoal={handleGoal}
                        />

                        {/* Current Player (Shooter) */}
                        <Character
                            name={playerInfo.name}
                            position={[0, 0, 6]}
                            isPlayer={true}
                            isKeeper={false}
                            isOnline={true}
                        />

                        {/* Opponent (Goalkeeper) */}
                        <Character
                            name={opponentName}
                            position={[0, 0, -4]}
                            isPlayer={false}
                            isKeeper={true}
                            isOnline={otherPlayerOnline}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Game Controls - Always visible for penalty kicks */}
            <GameControls onShoot={handleShoot} />

            {/* Helpful Tips */}
            <div className="game-tips">
                <p>🎯 Aim and shoot to score against {opponentName}!</p>
            </div>

            {/* Question Modal */}
            {gameState.questionActive && (
                <QuestionModal
                    scorer={gameState.lastGoal?.scorer}
                    onAnswer={answerQuestion}
                />
            )}
        </div>
    );
};

export default GamePage;
