import { useRef, Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, useTexture, useProgress, Html } from '@react-three/drei'
import type CameraControlsType from 'camera-controls'
import * as THREE from 'three'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import MarkerCard from './MarkerCard'
import ConnectWallet from '../features/ConnectWallet'
import Modal from '../shared/Modal'
import { useAppKitAccount } from '@reown/appkit/react'
import { getMapSettings, type MapSettings, type MapMarker as ApiMapMarker } from '../services/mapApi'
import { useSettings } from '../hooks/useSettings'

// Loading screen component
function LoadingScreen({ onComplete, title }: { onComplete: () => void; title: string }) {
  const [fadeOut, setFadeOut] = useState(false)
  const { progress, active } = useProgress()

  useEffect(() => {
    if (!active && progress === 100) {
      // Small delay before fade out
      const timer = setTimeout(() => {
        setFadeOut(true)
        // Wait for fade animation to complete
        setTimeout(onComplete, 500)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [active, progress, onComplete])

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(180deg, #1a0a25 0%, #0a0510 100%)' }}
    >
      {/* Logo/Title */}
      <h1 className="text-[2.5rem] max-md:text-[2rem] font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-[2rem]">
        {title}
      </h1>

      {/* Loading bar */}
      <div className="w-[200px] max-md:w-[160px] h-[4px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading text */}
      <p className="text-white-transparent-50 text-[.875rem] max-md:text-[1rem] mt-[1rem]">
        Loading...
      </p>
    </div>
  )
}

// Component to signal scene is ready
function SceneReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    // Signal ready after first render
    const timer = setTimeout(onReady, 100)
    return () => clearTimeout(timer)
  }, [onReady])

  return null
}

// Target point for camera animation
interface CameraTarget {
  position: [number, number, number]
  active: boolean
  markerId?: string
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

// Helper function to convert percentage to 3D coordinates
function percentTo3D(x: number, y: number): [number, number, number] {
  // Map is roughly -6 to 6 on X, -4 to 4 on Y
  const posX = (x / 100) * 12 - 6
  const posY = (y / 100) * -8 + 4
  return [posX, posY, 0.1]
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

// Zone label component using Html from drei
interface ZoneLabelProps {
  name: string
  x: number
  y: number
  fontSize: number
  color: string
}

function ZoneLabel({ name, x, y, fontSize, color }: ZoneLabelProps) {
  // Convert percentage to 3D coordinates
  const [posX, posY] = percentTo3D(x, y)

  return (
    <Html
      position={[posX, posY, 0.5]}
      center
      zIndexRange={[1, 10]}
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}rem`,
          color: color,
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
    </Html>
  )
}

interface MapContentProps {
  cameraTarget: CameraTarget | null
  onMarkerClick: (position: [number, number, number], markerId: string) => void
  isMobile: boolean
  markers: ApiMapMarker[]
  zones: MapSettings['zones']
  isLoading: boolean
}

function MapContent({ cameraTarget, onMarkerClick, isMobile, markers, zones, isLoading }: MapContentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const cameraControlsRef = useRef<CameraControlsType>(null)
  const prevTarget = useRef<string | null>(null)
  const prevIsMobile = useRef<boolean>(isMobile)

  // Reset camera when switching between mobile and desktop
  useEffect(() => {
    if (!cameraControlsRef.current) return
    if (prevIsMobile.current === isMobile) return

    prevIsMobile.current = isMobile
    const controls = cameraControlsRef.current

    // Reset to default view for new device type
    if (!cameraTarget?.active) {
      controls.setLookAt(0.5, 0, isMobile ? 10 : 7, 0, 0, 0, true)
    }
  }, [isMobile, cameraTarget])

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
      const [tx, ty] = cameraTarget.position

      // Camera position: behind marker, slightly higher (further on mobile)
      const camX = tx
      const camY = ty - (isMobile ? 4 : 3)
      const camZ = isMobile ? 1.5 : 1.2

      // Look at point: ahead of camera, same height (parallel view)
      const lookX = tx
      const lookY = ty + 5
      const lookZ = isMobile ? 1.5 : 1.2

      // Smooth transition (duration in seconds)
      controls.setLookAt(camX, camY, camZ, lookX, lookY, lookZ, true)
    } else {
      // Return to default view - force reset (further on mobile)
      controls.setLookAt(0.5, 0, isMobile ? 10 : 7, 0, 0, 0, true)
    }

    // Re-enable after animation completes
    setTimeout(() => {
      if (cameraControlsRef.current && !cameraTarget?.active) {
        cameraControlsRef.current.enabled = true
      }
    }, 600)
  }, [cameraTarget, isMobile])

  // Set up boundary box for camera movement
  useEffect(() => {
    if (!cameraControlsRef.current) return
    const controls = cameraControlsRef.current

    // Set boundary for camera target (where camera looks at)
    // This limits panning to within the map area
    const boundaryBox = new THREE.Box3(
      new THREE.Vector3(-6, -4, -1),  // min bounds
      new THREE.Vector3(6, 4, 2)       // max bounds
    )
    controls.setBoundary(boundaryBox)
  }, [])

  return (
    <>
      <CameraControls
        ref={cameraControlsRef}
        smoothTime={0.5}
        draggingSmoothTime={0.2}
        // Limit camera angles
        minPolarAngle={Math.PI / 2 - 0.3}
        maxPolarAngle={Math.PI / 2 + 0.3}
        minAzimuthAngle={-0.3}
        maxAzimuthAngle={0.3}
        // Lock zoom by setting min/max to same value
        minDistance={isMobile ? 10 : 7}
        maxDistance={isMobile ? 10 : 7}
        // Touch controls: only panning, no zoom
        touches={{
          one: 2 as const,  // TOUCH.TRUCK - one finger pan
          two: 2 as const,  // TOUCH.TRUCK - two finger pan (no zoom)
          three: 0 as const
        }}
        // Mouse controls: no zoom
        mouseButtons={{
          left: 2,   // TRUCK - pan
          middle: 0, // disabled
          right: 1,  // ROTATE
          wheel: 0   // disabled
        }}
      />
      <group ref={groupRef}>
        <Water />
        <Grid />

        {/* Full map texture */}
        <MapTextureLayer />

        {/* Zone labels - hide during loading to prevent z-index issues */}
        {!isLoading && zones.map(zone => (
          <ZoneLabel
            key={zone.id}
            name={zone.name}
            x={zone.x}
            y={zone.y}
            fontSize={zone.fontSize}
            color={zone.color}
          />
        ))}

        {/* Dynamic markers from backend - using percentage coordinates */}
        {markers.map(marker => {
          const position = percentTo3D(marker.x, marker.y)
          return (
            <Marker
              key={marker.id}
              position={position}
              color={marker.color}
              size={isMobile ? marker.size * 1.8 : marker.size}
              onClick={() => onMarkerClick(position, marker.id)}
              isActive={cameraTarget?.active && cameraTarget.markerId === marker.id}
            />
          )
        })}
      </group>
    </>
  )
}

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

export default function TycoinMap() {
  const [cameraTarget, setCameraTarget] = useState<CameraTarget | null>(null)
  const [showCards, setShowCards] = useState(false)
  const [cardsAnimating, setCardsAnimating] = useState<'in' | 'out' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapSettings, setMapSettings] = useState<MapSettings | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<ApiMapMarker | null>(null)
  const isAnimatingRef = useRef(false)
  const isMobile = useIsMobile()
  const { isConnected } = useAppKitAccount()
  // useSettings handles favicon and document title as side effects
  useSettings()

  // Fetch map settings on mount
  useEffect(() => {
    getMapSettings()
      .then(settings => setMapSettings(settings))
      .catch(err => console.error('Failed to fetch map settings:', err))
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleSceneReady = useCallback(() => {
    // Scene is ready - can be used for additional initialization if needed
  }, [])

  const handleMarkerClick = useCallback((position: [number, number, number], markerId: string) => {
    if (isAnimatingRef.current) return // Block clicks during animation

    const marker = mapSettings?.markers.find(m => m.id === markerId)
    if (marker) {
      setSelectedMarker(marker)
    }

    isAnimatingRef.current = true
    setCameraTarget({ position, active: true, markerId })
    setShowCards(true)
    setCardsAnimating('in')

    // Unlock after camera animation completes
    setTimeout(() => {
      isAnimatingRef.current = false
    }, 600)
  }, [mapSettings])

  const handleResetView = useCallback(() => {
    if (isAnimatingRef.current) return // Block during animation

    isAnimatingRef.current = true
    setCardsAnimating('out')
    setCameraTarget(null) // Start camera animation immediately

    // Wait for animations to complete before cleanup
    setTimeout(() => {
      setShowCards(false)
      setCardsAnimating(null)
      setSelectedMarker(null)
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

  const title = mapSettings?.title || 'Tycoin Land'

  return (
    <div className="relative w-full h-full min-h-[100dvh]">
      {/* Loading screen */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} title={title} />}

      {/* Wallet connection modal - can't be closed, only show after loading */}
      {!isLoading && (
        <Modal
          isOpen={!isConnected}
          showCloseButton={false}
          closeOnOverlayClick={false}
          closeOnEscape={false}
          title="Connect Wallet"
          size="md"
        >
          <p className="text-white-transparent-75 text-[1rem] max-md:text-[1.3rem] mb-[1.5rem]">
            Please connect your wallet to access {title}
          </p>
          <ConnectWallet />
        </Modal>
      )}

      {/* UI elements - only show after loading */}
      <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Mobile: Header with title and profile vertically centered */}
        <div className="md:hidden absolute top-[.75rem] left-[.75rem] right-[.75rem] z-10 flex items-center justify-between">
          <h1 className="text-[1.8rem] font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent drop-shadow-lg whitespace-nowrap">
            {title}
          </h1>
          <ConnectWallet />
        </div>

        {/* Desktop: Amount/VIP cards - top left */}
        <div className="hidden md:flex absolute top-[1rem] left-[1rem] z-10 flex-col gap-[.5rem]">
          <div className="bg-gray-transparent-10 backdrop-blur-sm px-[1rem] py-[.5rem] rounded-lg border-1 border-stroke-light">
            <span className="text-white-transparent-75 text-[.875rem]">Amount:</span>
            <span className="text-white ml-[.5rem] font-semibold text-[1rem]">0</span>
          </div>
          <div className="bg-gray-transparent-10 backdrop-blur-sm px-[1rem] py-[.5rem] rounded-lg border-1 border-stroke-light">
            <span className="text-white-transparent-75 text-[.875rem]">VIP:</span>
            <span className="text-white ml-[.5rem] font-semibold text-[1rem]">None</span>
          </div>
        </div>

        {/* Desktop: Title centered */}
        <div className="hidden md:block absolute top-[1rem] left-1/2 -translate-x-1/2 z-10">
          <h1 className="text-[2rem] font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent drop-shadow-lg whitespace-nowrap">
            {title}
          </h1>
        </div>

        {/* Desktop: Connect button / Profile - top right */}
        <div className="hidden md:block absolute top-[1rem] right-[1rem] z-10">
          <ConnectWallet />
        </div>

        {/* Mobile: Amount/VIP at bottom - smaller */}
        <div className="md:hidden absolute bottom-[.75rem] left-[.75rem] right-[.75rem] z-10 flex gap-[.5rem]">
          <div className="flex-1 bg-gray-transparent-10 backdrop-blur-sm px-[.75rem] py-[.5rem] rounded-lg border-1 border-stroke-light text-center">
            <span className="text-white-transparent-75 text-[.85rem] block">Amount</span>
            <span className="text-white font-semibold text-[1.1rem]">0</span>
          </div>
          <div className="flex-1 bg-gray-transparent-10 backdrop-blur-sm px-[.75rem] py-[.5rem] rounded-lg border-1 border-stroke-light text-center">
            <span className="text-white-transparent-75 text-[.85rem] block">VIP</span>
            <span className="text-white font-semibold text-[1.1rem]">None</span>
          </div>
        </div>
      </div>

      {/* Cards swiper - show when marker is focused, display all cards from marker */}
      {showCards && selectedMarker && selectedMarker.cards && selectedMarker.cards.length > 0 && (
        <div
          className={`fixed left-0 z-[5] w-screen ${cardsAnimating === 'out' ? 'animate-cards-slide-up' : 'animate-cards-slide-down'}`}
          style={{
            perspective: '1000px',
          }}
        >
          <Swiper
            spaceBetween={16}
            slidesPerView="auto"
            centeredSlides={true}
            initialSlide={Math.floor((selectedMarker.cards?.length || 1) / 2)}
            className="w-full !overflow-visible"
            breakpoints={{
              768: {
                spaceBetween: 24,
              },
            }}
          >
            {selectedMarker.cards.map((card) => (
              <SwiperSlide key={card.id} className="!w-auto">
                <MarkerCard
                  photo={card.photo}
                  description={card.description}
                  apy={card.apy}
                  vip={card.vip}
                  price={card.price}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0.5, 0, isMobile ? 10 : 7], fov: isMobile ? 65 : 50 }}
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
          <SceneReadySignal onReady={handleSceneReady} />
          <MapContent
            cameraTarget={cameraTarget}
            onMarkerClick={handleMarkerClick}
            isMobile={isMobile}
            markers={mapSettings?.markers || []}
            zones={mapSettings?.zones || []}
            isLoading={isLoading}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
