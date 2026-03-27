'use client'

import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

function LogoText() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { viewport, pointer } = useThree()
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Slow auto-rotation on Y axis
    meshRef.current.rotation.y += delta * 0.4

    // Mouse parallax on Y rotation (subtle, delta-based)
    const targetRotationY = pointer.x * 0.3
    meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * delta * 2

    // Subtle tilt on X axis based on mouse Y
    const targetRotationX = pointer.y * 0.1
    meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * delta * 2
  })

  return (
    <Center>
      <Text3D
        ref={meshRef}
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.45}
        height={0.12}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.01}
        bevelOffset={0}
        bevelSegments={5}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        FIXR
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#0066ff"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </Text3D>
    </Center>
  )
}

export default function FixrNavLogo3D() {
  return (
    <div style={{ width: 120, height: 48, pointerEvents: 'none' }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
        <Suspense fallback={null}>
          <LogoText />
        </Suspense>
      </Canvas>
    </div>
  )
}
