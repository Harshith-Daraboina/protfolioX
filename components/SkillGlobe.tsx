"use client";

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const skills = [
    { name: 'React', color: '#61DAFB' },
    { name: 'Node.js', color: '#339933' },
    { name: 'Python', color: '#3776AB' },
    { name: 'Docker', color: '#2496ED' },
    { name: 'AWS', color: '#FF9900' },
    { name: 'Next.js', color: '#ffffff' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'PostgreSQL', color: '#4169E1' },
    { name: 'FastAPI', color: '#009688' },
    { name: 'Tailwind', color: '#06B6D4' },
];

const SkillNode = ({ position, color, label }: { position: [number, number, number]; color: string; label: string }) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.scale.setScalar(hovered ? 1.5 : 1);
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial
                    color={hovered ? '#4ade80' : color}
                    emissive={hovered ? '#4ade80' : color}
                    emissiveIntensity={hovered ? 2 : 0.5}
                    toneMapped={false}
                />
            </mesh>
            {/* Connection Line to Center */}
            <Line
                points={[[0, 0, 0], [(-position[0] * 0.9), (-position[1] * 0.9), (-position[2] * 0.9)]]}
                color={color}
                opacity={0.1}
                transparent
                lineWidth={1}
            />

            {/* Hover Label */}
            <Html distanceFactor={10}>
                <div
                    className={`pointer-events-none select-none px-2 py-1 rounded bg-black/80 text-white text-xs font-bold transition-opacity duration-300 transform -translate-x-1/2 -translate-y-full mt-[-10px] whitespace-nowrap ${hovered ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {label}
                </div>
            </Html>
        </group>
    );
};

const Globe = () => {
    const groupRef = useRef<THREE.Group>(null);

    // Distribute points on a sphere
    const points = useMemo(() => {
        const temp = [];
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < skills.length; i++) {
            const y = 1 - (i / (skills.length - 1)) * 2; // y goes from 1 to -1
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;

            temp.push({
                pos: new THREE.Vector3(x, y, z).multiplyScalar(1.6),
                skill: skills[i]
            });
        }
        return temp;
    }, []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group ref={groupRef}>

            {/* Grid Lines (Wireframe Sphere) */}
            <Sphere args={[1.31, 24, 24]}>
                <meshBasicMaterial
                    color="#38bdf8"
                    wireframe
                    transparent
                    opacity={0.05}
                />
            </Sphere>

            {/* Orbiting Skill Nodes */}
            {points.map((pt, i) => (
                <SkillNode
                    key={i}
                    position={[pt.pos.x, pt.pos.y, pt.pos.z]}
                    color={pt.skill.color}
                    label={pt.skill.name}
                />
            ))}
        </group>
    )
}

const SkillGlobe = () => {
    return (
        <div className="w-full h-full relative z-10">
            <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ade80" />
                <spotLight position={[0, 5, 0]} intensity={1.5} angle={0.5} penumbra={1} color="#06b6d4" />
                <Globe />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
            </Canvas>
        </div>
    );
};

export default SkillGlobe;
