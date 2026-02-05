import { useRef, Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, useTexture } from '@react-three/drei'
import type CameraControlsType from 'camera-controls'
import * as THREE from 'three'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import MarkerCard from './MarkerCard'
import ConnectWallet from '../features/ConnectWallet'
import Button from '../shared/Button'

// Target point for camera animation
interface CameraTarget {
  position: [number, number, number]
  active: boolean
}

// Import full map texture
import mapTexture from '../assets/pful1.png'
// Import map configuration (edit this file to adjust coordinates)
import { MAP_CONFIG } from '../config/mapConfig'

function Grid() {
  return (
    <gridHelper
      args={[48, 72, '#5a2070', '#3a1850']}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0.5, -0.5, -0.2]}
    />
  )
}

// Water effect around the continent
function Water() {
  return (
    <mesh position={[0, 0, -0.3]} rotation={[0, 0, 0]}>
      <planeGeometry args={[30, 20]} />
      <meshBasicMaterial color="#1a0a25" transparent opacity={0.5} />
    </mesh>
  )
}

// Interactive marker component
interface MarkerProps {
  position: [number, number, number]
  color?: string
  size?: number
  onClick?: () => void
  isActive?: boolean
}

function Marker({ position, color = '#ff3333', size = 0.25, onClick, isActive = false }: MarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return

    // Hover animation - scale up
    const targetScale = hovered || isActive ? 1.3 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)

    // Floating animation
    const floatAmount = 0.05
    meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 2) * floatAmount

    // Glow pulse
    if (glowRef.current) {
      const glowScale = (hovered || isActive) ? 1.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2 : 1.5
      glowRef.current.scale.set(glowScale, glowScale, glowScale)
      ;(glowRef.current.material as THREE.MeshBasicMaterial).opacity = (hovered || isActive) ? 0.5 : 0.2
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshPhongMaterial
          color={color}
          shininess={100}
          specular={new THREE.Color('#ffffff')}
          emissive={new THREE.Color(color)}
          emissiveIntensity={(hovered || isActive) ? 0.4 : 0.2}
        />
      </mesh>
    </group>
  )
}

// Full map texture component
function MapTextureLayer() {
  const texture = useTexture(mapTexture)

  // Configure texture for transparency
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter

  const { x, y, width, height, z } = MAP_CONFIG.texture

  return (
    <mesh position={[x, y, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

interface MapContentProps {
  cameraTarget: CameraTarget | null
  onMarkerClick: (position: [number, number, number]) => void
  isAnimating: boolean
}

function MapContent({ cameraTarget, onMarkerClick, isAnimating }: MapContentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const cameraControlsRef = useRef<CameraControlsType>(null)
  const prevTarget = useRef<string | null>(null)

  // Animate camera when target changes
  useEffect(() => {
    if (!cameraControlsRef.current) return

    const controls = cameraControlsRef.current
    const targetKey = cameraTarget?.active ? cameraTarget.position.join(',') : null

    // Only animate if target changed
    if (targetKey === prevTarget.current) return
    prevTarget.current = targetKey

    // Disable user input during animation
    controls.enabled = false

    if (cameraTarget?.active) {
      const [tx, ty, tz] = cameraTarget.position

      // Camera position: behind marker, slightly higher
      const camX = tx
      const camY = ty - 3
      const camZ = 1.2

      // Look at point: ahead of camera, same height (parallel view)
      const lookX = tx
      const lookY = ty + 5
      const lookZ = 1.2

      // Smooth transition (duration in seconds)
      controls.setLookAt(camX, camY, camZ, lookX, lookY, lookZ, true)
    } else {
      // Return to default view - force reset
      controls.setLookAt(0.5, 0, 7, 0, 0, 0, true)
    }

    // Re-enable after animation completes
    setTimeout(() => {
      if (cameraControlsRef.current && !cameraTarget?.active) {
        cameraControlsRef.current.enabled = true
      }
    }, 600)
  }, [cameraTarget])

  return (
    <>
      <CameraControls
        ref={cameraControlsRef}
        smoothTime={0.5}
        draggingSmoothTime={0.2}
        minPolarAngle={Math.PI / 2 - 0.3}
        maxPolarAngle={Math.PI / 2 + 0.3}
        minAzimuthAngle={-0.3}
        maxAzimuthAngle={0.3}
        minDistance={5}
        maxDistance={10}
      />
      <group ref={groupRef}>
        <Water />
        <Grid />

        {/* Full map texture */}
        <MapTextureLayer />

        {/* Interactive markers */}
        <Marker
          position={[0, 0, 0.1]}
          color="#ff3333"
          size={0.12}
          onClick={() => onMarkerClick([0, 0, 0.1])}
          isActive={cameraTarget?.active && cameraTarget.position[0] === 0 && cameraTarget.position[1] === 0}
        />
        <Marker
          position={[-2.5, 1.5, 0.1]}
          color="#33ff88"
          size={0.12}
          onClick={() => onMarkerClick([-2.5, 1.5, 0.1])}
          isActive={cameraTarget?.active && cameraTarget.position[0] === -2.5 && cameraTarget.position[1] === 1.5}
        />
        <Marker
          position={[2, -1, 0.1]}
          color="#3388ff"
          size={0.12}
          onClick={() => onMarkerClick([2, -1, 0.1])}
          isActive={cameraTarget?.active && cameraTarget.position[0] === 2 && cameraTarget.position[1] === -1}
        />
        <Marker
          position={[-3, -1.5, 0.1]}
          color="#ffaa33"
          size={0.12}
          onClick={() => onMarkerClick([-3, -1.5, 0.1])}
          isActive={cameraTarget?.active && cameraTarget.position[0] === -3 && cameraTarget.position[1] === -1.5}
        />
        <Marker
          position={[4, 0.5, 0.1]}
          color="#aa33ff"
          size={0.12}
          onClick={() => onMarkerClick([4, 0.5, 0.1])}
          isActive={cameraTarget?.active && cameraTarget.position[0] === 4 && cameraTarget.position[1] === 0.5}
        />
      </group>
    </>
  )
}

export default function TycoinMap() {
  const [cameraTarget, setCameraTarget] = useState<CameraTarget | null>(null)
  const [showCards, setShowCards] = useState(false)
  const [cardsAnimating, setCardsAnimating] = useState<'in' | 'out' | null>(null)
  const isAnimatingRef = useRef(false)

  const handleMarkerClick = useCallback((position: [number, number, number]) => {
    if (isAnimatingRef.current) return // Block clicks during animation

    isAnimatingRef.current = true
    setCameraTarget({ position, active: true })
    setShowCards(true)
    setCardsAnimating('in')

    // Unlock after camera animation completes
    setTimeout(() => {
      isAnimatingRef.current = false
    }, 600)
  }, [])

  const handleResetView = useCallback(() => {
    if (isAnimatingRef.current) return // Block during animation

    isAnimatingRef.current = true
    setCardsAnimating('out')
    setCameraTarget(null) // Start camera animation immediately

    // Wait for animations to complete before cleanup
    setTimeout(() => {
      setShowCards(false)
      setCardsAnimating(null)
      isAnimatingRef.current = false
    }, 500)
  }, [])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cameraTarget?.active && !isAnimatingRef.current) {
        handleResetView()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cameraTarget, handleResetView])

  // Handle click outside (on canvas background)
  const handleCanvasClick = useCallback(() => {
    if (cameraTarget?.active && !isAnimatingRef.current) {
      handleResetView()
    }
  }, [cameraTarget, handleResetView])

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Header left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-gray-transparent-10 backdrop-blur-sm px-4 py-2 rounded-lg border border-stroke-light">
          <span className="text-white-transparent-75 text-sm">Amount:</span>
          <span className="text-white ml-2 font-semibold">0</span>
        </div>
        <div className="bg-gray-transparent-10 backdrop-blur-sm px-4 py-2 rounded-lg border border-stroke-light">
          <span className="text-white-transparent-75 text-sm">VIP:</span>
          <span className="text-white ml-2 font-semibold">None</span>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
          Tycoin Land
        </h1>
      </div>

      {/* Connect button */}
      <div className="absolute top-4 right-4 z-10">
        <ConnectWallet />
      </div>

      {/* Cards swiper - show when marker is focused */}
      {showCards && (
        <div
          className={`fixed left-0 z-[5] w-screen ${cardsAnimating === 'out' ? 'animate-cards-slide-up' : 'animate-cards-slide-down'}`}
          style={{
            perspective: '1000px',
          }}
        >
          <Swiper
            spaceBetween={24}
            slidesPerView="auto"
            centeredSlides={true}
            initialSlide={1}
            className="w-full !overflow-visible"
          >
            <SwiperSlide className="!w-auto">
              <MarkerCard />
            </SwiperSlide>
            <SwiperSlide className="!w-auto">
              <MarkerCard />
            </SwiperSlide>
            <SwiperSlide className="!w-auto">
              <MarkerCard />
            </SwiperSlide>
          </Swiper>
        </div>
      )}

      {/* Reset view button - show when focused */}
      {cameraTarget?.active && (
        <div className="absolute bottom-4 left-4 z-10">
          <Button
            color="dark"
            onClick={handleResetView}
            className="!py-2 !px-4 text-sm"
          >
            ← Reset view
          </Button>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0.5, 0, 7], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #1a0a25 0%, #0a0510 100%)' }}
        onPointerMissed={handleCanvasClick}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 10]}
          intensity={1.2}
          color="#ffffff"
        />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-5, 5, 8]} intensity={0.5} color="#ffaaaa" />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#9b3db5" />

        <Suspense fallback={null}>
          <MapContent
            cameraTarget={cameraTarget}
            onMarkerClick={handleMarkerClick}
            isAnimating={isAnimatingRef.current}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
