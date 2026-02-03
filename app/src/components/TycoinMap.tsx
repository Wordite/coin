import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'

// Continent regions - designed to fit together like puzzle pieces
// Coordinates form connected territories sharing borders
const continentRegions = [
  {
    id: 'suburbs',
    name: 'Suburbs',
    color: '#6B3D5C',
    // Bottom-left region
    vertices: [
      [-4.5, -3], [-4.2, -2], [-3.5, -1.5], [-2.8, -1.8], [-2.2, -1.2],
      [-1.8, -1.5], [-1.5, -2.2], [-2, -2.8], [-2.5, -3.2], [-3.5, -3.5], [-4.2, -3.3]
    ],
    labelPos: [-3, -2.3],
    points: [
      [-3.8, -2.5], [-3, -2], [-3.5, -2.8], [-2.5, -2.5], [-2.2, -1.8]
    ]
  },
  {
    id: 'urban-town',
    name: 'Urban Town',
    color: '#5C3D4D',
    // Left region, above suburbs
    vertices: [
      [-4.5, -2], [-4.3, -1], [-4, 0], [-3.5, 0.5], [-2.8, 0.8],
      [-2.2, 0.5], [-2, 0], [-2.2, -0.5], [-2.5, -1], [-2.8, -1.2],
      [-3.5, -1.5], [-4.2, -2]
    ],
    labelPos: [-3.2, -0.3],
    points: [
      [-3.8, -0.5], [-3, 0], [-3.5, -1], [-2.8, -0.3]
    ]
  },
  {
    id: 'the-hills',
    name: 'The Hills',
    color: '#9B3DB5',
    // Top region
    vertices: [
      [-2.8, 0.8], [-2.2, 1.5], [-1.5, 2.2], [-0.5, 2.8], [0.5, 3],
      [1.5, 2.8], [2.2, 2.2], [2.5, 1.5], [2.2, 0.8], [1.5, 0.5],
      [0.5, 0.3], [-0.5, 0.2], [-1.5, 0.3], [-2.2, 0.5]
    ],
    labelPos: [0, 1.8],
    points: [
      [-1.5, 1.5], [0, 2.2], [1.2, 1.8], [0.5, 1], [-0.8, 1.2]
    ]
  },
  {
    id: 'downtown',
    name: 'Downtown',
    color: '#E83DAA',
    // Center region
    vertices: [
      [-2.2, -1.2], [-2, 0], [-2.2, 0.5], [-1.5, 0.3], [-0.5, 0.2],
      [0.5, 0.3], [1.5, 0.5], [1.8, 0], [1.5, -0.8], [1, -1.2],
      [0.3, -1.5], [-0.5, -1.5], [-1.2, -1.3], [-1.8, -1.5]
    ],
    labelPos: [-0.2, -0.5],
    points: [
      [-1, -0.5], [0.5, 0], [0, -1], [-1.5, -0.8], [1, -0.5]
    ]
  },
  {
    id: 'marina',
    name: 'Marina',
    color: '#C88DAA',
    // Bottom-right region
    vertices: [
      [-1.5, -2.2], [-0.5, -1.5], [0.3, -1.5], [1, -1.2], [1.5, -0.8],
      [2.2, -1], [2.8, -1.5], [3, -2.2], [2.8, -2.8], [2.2, -3.2],
      [1.2, -3.3], [0.2, -3.2], [-0.8, -3], [-1.5, -2.8]
    ],
    labelPos: [1, -2.2],
    points: [
      [0, -2.2], [1.5, -2], [2, -2.5], [0.8, -2.8], [1.8, -1.5]
    ]
  }
]

// Island - separate from continent
const islandRegion = {
  id: 'the-island',
  name: 'The Island',
  color: '#7B8BC5',
  vertices: [
    [5, 1.8], [5.5, 1.2], [5.8, 0.5], [5.8, -0.3], [5.5, -1],
    [5, -1.5], [4.5, -1.3], [4.2, -0.8], [4, 0], [4.2, 0.8], [4.5, 1.5]
  ],
  labelPos: [5, 0],
  points: [
    [4.5, 0.8], [5.2, 0.3], [5, -0.8], [4.8, -0.2]
  ]
}

// Create shape from vertices
function createShapeFromVertices(vertices: number[][]): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(vertices[0][0], vertices[0][1])
  for (let i = 1; i < vertices.length; i++) {
    shape.lineTo(vertices[i][0], vertices[i][1])
  }
  shape.closePath()
  return shape
}

interface PointMarkerProps {
  position: [number, number, number]
  onClick: () => void
  isSelected?: boolean
}

function PointMarker({ position, onClick, isSelected }: PointMarkerProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const pulseRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const scale = hovered || isSelected ? 1.4 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15)
    }
    if (pulseRef.current && isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15
      pulseRef.current.scale.set(pulse, pulse, 1)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {isSelected && (
        <mesh ref={pulseRef} position={[0, 0, -0.01]}>
          <circleGeometry args={[0.25, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
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
        <ringGeometry args={[0.08, 0.14, 8]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}

interface RegionMeshProps {
  vertices: number[][]
  color: string
  name: string
  labelPos: number[]
  points: number[][]
  onPointClick: (point: { x: number; y: number }, regionName: string) => void
  selectedPoint: { x: number; y: number } | null
  selectedRegion: string | null
}

function RegionMesh({
  vertices,
  color,
  name,
  labelPos,
  points,
  onPointClick,
  selectedPoint,
  selectedRegion
}: RegionMeshProps) {
  const [hovered, setHovered] = useState(false)
  const isThisRegion = selectedRegion === name

  const geometry = useMemo(() => {
    const shape = createShapeFromVertices(vertices)
    return new THREE.ShapeGeometry(shape, 1)
  }, [vertices])

  // Border line points
  const borderPoints = useMemo(() => {
    const pts = vertices.map(v => new THREE.Vector3(v[0], v[1], 0.02))
    pts.push(pts[0].clone()) // Close the loop
    return pts
  }, [vertices])

  return (
    <group>
      {/* Region fill */}
      <mesh
        geometry={geometry}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.95 : 0.85}
        />
      </mesh>

      {/* Region border */}
      <Line
        points={borderPoints}
        color="#0a0a0a"
        lineWidth={2}
      />

      {/* Region label */}
      <Html
        position={[labelPos[0], labelPos[1], 0.1]}
        center
        style={{
          color: 'white',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          userSelect: 'none'
        }}
      >
        {name}
      </Html>

      {/* Points */}
      {points.map((point, idx) => {
        const isSelected = isThisRegion &&
          selectedPoint &&
          Math.abs(selectedPoint.x - point[0]) < 0.1 &&
          Math.abs(selectedPoint.y - point[1]) < 0.1

        return (
          <PointMarker
            key={idx}
            position={[point[0], point[1], 0.05]}
            isSelected={isSelected}
            onClick={() => onPointClick({ x: point[0], y: point[1] }, name)}
          />
        )
      })}
    </group>
  )
}

function Grid() {
  return (
    <gridHelper
      args={[24, 36, '#5a2070', '#3a1850']}
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

interface MapContentProps {
  onPointClick: (point: { x: number; y: number }, regionName: string) => void
  targetPoint: { x: number; y: number } | null
  selectedRegion: string | null
}

function MapContent({ onPointClick, targetPoint, selectedRegion }: MapContentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const animationProgress = useRef(0)
  const isAnimating = useRef(false)
  const previousTarget = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (targetPoint !== previousTarget.current) {
      animationProgress.current = 0
      isAnimating.current = true
      previousTarget.current = targetPoint
    }
  }, [targetPoint])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (isAnimating.current) {
      animationProgress.current = Math.min(animationProgress.current + delta * 1.5, 1)
      if (animationProgress.current >= 1) {
        isAnimating.current = false
      }
    }

    const progress = animationProgress.current
    const eased = 1 - Math.pow(1 - progress, 3)

    if (targetPoint) {
      const maxRotation = 0.35
      const targetRotX = (targetPoint.y / 8) * maxRotation
      const targetRotY = -(targetPoint.x / 8) * maxRotation

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX * eased,
        0.08
      )
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY * eased,
        0.08
      )

      const targetCamX = targetPoint.x * 0.35
      const targetCamY = targetPoint.y * 0.35
      const targetCamZ = 7

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.06)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.06)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.06)
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05)

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0.5, 0.04)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.04)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10, 0.04)
    }

    camera.lookAt(0, 0, 0)
  })

  return (
    <group ref={groupRef}>
      <Water />
      <Grid />

      {/* Continent regions */}
      {continentRegions.map(region => (
        <RegionMesh
          key={region.id}
          vertices={region.vertices}
          color={region.color}
          name={region.name}
          labelPos={region.labelPos}
          points={region.points}
          onPointClick={onPointClick}
          selectedPoint={targetPoint}
          selectedRegion={selectedRegion}
        />
      ))}

      {/* Island - separate */}
      <RegionMesh
        vertices={islandRegion.vertices}
        color={islandRegion.color}
        name={islandRegion.name}
        labelPos={islandRegion.labelPos}
        points={islandRegion.points}
        onPointClick={onPointClick}
        selectedPoint={targetPoint}
        selectedRegion={selectedRegion}
      />
    </group>
  )
}

export interface SelectedPoint {
  x: number
  y: number
  regionName: string
}

interface TycoinMapProps {
  onPointSelect?: (point: SelectedPoint | null) => void
}

export default function TycoinMap({ onPointSelect }: TycoinMapProps) {
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number } | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const handlePointClick = useCallback((point: { x: number; y: number }, regionName: string) => {
    setTargetPoint(point)
    setSelectedRegion(regionName)
    onPointSelect?.({ ...point, regionName })
  }, [onPointSelect])

  const handleReset = useCallback(() => {
    setTargetPoint(null)
    setSelectedRegion(null)
    onPointSelect?.(null)
  }, [onPointSelect])

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Header left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30">
          <span className="text-purple-300 text-sm">Amount:</span>
          <span className="text-white ml-2 font-semibold">Null</span>
        </div>
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30">
          <span className="text-purple-300 text-sm">VIP:</span>
          <span className="text-white ml-2 font-semibold">None</span>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <h1
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent drop-shadow-lg"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
        >
          Tycoin-LAND
        </h1>
      </div>

      {/* Connect button */}
      <div className="absolute top-4 right-4 z-10">
        <button className="bg-purple-600/80 backdrop-blur-sm px-5 py-2.5 rounded-lg text-white font-medium hover:bg-purple-500 transition border border-purple-400/50 shadow-lg shadow-purple-500/20">
          Connect
        </button>
      </div>

      {/* Selected region info */}
      {selectedRegion && (
        <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm px-5 py-4 rounded-lg border border-purple-500/30">
          <p className="text-purple-300 text-sm mb-1">Selected Region:</p>
          <p className="text-white font-bold text-lg">{selectedRegion}</p>
          <button
            onClick={handleReset}
            className="mt-3 text-purple-400 text-sm hover:text-purple-300 underline underline-offset-2"
          >
            Reset view
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 text-white/50 text-xs">
        Click on points to focus
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0.5, 0, 10], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #1a0a25 0%, #0a0510 100%)' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#9b3db5" />

        <MapContent
          onPointClick={handlePointClick}
          targetPoint={targetPoint}
          selectedRegion={selectedRegion}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  )
}
