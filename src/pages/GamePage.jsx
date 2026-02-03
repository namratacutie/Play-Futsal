// Main Game Page with 3D Canvas and Dynamic Camera
import { Suspense, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../hooks/useGameState';
import FutsalField from '../components/3d/FutsalField';
import Ball from '../components/3d/Ball';
import Character from '../components/3d/Character';
import ScoreBoard from '../components/ui/ScoreBoard';
import QuestionModal from '../components/ui/QuestionModal';
import GameControls from '../components/ui/GameControls';
import './GamePage.css';

// Dynamic Camera that follows the action
const DynamicCamera = ({ ballPosition, isFollowing }) => {
    const { camera } = useThree();
    const targetPos = useRef({ x: 0, y: 8, z: 15 });
    const targetLook = useRef({ x: 0, y: 0, z: 0 });

    useFrame((state, delta) => {
        if (isFollowing && ballPosition) {
            // Follow ball during shot
            targetPos.current = {
                x: ballPosition.x * 0.3,
                y: 4 + Math.max(0, ballPosition.y * 0.5),
                z: ballPosition.z + 8
            };
            targetLook.current = {
                x: ballPosition.x,
                y: ballPosition.y,
                z: ballPosition.z - 3
            };
        } else {
            // Default penalty kick view (behind the player)
            targetPos.current = { x: 0, y: 5, z: 12 };
            targetLook.current = { x: 0, y: 1, z: -5 };
        }

        // Smooth camera movement
        camera.position.x += (targetPos.current.x - camera.position.x) * delta * 3;
        camera.position.y += (targetPos.current.y - camera.position.y) * delta * 3;
        camera.position.z += (targetPos.current.z - camera.position.z) * delta * 3;

        // Smooth look at
        const currentLook = camera.getWorldDirection(new THREE.Vector3());
        camera.lookAt(
            targetLook.current.x,
            targetLook.current.y,
            targetLook.current.z
        );
    });

    return null;
};

// Need THREE import for Vector3
import * as THREE from 'three';

const GamePage = () => {
    const navigate = useNavigate();
    const { playerInfo, isAuthenticated, logout, loading } = useAuth();
    const { gameState, otherPlayerOnline, shootBall, recordGoal, answerQuestion } = useGameState();
    const ballRef = useRef();
    const [showGoalCelebration, setShowGoalCelebration] = useState(false);
    const [ballPosition, setBallPosition] = useState({ x: 0, y: 0.3, z: 5 });
    const [isFollowingBall, setIsFollowingBall] = useState(false);

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

    const handleShoot = (direction, power) => {
        // Start following the ball
        setIsFollowingBall(true);

        // Trigger ball shoot in 3D
        if (ballRef.current?.shoot) {
            ballRef.current.shoot(direction, power);
        }

        shootBall(direction, power);

        // Stop following after shot completes
        setTimeout(() => {
            setIsFollowingBall(false);
        }, 3000);
    };

    const handleGoal = () => {
        setShowGoalCelebration(true);
        recordGoal(playerInfo.name);
        setTimeout(() => {
            setShowGoalCelebration(false);
            setIsFollowingBall(false);
        }, 2500);
    };

    return (
        <div className="game-container">
            {/* Goal Celebration Overlay */}
            {showGoalCelebration && (
                <div className="goal-celebration">
                    <div className="goal-content">
                        <span className="goal-emoji">⚽</span>
                        <span className="goal-text">GOAL!</span>
                        <span className="goal-subtext">{playerInfo.name} scores! 💕</span>
                    </div>
                </div>
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
                    camera={{ position: [0, 5, 12], fov: 50 }}
                >
                    <Suspense fallback={null}>
                        {/* Dynamic Camera */}
                        <DynamicCamera
                            ballPosition={ballPosition}
                            isFollowing={isFollowingBall}
                        />

                        {/* Lighting */}
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

                        {/* Sky color */}
                        <color attach="background" args={['#1a0a2e']} />
                        <fog attach="fog" args={['#1a0a2e', 20, 50]} />

                        {/* Field */}
                        <FutsalField />

                        {/* Ball */}
                        <Ball
                            ref={ballRef}
                            position={gameState.ballPosition}
                            isShooter={true}
                            onShoot={handleShoot}
                            onGoal={handleGoal}
                        />

                        {/* Current Player (Shooter - behind the ball) */}
                        <Character
                            name={playerInfo.name}
                            position={[0, 0, 7]}
                            isPlayer={true}
                            isKeeper={false}
                            isOnline={true}
                        />

                        {/* Opponent (Goalkeeper - in front of goal) */}
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

            {/* Game Controls */}
            <GameControls onShoot={handleShoot} />

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
