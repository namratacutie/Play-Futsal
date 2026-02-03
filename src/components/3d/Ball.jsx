// 3D Football with Realistic Physics - Fixed Goal Detection
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
    const [hasMissed, setHasMissed] = useState(false);
    const [spin, setSpin] = useState({ x: 0, y: 0 });

    // Goal dimensions (realistic futsal goal: 3m wide x 2m high)
    const GOAL_WIDTH = 3; // +/- 1.5 from center
    const GOAL_HEIGHT = 2;
    const GOAL_Z = -10;

    // Reset ball
    const resetBall = () => {
        setCurrentPos({ x: 0, y: 0.3, z: 5 });
        setVelocity({ x: 0, y: 0, z: 0 });
        setIsAnimating(false);
        setHasScored(false);
        setHasMissed(false);
        setSpin({ x: 0, y: 0 });
    };

    // Shoot function
    const shoot = (direction, power) => {
        if (isAnimating) return;

        setIsAnimating(true);
        setHasScored(false);
        setHasMissed(false);

        const baseSpeed = 0.4;
        const maxSpeedBonus = 0.5;
        const forwardSpeed = baseSpeed + (power * maxSpeedBonus);
        const horizontalSpeed = direction * (0.25 + power * 0.15);
        const liftSpeed = 0.08 + (power * 0.15);

        const randomX = (Math.random() - 0.5) * 0.02;
        const randomY = (Math.random() - 0.5) * 0.01;

        setVelocity({
            x: horizontalSpeed + randomX,
            y: liftSpeed + randomY,
            z: -forwardSpeed
        });

        setSpin({
            x: forwardSpeed * 8,
            y: direction * 3
        });

        console.log(`Shot: dir=${direction.toFixed(2)}, power=${power.toFixed(2)}`);
    };

    useImperativeHandle(ref, () => ({
        shoot,
        reset: resetBall,
        getPosition: () => currentPos
    }));

    // Physics loop
    useFrame((state, delta) => {
        if (!ballRef.current) return;

        ballRef.current.position.set(currentPos.x, currentPos.y, currentPos.z);

        if (!isAnimating) {
            const idleBob = Math.sin(state.clock.elapsedTime * 2) * 0.02;
            ballRef.current.position.y = 0.3 + idleBob;
            setRotation(prev => ({ x: prev.x + delta * 0.3, y: prev.y + delta * 0.2 }));
        } else {
            const gravity = 0.018;
            const airResistance = 0.997;
            const groundFriction = 0.85;
            const bounciness = 0.55;
            const groundLevel = 0.22;

            let newVel = {
                x: velocity.x * airResistance,
                y: velocity.y - gravity,
                z: velocity.z * airResistance
            };

            let newPos = {
                x: currentPos.x + newVel.x,
                y: currentPos.y + newVel.y,
                z: currentPos.z + newVel.z
            };

            // Ground collision
            if (newPos.y < groundLevel) {
                newPos.y = groundLevel;
                newVel.y = Math.abs(newVel.y) * bounciness;
                newVel.x *= groundFriction;
                newVel.z *= groundFriction;
                if (Math.abs(newVel.y) < 0.02) newVel.y = 0;
            }

            // Side boundaries
            if (Math.abs(newPos.x) > 8) {
                newPos.x = Math.sign(newPos.x) * 8;
                newVel.x *= -0.5;
            }

            // Ball rotation
            setRotation(prev => ({
                x: prev.x - spin.x * delta,
                y: prev.y + spin.y * delta
            }));

            setVelocity(newVel);
            setCurrentPos(newPos);

            // ========== GOAL DETECTION ==========
            // Check when ball crosses goal line (z <= GOAL_Z)
            if (newPos.z <= GOAL_Z && !hasScored && !hasMissed) {
                const inGoalWidth = Math.abs(newPos.x) <= (GOAL_WIDTH / 2); // Within goal width
                const inGoalHeight = newPos.y <= GOAL_HEIGHT && newPos.y >= 0; // Below crossbar, above ground

                if (inGoalWidth && inGoalHeight) {
                    // ✅ GOAL!
                    console.log('✅ GOAL! Ball position:', newPos);
                    setHasScored(true);
                    onGoal?.();
                    setTimeout(resetBall, 2500);
                } else {
                    // ❌ MISS - ball went wide or over
                    console.log('❌ MISS! Ball position:', newPos,
                        inGoalWidth ? '' : '(wide)',
                        inGoalHeight ? '' : '(over/under)');
                    setHasMissed(true);
                    setTimeout(resetBall, 1500);
                }
                return;
            }

            // Ball went too far behind goal or too far back
            if (newPos.z < -15 || newPos.z > 10) {
                if (!hasScored && !hasMissed) {
                    setHasMissed(true);
                }
                setTimeout(resetBall, 500);
                return;
            }

            // Ball stopped moving
            const totalSpeed = Math.sqrt(newVel.x ** 2 + newVel.y ** 2 + newVel.z ** 2);
            if (totalSpeed < 0.005 && newPos.z < 4 && !hasScored) {
                console.log('Ball stopped - resetting');
                setTimeout(resetBall, 1000);
            }
        }

        ballRef.current.rotation.x = rotation.x;
        ballRef.current.rotation.y = rotation.y;
    });

    return (
        <group>
            {/* Main Ball */}
            <mesh ref={ballRef} position={[currentPos.x, currentPos.y, currentPos.z]} castShadow>
                <sphereGeometry args={[0.22, 32, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Ball pattern */}
            <mesh position={[currentPos.x, currentPos.y, currentPos.z]} rotation={[rotation.x, rotation.y, 0]}>
                <icosahedronGeometry args={[0.225, 0]} />
                <meshBasicMaterial color="#1a1a1a" wireframe />
            </mesh>

            {/* Shadow */}
            <mesh position={[currentPos.x, 0.01, currentPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.25 * (1 / (1 + currentPos.y * 0.3)), 16]} />
                <meshBasicMaterial color="#000000" transparent opacity={Math.max(0.1, 0.4 - currentPos.y * 0.1)} />
            </mesh>

            {/* Motion trail */}
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
                            <meshBasicMaterial color="#ff6b95" transparent opacity={0.5 - i * 0.1} />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Miss indicator */}
            {hasMissed && (
                <mesh position={[currentPos.x, currentPos.y + 0.5, currentPos.z]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="#ff4757" />
                </mesh>
            )}
        </group>
    );
});

Ball.displayName = 'Ball';

export default Ball;
