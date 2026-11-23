"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

export interface RarePiecesChamber3DProps {
  readonly className?: string;
}

function Pedestal() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.5, 0]}>
      <cylinderGeometry args={[1, 1.2, 0.3, 32]} />
      <meshStandardMaterial
        color="#15101a"
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

function Artifact() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#c6a56b"
          metalness={0.8}
          roughness={0.2}
          emissive="#c6a56b"
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#c6a56b"
        castShadow
      />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#f3ebdd" />
    </>
  );
}

export function RarePiecesChamber3D({ className }: RarePiecesChamber3DProps) {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          backgroundColor: "#0a090c",
          color: "#9d9184",
          fontFamily: "Inter, sans-serif",
          fontSize: "0.875rem",
        }}
      >
        3D view not available in this browser.
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight: "400px", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "#0a090c" }}
      >
        <SceneLighting />
        <Pedestal />
        <Artifact />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.5}
        />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}