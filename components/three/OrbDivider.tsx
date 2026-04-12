'use client'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedOrb() {
  const mesh = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (!mesh.current) return
    mesh.current.rotation.x = clock.getElapsedTime() * 0.2
    mesh.current.rotation.y = clock.getElapsedTime() * 0.3
  })

  return (
    <Sphere ref={mesh} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#00d4ff"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0}
        metalness={0.8}
        wireframe={false}
      />
    </Sphere>
  )
}

export function OrbDivider() {
  return (
    <div style={{
      width: '100%',
      height: '400px',
      background: '#131317',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient fade top and bottom */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '80px',
        background: 'linear-gradient(to bottom, #131317, transparent)',
        zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '80px',
        background: 'linear-gradient(to top, #131317, transparent)',
        zIndex: 2,
      }} />

      {/* Label */}
      <div style={{
        position: 'absolute',
        zIndex: 3,
        textAlign: 'center',
        color: '#fff',
      }}>
        <p style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          Powered by AI
        </p>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.03em',
          margin: 0,
        }}>
          Infrastructure that thinks.
        </h2>
      </div>

      {/* 3D Orb */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px', height: '300px',
        opacity: 0.15,
        zIndex: 1,
      }}>
        <Canvas camera={{ position: [0, 0, 3] }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
          <AnimatedOrb />
        </Canvas>
      </div>
    </div>
  )
}
