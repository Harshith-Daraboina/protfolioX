"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LaserFlowProps {
    horizontalBeamOffset?: number;
    verticalBeamOffset?: number;
    color?: string;
    speed?: number;
}

const LaserMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#FF79C6") },
        uHOffset: { value: 0 },
        uVOffset: { value: 0 },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uHOffset;
    uniform float uVOffset;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      
      // Flow animation
      float noiseVal = snoise(vec2(uv.x * 2.0 + uHOffset + uTime * 0.2, uv.y * 3.0 + uVOffset - uTime * 0.3));
      
      // Create beams
      float beam = abs(sin(noiseVal * 10.0 + uTime));
      beam = smoothstep(0.0, 0.1, 0.05 / beam); // Glow effect
      
      // Mix with color
      vec3 finalColor = uColor * beam * 2.0; // Boost intensity
      
      // Fade edges
      float alpha = beam * smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const Flow = ({ horizontalBeamOffset, verticalBeamOffset, color, speed = 1 }: LaserFlowProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uHOffset: { value: horizontalBeamOffset },
        uVOffset: { value: verticalBeamOffset },
    }), [horizontalBeamOffset, verticalBeamOffset, color]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime() * speed;
            materialRef.current.uniforms.uColor.value.set(color);
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[10, 10]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={LaserMaterial.vertexShader}
                fragmentShader={LaserMaterial.fragmentShader}
                transparent
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

const LaserFlow = (props: LaserFlowProps) => {
    return (
        <div className="w-full h-full relative">
            <Canvas camera={{ position: [0, 0, 2] }} gl={{ alpha: true }}>
                <Flow {...props} />
            </Canvas>
        </div>
    );
};

export default LaserFlow;
