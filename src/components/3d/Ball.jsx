// 3D Football with Realistic Physics - Proper Direction Control
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Ball = forwardRef(({ position, isShooter, onShoot, onGoal }, ref) => {
    const ballRef = useRef();
    const [isAnimating, setIsAnimating] = useState(false);
    const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0.3, z: 5 });
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [hasScored, setHasScored] = useState(false);
    const [spin, setSpin] = useState({ x: 0, y: 0 });

    // Reset ball to starting position
    const resetBall = () => {
        setCurrentPos({ x: 0, y: 0.3, z: 5 });
        setVelocity({ x: 0, y: 0, z: 0 });
        setIsAnimating(false);
        setHasScored(false);
        setSpin({ x: 0, y: 0 });
    };

    // Shoot function with realistic physics
    const shoot = (direction, power) => {
        if (isAnimating) return;

        setIsAnimating(true);
        setHasScored(false);

        // REALISTIC PHYSICS CALCULATION
        // direction: -1 (left) to 1 (right)
        // power: 0 to 1

        const baseSpeed = 0.4; // Base forward speed
        const maxSpeedBonus = 0.5; // Additional speed from power
        const forwardSpeed = baseSpeed + (power * maxSpeedBonus);

        // Horizontal velocity based on direction
        // Stronger direction = more sideways movement
        const horizontalSpeed = direction * (0.25 + power * 0.15);

        // Vertical velocity (lift) - more power = higher arc
        const liftSpeed = 0.08 + (power * 0.15);

        // Add some randomness for realism (slight inaccuracy)
        const randomX = (Math.random() - 0.5) * 0.02;
        const randomY = (Math.random() - 0.5) * 0.01;

        // Set velocity
        setVelocity({
            x: horizontalSpeed + randomX,
            y: liftSpeed + randomY,
            z: -forwardSpeed // Negative = towards goal
        });

        // Add spin based on direction (curve ball effect)
        setSpin({
            x: forwardSpeed * 8, // Forward spin
            y: direction * 3 // Side spin for curve
        });

        console.log(`Shot: direction=${direction.toFixed(2)}, power=${power.toFixed(2)}, velocity=`, {
            x: horizontalSpeed.toFixed(3),
            y: liftSpeed.toFixed(3),
            z: (-forwardSpeed).toFixed(3)
        });
    };

    // Expose functions to parent
    useImperativeHandle(ref, () => ({
        shoot,
        reset: resetBall,
        getPosition: () => currentPos
    }));

    // Physics simulation loop
    useFrame((state, delta) => {
        if (!ballRef.current) return;

        // Update mesh position
        ballRef.current.position.set(currentPos.x, currentPos.y, currentPos.z);

        if (!isAnimating) {
            // Idle: gentle bobbing
            const idleBob = Math.sin(state.clock.elapsedTime * 2) * 0.02;
            ballRef.current.position.y = 0.3 + idleBob;

            // Slow rotation
            setRotation(prev => ({
                x: prev.x + delta * 0.3,
                y: prev.y + delta * 0.2
            }));
        } else {
            // ACTIVE PHYSICS SIMULATION
            const gravity = 0.018; // Gravity acceleration
            const airResistance = 0.997; // Air drag
            const groundFriction = 0.85; // Ground friction
            const bounciness = 0.55; // How bouncy the ball is
            const groundLevel = 0.22; // Ball radius from ground

            // Apply gravity
            let newVel = {
                x: velocity.x * airResistance,
                y: velocity.y - gravity,
                z: velocity.z * airResistance
            };

            // Calculate new position
            let newPos = {
                x: currentPos.x + newVel.x,
                y: currentPos.y + newVel.y,
                z: currentPos.z + newVel.z
            };

            // Ground collision
            if (newPos.y < groundLevel) {
                newPos.y = groundLevel;
                newVel.y = Math.abs(newVel.y) * bounciness;

                // Apply ground friction
                newVel.x *= groundFriction;
                newVel.z *= groundFriction;

                // Stop tiny bounces
                if (Math.abs(newVel.y) < 0.02) {
                    newVel.y = 0;
                }
            }

            // Side boundaries (field width ~10 on each side)
            if (Math.abs(newPos.x) > 8) {
                newPos.x = Math.sign(newPos.x) * 8;
                newVel.x *= -0.5; // Bounce off side
            }

            // Ball rotation (spin)
            setRotation(prev => ({
                x: prev.x - spin.x * delta,
                y: prev.y + spin.y * delta
            }));

            // Update state
            setVelocity(newVel);
            setCurrentPos(newPos);

            // GOAL DETECTION
            // Goal is at z = -10, width = 4m (-2 to 2), height = 2.5m
            if (newPos.z <= -10 && !hasScored) {
                const inGoalWidth = Math.abs(newPos.x) < 2;
                const inGoalHeight = newPos.y < 2.5 && newPos.y > 0;

                if (inGoalWidth && inGoalHeight) {
                    // GOAL!
                    console.log('GOAL! Position:', newPos);
                    setHasScored(true);
                    onGoal?.();
                    setTimeout(resetBall, 2500);
                } else {
                    // Miss!
                    console.log('MISS! Position:', newPos);
                    setTimeout(resetBall, 1500);
                }
                return;
            }

            // Ball went too far or stopped
            if (newPos.z < -15 || newPos.z > 10) {
                setTimeout(resetBall, 500);
                return;
            }

            // Ball stopped moving
            const totalSpeed = Math.sqrt(newVel.x ** 2 + newVel.y ** 2 + newVel.z ** 2);
            if (totalSpeed < 0.005 && newPos.z < 4) {
                setTimeout(resetBall, 1000);
            }
        }

        // Apply rotation to mesh
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
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>

            {/* Ball pentagon pattern */}
            <mesh
                position={[currentPos.x, currentPos.y, currentPos.z]}
                rotation={[rotation.x, rotation.y, 0]}
            >
                <icosahedronGeometry args={[0.225, 0]} />
                <meshBasicMaterial color="#1a1a1a" wireframe />
            </mesh>

            {/* Dynamic shadow */}
            <mesh
                position={[currentPos.x, 0.01, currentPos.z]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[0.25 * (1 / (1 + currentPos.y * 0.3)), 16]} />
                <meshBasicMaterial
                    color="#000000"
                    transparent
                    opacity={Math.max(0.1, 0.4 - currentPos.y * 0.1)}
                />
            </mesh>

            {/* Motion trail when moving fast */}
            {isAnimating && Math.abs(velocity.z) > 0.15 && (
                <group>
                    {[1, 2, 3, 4].map((i) => (
                        <mesh
                            key={i}
                            position={[
                                currentPos.x - velocity.x * i * 1.5,
                                currentPos.y - velocity.y * i * 1.5,
                                currentPos.z - velocity.z * i * 1.5
                            ]}
                        >
                            <sphereGeometry args={[0.12 - i * 0.02, 8, 8]} />
                            <meshBasicMaterial
                                color="#ff6b95"
                                transparent
                                opacity={0.5 - i * 0.1}
                            />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Impact effect when hitting ground */}
            {isAnimating && currentPos.y < 0.3 && Math.abs(velocity.y) > 0.05 && (
                <mesh position={[currentPos.x, 0.02, currentPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.1, 0.4, 16]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
                </mesh>
            )}
        </group>
    );
});

Ball.displayName = 'Ball';

export default Ball;
