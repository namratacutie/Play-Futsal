// Character Component - Suprem & Nammu (Fixed Proportions)
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const Character = ({ name, position, isPlayer, isKeeper, isOnline }) => {
    const characterRef = useRef();
    const [isHit, setIsHit] = useState(false);
    const [hitAnimation, setHitAnimation] = useState(0);
    const [armAngle, setArmAngle] = useState(0);

    const isMale = name === 'Suprem';
    const primaryColor = isMale ? '#6495ed' : '#ff6b95';
    const secondaryColor = isMale ? '#4169e1' : '#ff4757';
    const skinColor = '#e8beac';
    const hairColor = isMale ? '#3d2314' : '#1a1a1a';

    // Animation loop
    useFrame((state, delta) => {
        if (!characterRef.current) return;

        // Keeper ready stance animation
        if (isKeeper) {
            // Sway side to side
            const sway = Math.sin(state.clock.elapsedTime * 2) * 0.3;
            characterRef.current.position.x = position[0] + sway;

            // Slight bounce
            characterRef.current.position.y = position[1] + Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.1;

            // Arms ready position
            setArmAngle(Math.sin(state.clock.elapsedTime * 2) * 0.2);
        } else if (isPlayer) {
            // Striker idle animation
            characterRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
        }

        // Hit animation (funny injury)
        if (isHit) {
            setHitAnimation(prev => prev + delta);

            if (hitAnimation < 0.3) {
                characterRef.current.rotation.x = Math.sin(hitAnimation * 20) * 0.3;
                characterRef.current.rotation.z = Math.sin(hitAnimation * 15) * 0.2;
            } else if (hitAnimation < 1.5) {
                // Dramatic fall
                characterRef.current.rotation.x = Math.min(Math.PI / 3, (hitAnimation - 0.3) * 2);
                characterRef.current.position.y = Math.max(-0.3, position[1] - (hitAnimation - 0.3) * 0.5);
            } else if (hitAnimation > 3) {
                // Reset
                setIsHit(false);
                setHitAnimation(0);
                characterRef.current.rotation.x = 0;
                characterRef.current.rotation.z = 0;
                characterRef.current.position.y = position[1];
            }
        }
    });

    // Trigger hit animation
    const onBallHit = () => {
        setIsHit(true);
        setHitAnimation(0);
    };

    useEffect(() => {
        if (characterRef.current) {
            characterRef.current.userData.onHit = onBallHit;
        }
    }, []);

    return (
        <group ref={characterRef} position={position}>
            {/* Body/Torso */}
            <mesh castShadow position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.7, 16]} />
                <meshStandardMaterial color={primaryColor} />
            </mesh>

            {/* Head */}
            <mesh castShadow position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.22, 24, 24]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>

            {/* Hair */}
            {isMale ? (
                // Short hair for Suprem
                <mesh position={[0, 1.62, 0]}>
                    <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={hairColor} />
                </mesh>
            ) : (
                // Longer hair for Nammu
                <group>
                    <mesh position={[0, 1.62, 0]}>
                        <sphereGeometry args={[0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color={hairColor} />
                    </mesh>
                    {/* Side hair */}
                    <mesh position={[-0.18, 1.4, 0]}>
                        <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
                        <meshStandardMaterial color={hairColor} />
                    </mesh>
                    <mesh position={[0.18, 1.4, 0]}>
                        <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
                        <meshStandardMaterial color={hairColor} />
                    </mesh>
                </group>
            )}

            {/* Face Features */}
            {/* Eyes */}
            <mesh position={[-0.07, 1.52, 0.18]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.07, 1.52, 0.18]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Pupils */}
            <mesh position={[-0.07, 1.52, 0.21]}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshBasicMaterial color="#333333" />
            </mesh>
            <mesh position={[0.07, 1.52, 0.21]}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshBasicMaterial color="#333333" />
            </mesh>

            {/* Smile */}
            <mesh position={[0, 1.42, 0.19]} rotation={[0.2, 0, 0]}>
                <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
                <meshBasicMaterial color="#d4756b" />
            </mesh>

            {/* Neck */}
            <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.15, 12]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>

            {/* Arms - Connected to body */}
            {/* Left Arm */}
            <group position={[-0.35, 0.95, 0]} rotation={[0, 0, Math.PI / 6 + armAngle]}>
                {/* Upper arm */}
                <mesh castShadow position={[0, -0.15, 0]}>
                    <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
                    <meshStandardMaterial color={primaryColor} />
                </mesh>
                {/* Lower arm */}
                <mesh castShadow position={[0, -0.4, 0.05]}>
                    <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.55, 0.08]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
            </group>

            {/* Right Arm */}
            <group position={[0.35, 0.95, 0]} rotation={[0, 0, -Math.PI / 6 - armAngle]}>
                {/* Upper arm */}
                <mesh castShadow position={[0, -0.15, 0]}>
                    <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
                    <meshStandardMaterial color={primaryColor} />
                </mesh>
                {/* Lower arm */}
                <mesh castShadow position={[0, -0.4, 0.05]}>
                    <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.55, 0.08]}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
            </group>

            {/* Keeper Gloves */}
            {isKeeper && (
                <>
                    <mesh position={[-0.35 - Math.sin(Math.PI / 6 + armAngle) * 0.55, 0.95 - Math.cos(Math.PI / 6 + armAngle) * 0.55, 0.08]}>
                        <sphereGeometry args={[0.09, 8, 8]} />
                        <meshStandardMaterial color="#ffeb3b" />
                    </mesh>
                    <mesh position={[0.35 + Math.sin(Math.PI / 6 + armAngle) * 0.55, 0.95 - Math.cos(Math.PI / 6 + armAngle) * 0.55, 0.08]}>
                        <sphereGeometry args={[0.09, 8, 8]} />
                        <meshStandardMaterial color="#ffeb3b" />
                    </mesh>
                </>
            )}

            {/* Shorts */}
            <mesh castShadow position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.28, 0.25, 0.25, 16]} />
                <meshStandardMaterial color={secondaryColor} />
            </mesh>

            {/* Legs */}
            {/* Left Leg */}
            <group position={[-0.12, 0.3, 0]}>
                <mesh castShadow position={[0, -0.15, 0]}>
                    <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                {/* Shin/Sock */}
                <mesh castShadow position={[0, -0.38, 0]}>
                    <capsuleGeometry args={[0.07, 0.2, 4, 8]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.52, 0.06]}>
                    <boxGeometry args={[0.1, 0.06, 0.18]} />
                    <meshStandardMaterial color="#2c3e50" />
                </mesh>
            </group>

            {/* Right Leg */}
            <group position={[0.12, 0.3, 0]}>
                <mesh castShadow position={[0, -0.15, 0]}>
                    <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
                    <meshStandardMaterial color={skinColor} />
                </mesh>
                {/* Shin/Sock */}
                <mesh castShadow position={[0, -0.38, 0]}>
                    <capsuleGeometry args={[0.07, 0.2, 4, 8]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.52, 0.06]}>
                    <boxGeometry args={[0.1, 0.06, 0.18]} />
                    <meshStandardMaterial color="#2c3e50" />
                </mesh>
            </group>

            {/* Jersey Number */}
            <Text
                position={[0, 0.9, 0.26]}
                fontSize={0.15}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                {isMale ? '10' : '7'}
            </Text>

            {/* Name Tag */}
            <Text
                position={[0, 1.9, 0]}
                fontSize={0.15}
                color={primaryColor}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000000"
            >
                {name}
            </Text>

            {/* Online Indicator */}
            {isOnline && (
                <mesh position={[0.25, 1.9, 0]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshBasicMaterial color="#2ecc71" />
                </mesh>
            )}

            {/* Player indicator ring */}
            {isPlayer && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.45, 32]} />
                    <meshBasicMaterial color={primaryColor} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Injury effects */}
            {isHit && (
                <>
                    {/* Stars */}
                    <group position={[0, 1.8, 0]}>
                        {[0, 1, 2].map(i => (
                            <mesh
                                key={i}
                                position={[
                                    Math.cos(hitAnimation * 5 + i * 2.1) * 0.35,
                                    0.15,
                                    Math.sin(hitAnimation * 5 + i * 2.1) * 0.35
                                ]}
                            >
                                <octahedronGeometry args={[0.06]} />
                                <meshBasicMaterial color="#ffeb3b" />
                            </mesh>
                        ))}
                    </group>
                    <Text
                        position={[0.4, 2, 0]}
                        fontSize={0.18}
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
