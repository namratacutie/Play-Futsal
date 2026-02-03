// 3D Futsal Field with Romantic Decorations
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const FutsalField = () => {
    const heartsRef = useRef([]);

    // Animate floating hearts
    useFrame((state) => {
        heartsRef.current.forEach((heart, i) => {
            if (heart) {
                heart.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
                heart.rotation.y = state.clock.elapsedTime * 0.5;
            }
        });
    });

    return (
        <group>
            {/* Main Field */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[20, 30]} />
                <meshStandardMaterial color="#1a6b35" />
            </mesh>

            {/* Field Lines */}
            <FieldLines />

            {/* Goals */}
            <Goal position={[0, 0, -12]} />
            <Goal position={[0, 0, 12]} rotation={[0, Math.PI, 0]} />

            {/* Romantic Decorations */}
            {/* Corner Hearts */}
            {[[-9, 0.5, -14], [9, 0.5, -14], [-9, 0.5, 14], [9, 0.5, 14]].map((pos, i) => (
                <mesh
                    key={i}
                    position={pos}
                    ref={(el) => (heartsRef.current[i] = el)}
                >
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="#ff6b95" emissive="#ff6b95" emissiveIntensity={0.3} />
                </mesh>
            ))}

            {/* Center Circle with Heart Pattern */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[2, 2.1, 32]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            {/* Suprem ❤️ Nammu Text on Field */}
            <Text
                position={[0, 0.02, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.8}
                color="#ff6b95"
                anchorX="center"
                anchorY="middle"
            >
                ❤️
            </Text>

            {/* Side Decorations - Fairy Lights Effect */}
            <FairyLights />

            {/* Ambient Particles */}
            <FloatingParticles />
        </group>
    );
};

// Field Lines Component
const FieldLines = () => {
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#ffffff' });

    return (
        <group position={[0, 0.02, 0]}>
            {/* Outer boundary */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0, 0.05, 4]} />
                <meshBasicMaterial color="white" />
            </mesh>

            {/* Center line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[18, 0.1]} />
                <meshBasicMaterial color="white" />
            </mesh>

            {/* Penalty areas */}
            <PenaltyArea position={[0, 0, -10]} />
            <PenaltyArea position={[0, 0, 10]} />
        </group>
    );
};

// Penalty Area Component
const PenaltyArea = ({ position }) => (
    <group position={position}>
        {/* Box */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 0.1]} />
            <meshBasicMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0, -2]}>
            <planeGeometry args={[0.1, 4]} />
            <meshBasicMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0, -2]}>
            <planeGeometry args={[0.1, 4]} />
            <meshBasicMaterial color="white" />
        </mesh>

        {/* Penalty spot */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]}>
            <circleGeometry args={[0.15, 16]} />
            <meshBasicMaterial color="white" />
        </mesh>
    </group>
);

// Goal Component (3m x 2m)
const Goal = ({ position, rotation = [0, 0, 0] }) => (
    <group position={position} rotation={rotation}>
        {/* Goal posts */}
        <mesh position={[-1.5, 1, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[1.5, 1, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Crossbar */}
        <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 3.2, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Net (simplified) */}
        <mesh position={[0, 1, -0.5]}>
            <boxGeometry args={[3, 2, 1]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.2} wireframe />
        </mesh>
    </group>
);

// Fairy Lights along the sides
const FairyLights = () => {
    const lightsRef = useRef([]);

    useFrame((state) => {
        lightsRef.current.forEach((light, i) => {
            if (light) {
                light.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 3 + i * 0.5) * 0.3;
            }
        });
    });

    const positions = [];
    for (let i = -12; i <= 12; i += 2) {
        positions.push([-10, 0.3, i]);
        positions.push([10, 0.3, i]);
    }

    return (
        <group>
            {positions.map((pos, i) => (
                <group key={i} position={pos}>
                    <mesh>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial
                            color={i % 2 === 0 ? "#ff6b95" : "#6495ed"}
                            emissive={i % 2 === 0 ? "#ff6b95" : "#6495ed"}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                    <pointLight
                        ref={(el) => (lightsRef.current[i] = el)}
                        color={i % 2 === 0 ? "#ff6b95" : "#6495ed"}
                        intensity={0.3}
                        distance={3}
                    />
                </group>
            ))}
        </group>
    );
};

// Floating Particles for magical effect
const FloatingParticles = () => {
    const particlesRef = useRef();
    const count = 50;

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = Math.random() * 5 + 1;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            const positions = particlesRef.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                positions[i * 3 + 1] = Math.sin(state.clock.elapsedTime + i) * 0.5 + 3;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.1} color="#ff6b95" transparent opacity={0.6} />
        </points>
    );
};

export default FutsalField;
