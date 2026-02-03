// 3D Football with Realistic Physics
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Ball = forwardRef(({ position, isShooter, onShoot, onGoal }, ref) => {
    const ballRef = useRef();
    const [isAnimating, setIsAnimating] = useState(false);
    const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0.3, z: 5 });
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [hasScored, setHasScored] = useState(false);

    // Reset position
    const resetBall = () => {
        setCurrentPos({ x: 0, y: 0.3, z: 5 });
        setVelocity({ x: 0, y: 0, z: 0 });
        setIsAnimating(false);
        setHasScored(false);
    };

    // Shoot function exposed via ref
    const shoot = (direction, power) => {
        if (isAnimating) return;

        setIsAnimating(true);
        setHasScored(false);

        // Calculate velocity based on direction and power
        const speed = 0.3 + power * 0.4; // Base speed + power bonus
        const lift = 0.08 + power * 0.12; // Ball arc

        setVelocity({
            x: direction * speed * 0.5, // Side movement
            y: lift, // Initial upward velocity
            z: -speed // Forward velocity (towards goal)
        });

        onShoot?.(direction, power);
    };

    // Expose shoot function to parent
    useImperativeHandle(ref, () => ({
        shoot,
        reset: resetBall
    }));

    // Ball animation loop
    useFrame((state, delta) => {
        if (!ballRef.current) return;

        // Update ball mesh position
        ballRef.current.position.set(currentPos.x, currentPos.y, currentPos.z);

        if (!isAnimating) {
            // Idle rotation
            setRotation(prev => ({
                x: prev.x + delta * 0.5,
                y: prev.y + delta * 0.3
            }));
        } else {
            // Apply physics
            const gravity = 0.015;
            const friction = 0.995;
            const groundLevel = 0.3;

            // Update velocity
            const newVelocity = {
                x: velocity.x * friction,
                y: velocity.y - gravity, // Gravity
                z: velocity.z * friction
            };

            // Update position
            let newPos = {
                x: currentPos.x + newVelocity.x,
                y: currentPos.y + newVelocity.y,
                z: currentPos.z + newVelocity.z
            };

            // Ground bounce
            if (newPos.y < groundLevel) {
                newPos.y = groundLevel;
                newVelocity.y = Math.abs(newVelocity.y) * 0.5; // Bounce with energy loss

                // Friction on ground
                newVelocity.x *= 0.8;
                newVelocity.z *= 0.8;
            }

            // Ball spin during flight
            setRotation(prev => ({
                x: prev.x - delta * 15 * Math.abs(newVelocity.z),
                y: prev.y + delta * 5 * newVelocity.x
            }));

            setVelocity(newVelocity);
            setCurrentPos(newPos);

            // Check for goal (goal line at z = -10, goal width = 4, height = 2)
            if (newPos.z <= -10 && !hasScored) {
                if (Math.abs(newPos.x) < 2 && newPos.y < 2.5 && newPos.y > 0) {
                    // GOAL!
                    setHasScored(true);
                    onGoal?.();
                    setTimeout(resetBall, 2000);
                } else {
                    // Miss - reset after a moment
                    setTimeout(resetBall, 1500);
                }
            }

            // Ball went too far - reset
            if (newPos.z < -15 || Math.abs(newPos.x) > 12) {
                setTimeout(resetBall, 500);
            }

            // Ball stopped moving - reset
            const totalVelocity = Math.abs(newVelocity.x) + Math.abs(newVelocity.y) + Math.abs(newVelocity.z);
            if (totalVelocity < 0.01 && newPos.z < 4) {
                setTimeout(resetBall, 1000);
            }
        }

        // Apply rotation
        ballRef.current.rotation.x = rotation.x;
        ballRef.current.rotation.y = rotation.y;
    });

    return (
        <group>
            {/* Main Ball */}
            <mesh
                ref={ballRef}
                position={[currentPos.x, currentPos.y, currentPos.z]}
                castShadow
            >
                <sphereGeometry args={[0.22, 32, 32]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={0.4}
                    metalness={0.1}
                />
                {/* Ball pattern */}
                <mesh>
                    <icosahedronGeometry args={[0.225, 0]} />
                    <meshBasicMaterial color="#333333" wireframe />
                </mesh>
            </mesh>

            {/* Ball shadow */}
            <mesh
                position={[currentPos.x, 0.01, currentPos.z]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[0.2 * (1 - currentPos.y * 0.1), 16]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.3 - currentPos.y * 0.05} />
            </mesh>

            {/* Trail effect when moving fast */}
            {isAnimating && Math.abs(velocity.z) > 0.1 && (
                <group>
                    {[1, 2, 3].map((i) => (
                        <mesh
                            key={i}
                            position={[
                                currentPos.x - velocity.x * i * 2,
                                currentPos.y - velocity.y * i * 2,
                                currentPos.z - velocity.z * i * 2
                            ]}
                        >
                            <sphereGeometry args={[0.15 - i * 0.03, 8, 8]} />
                            <meshBasicMaterial
                                color="#ff6b95"
                                transparent
                                opacity={0.4 - i * 0.1}
                            />
                        </mesh>
                    ))}
                </group>
            )}
        </group>
    );
});

Ball.displayName = 'Ball';

export default Ball;
