// 3D Football with Heart Pattern
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Ball = ({ position, isShooter, onShoot, onGoal }) => {
    const ballRef = useRef();
    const trailRef = useRef([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
    const [currentPos, setCurrentPos] = useState(position || { x: 0, y: 0.3, z: 5 });

    // Update position from props
    useEffect(() => {
        if (position && !isAnimating) {
            setCurrentPos({
                x: position.x || 0,
                y: position.y || 0.3,
                z: position.z || 5
            });
        }
    }, [position, isAnimating]);

    // Ball animation loop
    useFrame((state, delta) => {
        if (!ballRef.current) return;

        // Update ball position
        ballRef.current.position.set(currentPos.x, currentPos.y, currentPos.z);

        // Idle rotation
        if (!isAnimating) {
            ballRef.current.rotation.x += delta * 0.5;
            ballRef.current.rotation.y += delta * 0.3;
        }

        // Shot animation
        if (isAnimating) {
            // Apply velocity
            const newPos = {
                x: currentPos.x + velocity.x * delta * 60,
                y: Math.max(0.3, currentPos.y + velocity.y * delta * 60),
                z: currentPos.z + velocity.z * delta * 60
            };

            // Apply gravity
            setVelocity(prev => ({
                ...prev,
                y: prev.y - 0.01
            }));

            setCurrentPos(newPos);

            // Check for goal
            if (newPos.z <= -11) {
                if (Math.abs(newPos.x) < 2 && newPos.y < 2) {
                    onGoal?.();
                }
                // Reset ball
                setIsAnimating(false);
                setVelocity({ x: 0, y: 0, z: 0 });
                setCurrentPos({ x: 0, y: 0.3, z: 5 });
            }

            // Ball spin during shot
            ballRef.current.rotation.x -= delta * 10;
        }
    });

    // Handle shooting (simplified - will be controlled by GameControls)
    const handleClick = () => {
        if (!isShooter || isAnimating) return;

        // Default shot
        shoot(0, 0.8);
    };

    const shoot = (direction, power) => {
        setIsAnimating(true);
        setVelocity({
            x: direction * power * 0.3,
            y: 0.15 * power,
            z: -power * 0.5
        });
        onShoot?.(direction, power);
    };

    // Expose shoot function for external controls
    useEffect(() => {
        if (ballRef.current) {
            ballRef.current.userData.shoot = shoot;
        }
    }, []);

    return (
        <group>
            {/* Main Ball */}
            <mesh
                ref={ballRef}
                position={[currentPos.x, currentPos.y, currentPos.z]}
                castShadow
                onClick={handleClick}
            >
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial>
                    <primitive attach="map" object={createBallTexture()} />
                </meshStandardMaterial>
            </mesh>

            {/* Ball glow */}
            <mesh position={[currentPos.x, currentPos.y, currentPos.z]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshBasicMaterial color="#ff6b95" transparent opacity={0.2} />
            </mesh>

            {/* Trail effect when moving */}
            {isAnimating && (
                <Trail position={[currentPos.x, currentPos.y, currentPos.z]} />
            )}
        </group>
    );
};

// Create ball texture with heart patterns
const createBallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base color (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Pentagon pattern (simplified football look)
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 3;

    // Draw some pentagon shapes
    const drawPentagon = (x, y, size) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72 - 90) * Math.PI / 180;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = '#ff6b95';
        ctx.fill();
        ctx.stroke();
    };

    drawPentagon(128, 128, 40);
    drawPentagon(60, 60, 30);
    drawPentagon(196, 60, 30);
    drawPentagon(60, 196, 30);
    drawPentagon(196, 196, 30);

    // Small hearts
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ff4757';
    ctx.fillText('❤', 100, 100);
    ctx.fillText('❤', 156, 156);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
};

// Trail component for ball movement effect
const Trail = ({ position }) => {
    return (
        <group>
            {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[position[0], position[1], position[2] + i * 0.3]}>
                    <sphereGeometry args={[0.1 - i * 0.015, 8, 8]} />
                    <meshBasicMaterial
                        color="#ff6b95"
                        transparent
                        opacity={0.5 - i * 0.1}
                    />
                </mesh>
            ))}
        </group>
    );
};

export default Ball;
