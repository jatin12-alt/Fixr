'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, TorusKnot, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

// Error boundary for WebGL fallback
function CanvasErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return (
      <div className="text-4xl font-bold text-primary tracking-widest">
        Fixr
      </div>
    )
  }

  return <>{children}</>
}

// AI Core Component - Rotating TorusKnot with emissive glow
function AICore({ mouseDelta }: { mouseDelta: React.MutableRefObject<{ x: number; y: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Auto-rotation on Y-axis
      meshRef.current.rotation.y += delta * 0.3
      
      // Mouse parallax - subtle rotation offset based on delta
      meshRef.current.rotation.x = mouseDelta.current.y * 0.1
      meshRef.current.rotation.z = mouseDelta.current.x * 0.05
    }
  })

  return (
    <TorusKnot
      ref={meshRef}
      args={[1.2, 0.4, 128, 32]}
      scale={0.8}
    >
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#0066ff"
        emissiveIntensity={0.5}
        metalness={0.9}
        roughness={0.1}
      />
    </TorusKnot>
  )
}

// 3D Text Component - "Fixr" floating above the core
function LogoText({ mouseDelta }: { mouseDelta: React.MutableRefObject<{ x: number; y: number }> }) {
  const textRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (textRef.current) {
      // Subtle parallax for text
      textRef.current.rotation.y = mouseDelta.current.x * 0.02
      textRef.current.rotation.x = -mouseDelta.current.y * 0.02
    }
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.3}
      floatingRange={[0.2, 0.4]}
    >
      <group ref={textRef} position={[0, 2.2, 0]}>
        <Center>
          <Text3D
            font="https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json"
            size={1.2}
            height={0.3}
            curveSegments={32}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={8}
          >
            Fixr
            <meshStandardMaterial
              color="#ffffff"
              emissive="#00d4ff"
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </Text3D>
        </Center>
      </group>
    </Float>
  )
}

// Scene wrapper with mouse tracking
function Scene() {
  const mouseDelta = useRef({ x: 0, y: 0 })
  const lastMouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate delta from last position
      const deltaX = (e.clientX - lastMouse.current.x) / window.innerWidth
      const deltaY = (e.clientY - lastMouse.current.y) / window.innerHeight
      
      // Smooth interpolation
      mouseDelta.current.x += (deltaX - mouseDelta.current.x) * 0.1
      mouseDelta.current.y += (deltaY - mouseDelta.current.y) * 0.1
      
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Decay mouse delta back to zero
  useFrame(() => {
    mouseDelta.current.x *= 0.92
    mouseDelta.current.y *= 0.92
  })

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.5} />
      
      {/* Main directional light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        color="#00d4ff"
      />
      
      {/* Point light for glow effect */}
      <pointLight
        position={[0, 0, 3]}
        intensity={2}
        color="#00d4ff"
        distance={10}
      />
      
      {/* AI Core - TorusKnot */}
      <AICore mouseDelta={mouseDelta} />
      
      {/* 3D Text - Fixr */}
      <LogoText mouseDelta={mouseDelta} />
    </>
  )
}

// Main Component
export default function FixrLogo3D() {
  return (
    <div className="w-full h-full">
      <CanvasErrorBoundary>
        <Suspense
          fallback={
            <div className="h-64 flex items-center justify-center text-4xl font-bold text-primary">
              Fixr
            </div>
          }
        >
          <div className="w-full h-64 relative">
            {/* Wrapper div handles mouse events separately */}
            <div className="absolute inset-0">
              <Canvas
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{ pointerEvents: "none", background: "transparent" }}
                gl={{ alpha: true, antialias: true }}
              >
                <Scene />
              </Canvas>
            </div>
          </div>
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  )
}
