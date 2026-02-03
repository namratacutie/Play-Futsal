// Main Game Page with Beautiful Goal Celebration
import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../hooks/useGameState';
import FutsalField from '../components/3d/FutsalField';
import Ball from '../components/3d/Ball';
import Character from '../components/3d/Character';
import TrajectoryPath from '../components/3d/TrajectoryPath';
import ScoreBoard from '../components/ui/ScoreBoard';
import QuestionModal from '../components/ui/QuestionModal';
import GameControls from '../components/ui/GameControls';
import './GamePage.css';

// Dynamic Camera
const DynamicCamera = ({ isFollowing, targetZ }) => {
    const { camera } = useThree();
    const targetPos = useRef({ x: 0, y: 5, z: 12 });

    useFrame((state, delta) => {
        if (isFollowing) {
            targetPos.current = { x: 0, y: 6, z: Math.max(0, targetZ + 10) };
        } else {
            targetPos.current = { x: 0, y: 5, z: 12 };
        }

        camera.position.x += (targetPos.current.x - camera.position.x) * delta * 2;
        camera.position.y += (targetPos.current.y - camera.position.y) * delta * 2;
        camera.position.z += (targetPos.current.z - camera.position.z) * delta * 2;
        camera.lookAt(0, 1, -5);
    });

    return null;
};

// Goal Celebration Component
const GoalCelebration = ({ scorer, onComplete }) => {
    const [phase, setPhase] = useState(1); // 1: Goal!, 2: Scorer name, 3: Hearts

    useEffect(() => {
        const timer1 = setTimeout(() => setPhase(2), 800);
        const timer2 = setTimeout(() => setPhase(3), 1600);
        const timer3 = setTimeout(() => onComplete(), 3000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    return (
        <div className="goal-celebration">
            {/* Confetti/Hearts background */}
            <div className="celebration-particles">
                {[...Array(30)].map((_, i) => (
                    <span
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    >
                        {['❤️', '⚽', '💕', '✨', '🎉'][Math.floor(Math.random() * 5)]}
                    </span>
                ))}
            </div>

            <div className="celebration-content">
                {/* Phase 1: GOAL! */}
                <div className={`celebration-phase phase-1 ${phase >= 1 ? 'active' : ''}`}>
                    <span className="goal-icon">⚽</span>
                    <h1 className="goal-title">GOAL!</h1>
                </div>

                {/* Phase 2: Scorer */}
                <div className={`celebration-phase phase-2 ${phase >= 2 ? 'active' : ''}`}>
                    <p className="scorer-text">{scorer} scores!</p>
                </div>

                {/* Phase 3: Love message */}
                <div className={`celebration-phase phase-3 ${phase >= 3 ? 'active' : ''}`}>
                    <div className="love-message">
                        <span>💕</span>
                        <p>Time for a love question...</p>
                        <span>💕</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GamePage = () => {
    const navigate = useNavigate();
    const { playerInfo, isAuthenticated, logout, loading } = useAuth();
    const { gameState, otherPlayerOnline, shootBall, recordGoal, answerQuestion } = useGameState();
    const ballRef = useRef();
    const [showGoalCelebration, setShowGoalCelebration] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const [isFollowingBall, setIsFollowingBall] = useState(false);
    const [ballZ, setBallZ] = useState(5);
    const [lastScorer, setLastScorer] = useState(null);

    // Aiming state
    const [aimState, setAimState] = useState({
        direction: 0,
        power: 0.5,
        isAiming: false
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, loading, navigate]);

    const handleAimChange = useCallback((newAimState) => {
        setAimState(newAimState);
    }, []);

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

    const handleShoot = (direction, power) => {
        setIsFollowingBall(true);

        if (ballRef.current?.shoot) {
            ballRef.current.shoot(direction, power);
        }

        shootBall(direction, power);

        setTimeout(() => {
            setIsFollowingBall(false);
            setBallZ(5);
        }, 3000);
    };

    const handleGoal = () => {
        // Start celebration sequence
        setLastScorer(playerInfo.name);
        setShowGoalCelebration(true);
        recordGoal(playerInfo.name);
    };

    const handleCelebrationComplete = () => {
        setShowGoalCelebration(false);
        setIsFollowingBall(false);
        // Show question after celebration
        setShowQuestion(true);
    };

    const handleAnswerQuestion = (answer) => {
        answerQuestion(answer);
        setShowQuestion(false);
    };

    return (
        <div className="game-container">
            {/* Goal Celebration (shows first) */}
            {showGoalCelebration && (
                <GoalCelebration
                    scorer={lastScorer}
                    onComplete={handleCelebrationComplete}
                />
            )}

            {/* Question Modal (shows after celebration) */}
            {showQuestion && (
                <QuestionModal
                    scorer={lastScorer}
                    onAnswer={handleAnswerQuestion}
                />
            )}

            {/* Header */}
            <header className="game-header">
                <div className="player-info">
                    <span className="player-avatar">{playerInfo.avatar}</span>
                    <span className="player-name">{playerInfo.name}</span>
                </div>

                <div className="game-mode-badge">
                    <span className="mode-penalty">⚽ Penalty Kicks</span>
                </div>

                <button className="logout-btn" onClick={logout}>
                    Exit 🚪
                </button>
            </header>

            {/* Score Board */}
            {/* Score Board */}
            <ScoreBoard
                supremScore={gameState.suprem?.score || 0}
                nammuScore={gameState.nammu?.score || 0}
                supremLovePoints={gameState.suprem?.lovePoints || 0}
                nammuLovePoints={gameState.nammu?.lovePoints || 0}
                currentPlayer={playerInfo.name}
            />

            {/* Online Status */}
            <div className="online-status">
                <div className={`status-dot ${gameState.suprem?.online ? 'online' : 'offline'}`}></div>
                <span>Suprem</span>
                <span className="status-heart">❤️</span>
                <div className={`status-dot ${gameState.nammu?.online ? 'online' : 'offline'}`}></div>
                <span>Nammu</span>
            </div>

            {/* 3D Canvas */}
            <div className="game-canvas-wrapper">
                <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
                    <Suspense fallback={null}>
                        <DynamicCamera isFollowing={isFollowingBall} targetZ={ballZ} />

                        <ambientLight intensity={0.5} />
                        <directionalLight
                            position={[10, 20, 10]}
                            intensity={1.2}
                            castShadow
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                        />
                        <pointLight position={[-10, 10, -10]} intensity={0.3} color="#ff6b95" />
                        <pointLight position={[10, 10, -10]} intensity={0.3} color="#6495ed" />

                        <color attach="background" args={['#1a0a2e']} />
                        <fog attach="fog" args={['#1a0a2e', 25, 50]} />

                        <FutsalField />

                        <TrajectoryPath
                            direction={aimState.direction}
                            power={aimState.power}
                            visible={aimState.isAiming}
                            startPosition={[0, 0.3, 5]}
                        />

                        <Ball
                            ref={ballRef}
                            position={gameState.ballPosition}
                            isShooter={true}
                            onShoot={handleShoot}
                            onGoal={handleGoal}
                        />

                        <Character
                            name={playerInfo.name}
                            position={[0, 0, 7]}
                            isPlayer={true}
                            isKeeper={false}
                            isOnline={true}
                        />

                        <Character
                            name={opponentName}
                            position={[0, 0, -9]}
                            isPlayer={false}
                            isKeeper={true}
                            isOnline={otherPlayerOnline}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Game Controls (hide during celebration/question) */}
            {!showGoalCelebration && !showQuestion && (
                <GameControls
                    onShoot={handleShoot}
                    onAimChange={handleAimChange}
                />
            )}
        </div>
    );
};

export default GamePage;
