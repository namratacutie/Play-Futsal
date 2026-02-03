// Trajectory Path - Dashed arc matching ball physics
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TrajectoryPath = ({ direction, power, visible, startPosition = [0, 0.3, 5] }) => {
    const dotsRef = useRef([]);

    // Calculate trajectory using SAME physics as Ball.jsx
    const { trajectoryPoints, ballPositions, endPoint } = useMemo(() => {
        const points = [];
        const balls = [];
        const numBalls = 6;

        // SAME PHYSICS AS BALL.JSX
        const baseSpeed = 0.4;
        const maxSpeedBonus = 0.5;
        const forwardSpeed = baseSpeed + (power * maxSpeedBonus);
        const horizontalSpeed = direction * (0.25 + power * 0.15);
        const liftSpeed = 0.08 + (power * 0.15);

        let pos = {
            x: startPosition[0],
            y: startPosition[1],
            z: startPosition[2]
        };
        let vel = {
            x: horizontalSpeed,
            y: liftSpeed,
            z: -forwardSpeed
        };

        const gravity = 0.018;
        const airResistance = 0.997;
        const groundLevel = 0.22;
        const bounciness = 0.55;
        const groundFriction = 0.85;

        let pointCount = 0;
        const maxPoints = 150;
        const ballInterval = Math.floor(maxPoints / numBalls);

        // Simulate until goal line
        while (pos.z > -10 && pointCount < maxPoints) {
            points.push(new THREE.Vector3(pos.x, Math.max(groundLevel, pos.y), pos.z));

            // Save ball positions at intervals
            if (pointCount % ballInterval === 0 && balls.length < numBalls) {
                balls.push(new THREE.Vector3(pos.x, Math.max(groundLevel, pos.y), pos.z));
            }

            // Apply physics
            vel.y -= gravity;
            vel.x *= airResistance;
            vel.z *= airResistance;

            pos.x += vel.x;
            pos.y += vel.y;
            pos.z += vel.z;

            // Ground bounce
            if (pos.y < groundLevel) {
                pos.y = groundLevel;
                vel.y = Math.abs(vel.y) * bounciness;
                vel.x *= groundFriction;
                vel.z *= groundFriction;
            }

            pointCount++;
        }

        // Add final point at goal line
        const finalPoint = new THREE.Vector3(pos.x, Math.max(groundLevel, pos.y), -10);
        points.push(finalPoint);
        balls.push(finalPoint);

        return {
            trajectoryPoints: points,
            ballPositions: balls,
            endPoint: finalPoint
        };
    }, [direction, power, startPosition]);

    // Animate balls
    useFrame((state) => {
        dotsRef.current.forEach((dot, i) => {
            if (dot) {
                const pulse = Math.sin(state.clock.elapsedTime * 3 + i) * 0.03;
                dot.position.y = (ballPositions[i]?.y || 0.3) + pulse;
            }
        });
    });

    if (!visible || trajectoryPoints.length < 2) return null;

    // Create smooth curve through points
    const curve = new THREE.CatmullRomCurve3(trajectoryPoints);
    const curvePoints = curve.getPoints(80);

    // Check if shot will be a goal
    const isGoal = Math.abs(endPoint.x) < 2 && endPoint.y < 2.5 && endPoint.y > 0;

    return (
        <group>
            {/* Dashed trajectory line */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={curvePoints.length}
                        array={new Float32Array(curvePoints.flatMap(p => [p.x, p.y, p.z]))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineDashedMaterial
                    color={isGoal ? "#2ecc71" : "#00bfff"}
                    dashSize={0.25}
                    gapSize={0.12}
                    transparent
                    opacity={0.9}
                />
            </line>

            {/* Ball icons along path */}
            {ballPositions.map((pos, i) => (
                <group
                    key={i}
                    ref={(el) => (dotsRef.current[i] = el)}
                    position={[pos.x, pos.y, pos.z]}
                >
                    {/* Ball */}
                    <mesh>
                        <sphereGeometry args={[0.12, 12, 12]} />
                        <meshStandardMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.4 + (i / ballPositions.length) * 0.5}
                        />
                    </mesh>
                    {/* Pattern */}
                    <mesh>
                        <icosahedronGeometry args={[0.125, 0]} />
                        <meshBasicMaterial
                            color="#333333"
                            wireframe
                            transparent
                            opacity={0.3 + (i / ballPositions.length) * 0.4}
                        />
                    </mesh>
                </group>
            ))}

            {/* Target indicator at end */}
            <group position={[endPoint.x, endPoint.y, endPoint.z]}>
                {/* Target circle */}
                <mesh rotation={[0, 0, 0]}>
                    <torusGeometry args={[0.25, 0.04, 8, 24]} />
                    <meshBasicMaterial color={isGoal ? "#2ecc71" : "#ff4757"} />
                </mesh>
                {/* Center dot */}
                <mesh>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshBasicMaterial color={isGoal ? "#2ecc71" : "#ff4757"} />
                </mesh>
                {/* Goal/Miss indicator */}
                {isGoal && (
                    <mesh position={[0, 0.4, 0]}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshBasicMaterial color="#2ecc71" />
                    </mesh>
                )}
            </group>

            {/* Goal frame highlight */}
            <group position={[0, 1.25, -10]}>
                {/* Left post */}
                <mesh position={[-2, 0, 0]}>
                    <boxGeometry args={[0.15, 2.5, 0.15]} />
                    <meshBasicMaterial
                        color={direction < -0.3 ? "#2ecc71" : "#ffffff"}
                        transparent
                        opacity={0.4}
                    />
                </mesh>
                {/* Right post */}
                <mesh position={[2, 0, 0]}>
                    <boxGeometry args={[0.15, 2.5, 0.15]} />
                    <meshBasicMaterial
                        color={direction > 0.3 ? "#2ecc71" : "#ffffff"}
                        transparent
                        opacity={0.4}
                    />
                </mesh>
                {/* Crossbar */}
                <mesh position={[0, 1.25, 0]}>
                    <boxGeometry args={[4, 0.15, 0.15]} />
                    <meshBasicMaterial
                        color={power > 0.7 ? "#f1c40f" : "#ffffff"}
                        transparent
                        opacity={0.4}
                    />
                </mesh>
            </group>

            {/* Aim direction indicator at start */}
            <group position={startPosition}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.3, 0.35, 24]} />
                    <meshBasicMaterial color="#2ecc71" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
                {/* Direction arrow */}
                <group rotation={[0, -Math.atan2(direction * 0.5, 1), 0]}>
                    <mesh position={[0, 0.1, -0.4]}>
                        <coneGeometry args={[0.1, 0.25, 6]} />
                        <meshBasicMaterial color="#2ecc71" />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

export default TrajectoryPath;
