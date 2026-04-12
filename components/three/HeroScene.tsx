'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function Particles() {
  const mesh = useRef<THREE.Points>(null)
  const count = 8000

  const [positions, speeds] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // Spread particles in a wide flat cloud
      positions[i * 3]     = (Math.random() - 0.5) * 10  // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6   // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3   // z
      speeds[i] = Math.random() * 0.5 + 0.2
    }
    return [positions, speeds]
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const time = clock.getElapsedTime()
    const pos = mesh.current.geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < count; i++) {
      // Subtle floating motion
      pos[i * 3 + 1] += Math.sin(time * speeds[i] + i) * 0.0005
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
    mesh.current.rotation.y = time * 0.03
  })

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial 
        color="#ffffff" 
        size={0.015} 
        sizeAttenuation={true}
        transparent
        opacity={0.6}
      />
    </points>
  )
}

export function HeroScene() {
  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        display: 'block',
      }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#000000']} />
      <Particles />
    </Canvas>
  )
}
