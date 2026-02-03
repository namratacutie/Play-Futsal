// Character Component - Suprem & Nammu
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const Character = ({ name, position, isPlayer, isKeeper, isOnline }) => {
    const characterRef = useRef();
    const [isHit, setIsHit] = useState(false);
    const [hitAnimation, setHitAnimation] = useState(0);
    const [jumpPhase, setJumpPhase] = useState(0);

    const isMale = name === 'Suprem';
    const primaryColor = isMale ? '#6495ed' : '#ff6b95';
    const secondaryColor = isMale ? '#4169e1' : '#ff4757';

    // Animation loop
    useFrame((state, delta) => {
        if (!characterRef.current) return;

        // Idle animation - slight movement
        if (!isHit) {
            characterRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }

        // Keeper movement if AI controlled
        if (isKeeper && !isOnline) {
            const targetX = Math.sin(state.clock.elapsedTime * 1.5) * 1.5;
            characterRef.current.position.x = THREE.MathUtils.lerp(
                characterRef.current.position.x,
                targetX,
                delta * 2
            );
        }

        // Hit animation (funny injury)
        if (isHit) {
            setHitAnimation(prev => prev + delta);

            if (hitAnimation < 0.3) {
                // Stumble back
                characterRef.current.rotation.x = Math.sin(hitAnimation * 20) * 0.5;
            } else if (hitAnimation < 1) {
                // Fall down
                characterRef.current.rotation.x = Math.PI / 2 * Math.min(1, (hitAnimation - 0.3) * 3);
            } else if (hitAnimation > 2) {
                // Reset
                setIsHit(false);
                setHitAnimation(0);
                characterRef.current.rotation.x = 0;
            }
        }

        // Keeper diving animation
        if (jumpPhase > 0) {
            setJumpPhase(prev => Math.max(0, prev - delta));
            characterRef.current.position.y = Math.sin(jumpPhase * Math.PI) * 0.5;
        }
    });

    // Trigger hit animation when ball hits
    const onBallHit = () => {
        setIsHit(true);
        setHitAnimation(0);
    };

    // Expose hit function
    useEffect(() => {
        if (characterRef.current) {
            characterRef.current.userData.onHit = onBallHit;
        }
    }, []);

    return (
        <group ref={characterRef} position={position}>
            {/* Body */}
            <mesh castShadow position={[0, 0.8, 0]}>
                <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
                <meshStandardMaterial color={primaryColor} />
            </mesh>

            {/* Head */}
            <mesh castShadow position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="#ffd5c8" />
            </mesh>

            {/* Hair */}
            <mesh position={[0, 1.65, 0]}>
                <sphereGeometry args={[0.27, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={isMale ? '#4a3728' : '#1a1a1a'} />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.08, 1.55, 0.2]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#333333" />
            </mesh>
            <mesh position={[0.08, 1.55, 0.2]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#333333" />
            </mesh>

            {/* Smile */}
            <mesh position={[0, 1.42, 0.22]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
                <meshBasicMaterial color="#ff4757" />
            </mesh>

            {/* Jersey Number / Heart */}
            <mesh position={[0, 0.9, 0.31]}>
                <planeGeometry args={[0.15, 0.15]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Arms */}
            <mesh castShadow position={[-0.4, 0.9, 0]} rotation={[0, 0, Math.PI / 6]}>
                <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
                <meshStandardMaterial color={primaryColor} />
            </mesh>
            <mesh castShadow position={[0.4, 0.9, 0]} rotation={[0, 0, -Math.PI / 6]}>
                <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
                <meshStandardMaterial color={primaryColor} />
            </mesh>

            {/* Hands */}
            <mesh position={[-0.55, 0.6, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#ffd5c8" />
            </mesh>
            <mesh position={[0.55, 0.6, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#ffd5c8" />
            </mesh>

            {/* Legs */}
            <mesh castShadow position={[-0.15, 0.25, 0]}>
                <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
                <meshStandardMaterial color={secondaryColor} />
            </mesh>
            <mesh castShadow position={[0.15, 0.25, 0]}>
                <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
                <meshStandardMaterial color={secondaryColor} />
            </mesh>

            {/* Feet */}
            <mesh position={[-0.15, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.08, 0.15, 4, 8]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
            <mesh position={[0.15, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.08, 0.15, 4, 8]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Name Tag */}
            <Text
                position={[0, 2, 0]}
                fontSize={0.2}
                color={primaryColor}
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>

            {/* Online Indicator */}
            {isOnline && (
                <mesh position={[0.35, 2, 0]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshBasicMaterial color="#00ff00" />
                </mesh>
            )}

            {/* Keeper Gloves (if goalkeeper) */}
            {isKeeper && (
                <>
                    <mesh position={[-0.55, 0.6, 0]}>
                        <sphereGeometry args={[0.12, 8, 8]} />
                        <meshStandardMaterial color="#ffff00" />
                    </mesh>
                    <mesh position={[0.55, 0.6, 0]}>
                        <sphereGeometry args={[0.12, 8, 8]} />
                        <meshStandardMaterial color="#ffff00" />
                    </mesh>
                </>
            )}

            {/* Special effect for player character */}
            {isPlayer && (
                <mesh position={[0, 0, 0]}>
                    <ringGeometry args={[0.5, 0.55, 32]} />
                    <meshBasicMaterial color={primaryColor} transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Funny injury effects */}
            {isHit && (
                <>
                    {/* Stars spinning around head */}
                    <group position={[0, 1.8, 0]}>
                        {[0, 1, 2].map(i => (
                            <mesh
                                key={i}
                                position={[
                                    Math.cos(hitAnimation * 5 + i * 2.1) * 0.4,
                                    0.1,
                                    Math.sin(hitAnimation * 5 + i * 2.1) * 0.4
                                ]}
                            >
                                <octahedronGeometry args={[0.08]} />
                                <meshBasicMaterial color="#ffff00" />
                            </mesh>
                        ))}
                    </group>

                    {/* Speech bubble */}
                    <Text
                        position={[0.5, 2.2, 0]}
                        fontSize={0.25}
                        color="#ff4757"
                        anchorX="center"
                    >
                        Ouch! 😵
                    </Text>
                </>
            )}
        </group>
    );
};

export default Character;
