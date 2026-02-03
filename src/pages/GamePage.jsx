// Main Game Page with 3D Canvas
import { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../hooks/useGameState';
import FutsalField from '../components/3d/FutsalField';
import Ball from '../components/3d/Ball';
import Character from '../components/3d/Character';
import ScoreBoard from '../components/ui/ScoreBoard';
import PowerMeter from '../components/ui/PowerMeter';
import QuestionModal from '../components/ui/QuestionModal';
import GameControls from '../components/ui/GameControls';
import './GamePage.css';

const GamePage = () => {
    const navigate = useNavigate();
    const { playerInfo, isAuthenticated, logout, loading } = useAuth();
    const { gameState, otherPlayerOnline, shootBall, recordGoal, answerQuestion } = useGameState();

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
    const isShooter = gameState.currentShooter === playerInfo.name || !otherPlayerOnline;

    return (
        <div className="game-container">
            {/* Header */}
            <header className="game-header">
                <div className="player-info">
                    <span className="player-avatar">{playerInfo.avatar}</span>
                    <span className="player-name">{playerInfo.name}</span>
                </div>

                <div className="game-mode-badge">
                    {gameState.gameMode === 'match' ? (
                        <span className="mode-match">🔥 1v1 Match</span>
                    ) : gameState.gameMode === 'penalty' ? (
                        <span className="mode-penalty">⚽ Penalty Kicks</span>
                    ) : (
                        <span className="mode-waiting">⏳ Waiting...</span>
                    )}
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
                            position={gameState.ballPosition}
                            isShooter={isShooter}
                            onShoot={shootBall}
                            onGoal={() => recordGoal(playerInfo.name)}
                        />

                        {/* Characters */}
                        <Character
                            name="Suprem"
                            position={isSuprem ? [0, 0, 6] : [0, 0, -4]}
                            isPlayer={isSuprem}
                            isKeeper={!isSuprem && !otherPlayerOnline}
                            isOnline={gameState.suprem?.online}
                        />
                        <Character
                            name="Nammu"
                            position={!isSuprem ? [0, 0, 6] : [0, 0, -4]}
                            isPlayer={!isSuprem}
                            isKeeper={isSuprem && !otherPlayerOnline}
                            isOnline={gameState.nammu?.online}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Game Controls */}
            {isShooter && (
                <GameControls onShoot={shootBall} />
            )}

            {/* Power Meter */}
            {isShooter && <PowerMeter />}

            {/* Status Messages */}
            {!otherPlayerOnline && (
                <div className="waiting-opponent">
                    <p>
                        <span className="waiting-emoji">💕</span>
                        Waiting for {opponentName} to join...
                        <span className="waiting-emoji">💕</span>
                    </p>
                    <p className="waiting-subtext">
                        Practice your penalty kicks while you wait! ⚽
                    </p>
                </div>
            )}

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
