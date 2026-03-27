'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function Shape() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(0.01)
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * rotationSpeed
    meshRef.current.rotation.y += delta * rotationSpeed * 1.5
    meshRef.current.rotation.z += delta * rotationSpeed * 0.5
  })

  useEffect(() => {
    setRotationSpeed(hovered ? 0.05 : 0.01)
  }, [hovered])

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.2 : 1}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#00d4ff"
          wireframe
          emissive="#00d4ff"
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>
    </Float>
  )
}

function Rig() {
  return null // Remove mouse-following for cleaner look
}

interface Logo3DProps {
  size?: number
  className?: string
}

export function Logo3D({ size = 120, className = "" }: Logo3DProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d4ff" />
        <Shape />
      </Canvas>
    </div>
  )
}

export default Logo3D
