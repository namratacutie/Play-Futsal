// Game State Hook - Real-time game synchronization
import { useState, useEffect, useCallback } from 'react';
import { database } from '../firebase';
import { ref, set, onValue, update, serverTimestamp, push } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

export const useGameState = () => {
    const { playerInfo } = useAuth();
    const [gameState, setGameState] = useState({
        suprem: { online: false, score: 0, lovePoints: 0, isReady: false },
        nammu: { online: false, score: 0, lovePoints: 0, isReady: false },
        currentShooter: null,
        ballPosition: { x: 0, y: 0, z: 5 },
        goalKeeperPosition: { x: 0, y: 0 },
        gameMode: 'waiting', // 'waiting', 'penalty', 'match'
        lastGoal: null,
        questionActive: false,
        currentQuestion: null
    });
    const [otherPlayerOnline, setOtherPlayerOnline] = useState(false);

    // Listen to presence changes
    useEffect(() => {
        const presenceRef = ref(database, 'presence');

        const unsubscribe = onValue(presenceRef, (snapshot) => {
            const presence = snapshot.val() || {};
            const supremOnline = presence.Suprem?.online || false;
            const nammuOnline = presence.Nammu?.online || false;

            // Determine game mode
            let mode = 'waiting';
            if (supremOnline && nammuOnline) {
                mode = 'match';
            } else if (supremOnline || nammuOnline) {
                mode = 'penalty';
            }

            // Check if other player is online
            if (playerInfo) {
                const other = playerInfo.name === 'Suprem' ? nammuOnline : supremOnline;
                setOtherPlayerOnline(other);
            }

            setGameState(prev => ({
                ...prev,
                suprem: { ...prev.suprem, online: supremOnline },
                nammu: { ...prev.nammu, online: nammuOnline },
                gameMode: mode
            }));
        });

        return () => unsubscribe();
    }, [playerInfo]);

    // Listen to game state changes
    useEffect(() => {
        const gameRef = ref(database, 'game');

        const unsubscribe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setGameState(prev => ({
                    ...prev,
                    ...data,
                    // Preserve local online status
                    suprem: { ...prev.suprem, ...data.suprem },
                    nammu: { ...prev.nammu, ...data.nammu }
                }));
            }
        });

        return () => unsubscribe();
    }, []);

    // Update ball position in real-time
    const updateBallPosition = useCallback(async (position) => {
        const ballRef = ref(database, 'game/ballPosition');
        await set(ballRef, {
            ...position,
            timestamp: serverTimestamp()
        });
    }, []);

    // Update goalkeeper position
    const updateGoalkeeperPosition = useCallback(async (position) => {
        const keeperRef = ref(database, 'game/goalKeeperPosition');
        await set(keeperRef, position);
    }, []);

    // Record a goal
    const recordGoal = useCallback(async (scorerName) => {
        const gameRef = ref(database, 'game');
        const updates = {};

        if (scorerName === 'Suprem') {
            updates['suprem/score'] = (gameState.suprem?.score || 0) + 1;
        } else {
            updates['nammu/score'] = (gameState.nammu?.score || 0) + 1;
        }

        updates['lastGoal'] = {
            scorer: scorerName,
            timestamp: serverTimestamp()
        };
        updates['questionActive'] = true;

        await update(gameRef, updates);
    }, [gameState]);

    // Answer question & Update Love Points
    const answerQuestion = useCallback(async (answer, points) => {
        const gameRef = ref(database, 'game');

        // Update love points for the answering player
        const updates = {
            questionActive: false,
            currentQuestion: null
        };

        if (playerInfo?.name === 'Suprem') {
            updates['suprem/lovePoints'] = (gameState.suprem?.lovePoints || 0) + points;
        } else if (playerInfo?.name === 'Nammu') {
            updates['nammu/lovePoints'] = (gameState.nammu?.lovePoints || 0) + points;
        }

        await update(gameRef, updates);

        // Log the answer
        const answersRef = ref(database, 'answers');
        await push(answersRef, {
            player: playerInfo?.name,
            answer,
            points,
            timestamp: serverTimestamp()
        });
    }, [playerInfo, gameState]);

    // Set current shooter
    const setShooter = useCallback(async (shooterName) => {
        const shooterRef = ref(database, 'game/currentShooter');
        await set(shooterRef, shooterName);
    }, []);

    // Shoot the ball
    const shootBall = useCallback(async (direction, power) => {
        const shootRef = ref(database, 'game/currentShot');
        await set(shootRef, {
            shooter: playerInfo?.name,
            direction,
            power,
            timestamp: serverTimestamp()
        });
    }, [playerInfo]);

    // Reset game
    const resetGame = useCallback(async () => {
        const gameRef = ref(database, 'game');
        await set(gameRef, {
            suprem: { score: 0, lovePoints: 0, isReady: false },
            nammu: { score: 0, lovePoints: 0, isReady: false },
            currentShooter: null,
            ballPosition: { x: 0, y: 0, z: 5 },
            goalKeeperPosition: { x: 0, y: 0 },
            lastGoal: null,
            questionActive: false,
            currentQuestion: null
        });
    }, []);

    return {
        gameState,
        otherPlayerOnline,
        updateBallPosition,
        updateGoalkeeperPosition,
        recordGoal,
        answerQuestion,
        setShooter,
        shootBall,
        resetGame
    };
};

export default useGameState;
