// Main Game Page with 3D Canvas, Dynamic Camera & Trajectory Preview
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

// Dynamic Camera that follows the action
const DynamicCamera = ({ isFollowing, targetZ }) => {
    const { camera } = useThree();
    const targetPos = useRef({ x: 0, y: 5, z: 12 });

    useFrame((state, delta) => {
        if (isFollowing) {
            // Follow shot - move camera forward and slightly up
            targetPos.current = {
                x: 0,
                y: 6,
                z: Math.max(0, targetZ + 10)
            };
        } else {
            // Default penalty kick view (behind the player)
            targetPos.current = { x: 0, y: 5, z: 12 };
        }

        // Smooth camera movement
        camera.position.x += (targetPos.current.x - camera.position.x) * delta * 2;
        camera.position.y += (targetPos.current.y - camera.position.y) * delta * 2;
        camera.position.z += (targetPos.current.z - camera.position.z) * delta * 2;

        // Always look at goal area
        camera.lookAt(0, 1, -5);
    });

    return null;
};

const GamePage = () => {
    const navigate = useNavigate();
    const { playerInfo, isAuthenticated, logout, loading } = useAuth();
    const { gameState, otherPlayerOnline, shootBall, recordGoal, answerQuestion } = useGameState();
    const ballRef = useRef();
    const [showGoalCelebration, setShowGoalCelebration] = useState(false);
    const [isFollowingBall, setIsFollowingBall] = useState(false);
    const [ballZ, setBallZ] = useState(5);

    // Aiming state for trajectory preview
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

    // Handle aim changes from controls
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
            setBallZ(5);
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
                            isFollowing={isFollowingBall}
                            targetZ={ballZ}
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
                        <fog attach="fog" args={['#1a0a2e', 25, 50]} />

                        {/* Field */}
                        <FutsalField />

                        {/* Trajectory Path - shows when aiming */}
                        <TrajectoryPath
                            direction={aimState.direction}
                            power={aimState.power}
                            visible={aimState.isAiming}
                            startPosition={[0, 0.3, 5]}
                        />

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

            {/* Game Controls with Aim Callback */}
            <GameControls
                onShoot={handleShoot}
                onAimChange={handleAimChange}
            />

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
