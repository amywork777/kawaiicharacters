"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { animated } from "@react-spring/three"
import { Sparkles as DreiSparkles } from "@react-three/drei"
import { Shape, ExtrudeGeometry } from "three"

// Define arm types
const ARM_TYPES = {
  NONE: "none",
  ROUND: "round",
  STICK: "stick",
  STUBBY: "stubby",
}

interface CharacterProps {
  bodyType: string
  headType: string
  accessoryType: string
  mouthType: string
  pose: string
  pattern: string
  bodyColor: string
  headColor: string
  accessoryColor: string
  patternColor: string
  blushIntensity: number
  eyeSize: number
  eyeDistance: number
  mouthSize: number
  hasEyebrows: boolean
  hasFreckles: boolean
  hasSparkles: boolean
  armType: string
}

// Add pattern shapes
const createPatternShape = (type: string) => {
  const shape = new Shape()

  switch (type) {
    case "heart":
      shape.moveTo(0, 0)
      shape.bezierCurveTo(-0.1, 0.1, -0.2, 0.1, -0.2, 0)
      shape.bezierCurveTo(-0.2, -0.1, 0, -0.2, 0, -0.2)
      shape.bezierCurveTo(0, -0.2, 0.2, -0.1, 0.2, 0)
      shape.bezierCurveTo(0.2, 0.1, 0.1, 0.1, 0, 0)
      break
    case "star":
      const points = 5
      const outerRadius = 0.2
      const innerRadius = 0.1

      for (let i = 0; i <= points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (Math.PI / points) * i
        const x = Math.sin(angle) * radius
        const y = Math.cos(angle) * radius

        if (i === 0) {
          shape.moveTo(x, y)
        } else {
          shape.lineTo(x, y)
        }
      }
      break
    default:
      shape.moveTo(-0.1, -0.1)
      shape.lineTo(0.1, -0.1)
      shape.lineTo(0.1, 0.1)
      shape.lineTo(-0.1, 0.1)
      shape.closePath()
  }

  return new ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: false,
  })
}

const Character = ({
  bodyType,
  headType,
  accessoryType,
  mouthType,
  pose,
  pattern,
  bodyColor,
  headColor,
  accessoryColor,
  patternColor,
  blushIntensity,
  eyeSize,
  eyeDistance,
  mouthSize,
  hasEyebrows,
  hasFreckles,
  hasSparkles,
  armType,
}: CharacterProps) => {
  const groupRef = useRef<Group>(null)
  const bodyRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)

  // Create animated components
  const AnimatedGroup = animated("group")

  // Gentle floating animation for all poses
  useFrame((state) => {
    if (groupRef.current) {
      // Base floating animation
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1

      // Different animations based on pose
      if (pose === "default") {
        groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
      } else if (pose === "shy") {
        groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05
        groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.05
      } else if (pose === "excited") {
        groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.15
        groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2) * 0.1
      }

      // Animate body parts for dancing
      if (pose === "dancing" && bodyRef.current) {
        bodyRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.2
      }
    }
  })

  // Body component based on type
  const Body = useMemo(() => {
    // Update the pattern rendering in the Body component
    const renderPattern = () => {
      if (pattern === "solid") return null

      const patternPositions = [
        [0.3, 0, 0.51],
        [-0.2, 0.3, 0.51],
        [0.1, -0.2, 0.51],
        [-0.3, -0.1, 0.51],
      ]

      return (
        <group>
          {patternPositions.map(([x, y, z], index) => (
            <mesh key={index} position={[x, y, z]} rotation={[0, 0, Math.random() * Math.PI]} scale={[0.2, 0.2, 0.1]}>
              {pattern === "spots" ? (
                <circleGeometry args={[1, 32]} />
              ) : pattern === "stripes" ? (
                <planeGeometry args={[2, 0.3]} />
              ) : (
                <primitive object={createPatternShape(pattern)} />
              )}
              <meshStandardMaterial color={patternColor} />
            </mesh>
          ))}
        </group>
      )
    }

    switch (bodyType) {
      case "square":
        return (
          <AnimatedGroup ref={bodyRef}>
            <mesh position={[0, -0.7, 0]} scale={[1, 1, 1]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            {renderPattern()}
          </AnimatedGroup>
        )
      case "bean":
        return (
          <AnimatedGroup ref={bodyRef}>
            <mesh position={[0, -0.7, 0]} scale={[1, 1.5, 0.8]}>
              <capsuleGeometry args={[0.4, 0.8, 16, 32]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            {renderPattern()}
          </AnimatedGroup>
        )
      case "pear":
        return (
          <AnimatedGroup ref={bodyRef}>
            <mesh position={[0, -0.5, 0]} scale={[1, 1.3, 0.8]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, -1.2, 0]} scale={[0.8, 0.8, 0.6]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            {renderPattern()}
          </AnimatedGroup>
        )
      case "round":
      default:
        return (
          <AnimatedGroup ref={bodyRef}>
            <mesh position={[0, -0.7, 0]} scale={[1, 1, 1]}>
              <sphereGeometry args={[0.6, 32, 32]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            {renderPattern()}
          </AnimatedGroup>
        )
    }
  }, [bodyType, bodyColor, pattern, patternColor, AnimatedGroup])

  // Head component based on type
  const Head = useMemo(() => {
    switch (headType) {
      case "cat":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Cat ears */}
            <mesh position={[-0.3, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
              <coneGeometry args={[0.15, 0.3, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            <mesh position={[0.3, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <coneGeometry args={[0.15, 0.3, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Inner ears */}
            <mesh position={[-0.3, 0.4, 0.05]} rotation={[0, 0, Math.PI / 4]} scale={[0.7, 0.7, 0.7]}>
              <coneGeometry args={[0.15, 0.2, 32]} />
              <meshStandardMaterial color="#FFB6C1" />
            </mesh>
            <mesh position={[0.3, 0.4, 0.05]} rotation={[0, 0, -Math.PI / 4]} scale={[0.7, 0.7, 0.7]}>
              <coneGeometry args={[0.15, 0.2, 32]} />
              <meshStandardMaterial color="#FFB6C1" />
            </mesh>
          </AnimatedGroup>
        )
      case "bear":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Bear ears */}
            <mesh position={[-0.3, 0.4, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            <mesh position={[0.3, 0.4, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
          </AnimatedGroup>
        )
      case "bunny":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Bunny ears */}
            <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, Math.PI / 12]}>
              <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            <mesh position={[0.2, 0.4, 0]} rotation={[0, 0, -Math.PI / 12]}>
              <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Inner ears */}
            <mesh position={[-0.2, 0.4, 0.02]} rotation={[0, 0, Math.PI / 12]} scale={[0.7, 0.9, 0.1]}>
              <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
              <meshStandardMaterial color="#FFB6C1" />
            </mesh>
            <mesh position={[0.2, 0.4, 0.02]} rotation={[0, 0, -Math.PI / 12]} scale={[0.7, 0.9, 0.1]}>
              <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
              <meshStandardMaterial color="#FFB6C1" />
            </mesh>
          </AnimatedGroup>
        )
      case "round":
      default:
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
          </AnimatedGroup>
        )
      case "fox":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            {/* Main head */}
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Snout */}
            <mesh position={[0, -0.1, 0.3]} scale={[0.3, 0.25, 0.3]}>
              <coneGeometry args={[0.5, 1, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.25, 0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
              <coneGeometry args={[0.15, 0.4, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            <mesh position={[0.25, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <coneGeometry args={[0.15, 0.4, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Inner ears */}
            <mesh position={[-0.25, 0.4, 0.02]} rotation={[0, 0, Math.PI / 6]} scale={[0.8, 0.8, 0.1]}>
              <coneGeometry args={[0.15, 0.4, 32]} />
              <meshStandardMaterial color="#FFB6C1" />
            </mesh>
            <mesh position={[0.25, 0.4, 0.02]} rotation={[0, 0, -Math.PI / 6]} scale={[0.8, 0.8, 0.1]}>
              <coneGeometry args={[0.15, 0.4, 32]} />
              <meshStandardMaterial color="#FFB6C1" />
            </mesh>
          </AnimatedGroup>
        )
      case "hamster":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            {/* Main head */}
            <mesh scale={[1.2, 1, 1]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Cheeks */}
            <mesh position={[-0.4, -0.1, 0]} scale={[0.3, 0.25, 0.3]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            <mesh position={[0.4, -0.1, 0]} scale={[0.3, 0.25, 0.3]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, Math.PI / 12]}>
              <circleGeometry args={[0.15, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
            <mesh position={[0.2, 0.4, 0]} rotation={[0, 0, -Math.PI / 12]}>
              <circleGeometry args={[0.15, 32]} />
              <meshStandardMaterial color={headColor} />
            </mesh>
          </AnimatedGroup>
        )
    }
  }, [headType, headColor, AnimatedGroup])

  // Face features based on type
  const Face = useMemo(() => {
    // Move eyeSpacing calculation outside of renderEyes so it can be used by both functions
    const eyeSpacing = 0.2 * eyeDistance

    // Simplified eye rendering with only round eyes
    const renderEyes = () => {
      return (
        <>
          <mesh position={[-eyeSpacing, 0, 0.2]} scale={[0.1 * eyeSize, 0.1 * eyeSize, 0.05]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <mesh position={[eyeSpacing, 0, 0.2]} scale={[0.1 * eyeSize, 0.1 * eyeSize, 0.05]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </>
      )
    }

    // Render eyebrows instead of eyelashes
    const renderEyebrows = () => {
      if (!hasEyebrows) return null

      // Create eyebrows above each eye
      return (
        <>
          {/* Left eyebrow */}
          <mesh position={[-eyeSpacing, 0.15, 0.2]} rotation={[0, 0, Math.PI / 12]} scale={[0.12, 0.03, 0.01]}>
            <boxGeometry />
            <meshBasicMaterial color="black" />
          </mesh>

          {/* Right eyebrow */}
          <mesh position={[eyeSpacing, 0.15, 0.2]} rotation={[0, 0, -Math.PI / 12]} scale={[0.12, 0.03, 0.01]}>
            <boxGeometry />
            <meshBasicMaterial color="black" />
          </mesh>
        </>
      )
    }

    // Update the mouth rendering
    const renderMouth = () => {
      switch (mouthType) {
        case "cat":
          return (
            <group>
              <mesh position={[-0.1, -0.2, 0.2]} rotation={[0, 0, Math.PI / 4]} scale={[0.1 * mouthSize, 0.02, 0.01]}>
                <boxGeometry />
                <meshBasicMaterial color="#FF6666" />
              </mesh>
              <mesh position={[0.1, -0.2, 0.2]} rotation={[0, 0, -Math.PI / 4]} scale={[0.1 * mouthSize, 0.02, 0.01]}>
                <boxGeometry />
                <meshBasicMaterial color="#FF6666" />
              </mesh>
            </group>
          )
        case "open":
          return (
            <mesh position={[0, -0.2, 0.2]} scale={[0.1 * mouthSize, 0.1 * mouthSize, 0.01]}>
              <circleGeometry args={[0.5, 32]} />
              <meshBasicMaterial color="#FF6666" />
            </mesh>
          )
        case "surprised":
          return (
            <mesh position={[0, -0.2, 0.2]} scale={[0.05 * mouthSize, 0.08 * mouthSize, 0.01]}>
              <circleGeometry args={[0.5, 32]} />
              <meshBasicMaterial color="#FF6666" />
            </mesh>
          )
        case "shy":
          return (
            <mesh position={[0, -0.2, 0.2]} scale={[0.08 * mouthSize, 0.02, 0.01]}>
              <boxGeometry />
              <meshBasicMaterial color="#FF6666" />
            </mesh>
          )
        case "smile":
        default:
          // Create a cuter smile with a curved line
          return (
            <group position={[0, -0.2, 0.2]}>
              {Array.from({ length: 10 }).map((_, i) => {
                const t = i / 9
                const x = (t - 0.5) * 0.3 * mouthSize
                const y = -0.05 * Math.sin(Math.PI * t) * mouthSize
                return (
                  <mesh key={i} position={[x, y, 0]} scale={[0.02, 0.02, 0.01]}>
                    <sphereGeometry args={[1, 8, 8]} />
                    <meshBasicMaterial color="#FF6666" />
                  </mesh>
                )
              })}
            </group>
          )
      }
    }

    return (
      <group position={[0, 0.5, 0.5]}>
        {renderEyes()}

        {/* Blush */}
        <mesh position={[-0.35, -0.15, 0.2]} scale={[0.15, 0.1, 0.01]} visible={blushIntensity > 0}>
          <sphereGeometry />
          <meshBasicMaterial color="#FF9999" transparent opacity={blushIntensity} />
        </mesh>
        <mesh position={[0.35, -0.15, 0.2]} scale={[0.15, 0.1, 0.01]} visible={blushIntensity > 0}>
          <sphereGeometry />
          <meshBasicMaterial color="#FF9999" transparent opacity={blushIntensity} />
        </mesh>

        {/* Freckles */}
        {hasFreckles && (
          <>
            <mesh position={[-0.25, -0.05, 0.2]} scale={[0.02, 0.02, 0.01]}>
              <sphereGeometry />
              <meshBasicMaterial color="#AA7777" />
            </mesh>
            <mesh position={[-0.35, -0.1, 0.2]} scale={[0.02, 0.02, 0.01]}>
              <sphereGeometry />
              <meshBasicMaterial color="#AA7777" />
            </mesh>
            <mesh position={[0.25, -0.05, 0.2]} scale={[0.02, 0.02, 0.01]}>
              <sphereGeometry />
              <meshBasicMaterial color="#AA7777" />
            </mesh>
            <mesh position={[0.35, -0.1, 0.2]} scale={[0.02, 0.02, 0.01]}>
              <sphereGeometry />
              <meshBasicMaterial color="#AA7777" />
            </mesh>
          </>
        )}

        {/* Eyebrows */}
        {renderEyebrows()}

        {renderMouth()}
      </group>
    )
  }, [mouthType, eyeSize, eyeDistance, mouthSize, blushIntensity, hasEyebrows, hasFreckles])

  // Accessory component
  const Accessory = useMemo(() => {
    switch (accessoryType) {
      case "bow":
        return (
          <group position={[0, 1.1, 0]}>
            {/* Left loop */}
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.15, 0.05, 16, 32, Math.PI * 1.5]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
            {/* Right loop */}
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <torusGeometry args={[0.15, 0.05, 16, 32, Math.PI * 1.5]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
            {/* Center knot */}
            <mesh scale={[0.2, 0.15, 0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
            {/* Ribbons */}
            <mesh position={[0.1, -0.2, 0]} rotation={[0, 0, Math.PI / 6]} scale={[0.3, 0.1, 0.05]}>
              <boxGeometry />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
            <mesh position={[-0.1, -0.2, 0]} rotation={[0, 0, -Math.PI / 6]} scale={[0.3, 0.1, 0.05]}>
              <boxGeometry />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
          </group>
        )
      case "hat":
        return (
          <group position={[0, 1.1, 0]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 0.2, 32]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
          </group>
        )
      case "glasses":
        return (
          <group position={[0, 0.5, 0.6]}>
            <mesh position={[-0.25, 0, 0]}>
              <torusGeometry args={[0.15, 0.02, 16, 32]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
            <mesh position={[0.25, 0, 0]}>
              <torusGeometry args={[0.15, 0.02, 16, 32]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
            <mesh position={[0, 0, 0]} scale={[0.2, 0.02, 0.02]}>
              <boxGeometry />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
          </group>
        )
      case "none":
      default:
        return null
      case "crown":
        return (
          <group position={[0, 1.1, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 0.2, 32]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>
            {/* Crown points */}
            {[-0.2, -0.1, 0, 0.1, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 0.15, 0]}>
                <coneGeometry args={[0.05, 0.1, 4]} />
                <meshStandardMaterial color={accessoryColor} />
              </mesh>
            ))}
          </group>
        )
      case "flower":
        return (
          <group position={[0, 1.1, 0]}>
            {/* Petals */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2
              return (
                <mesh key={i} position={[Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, 0]} rotation={[0, 0, angle]}>
                  <sphereGeometry args={[0.08, 32, 32]} />
                  <meshStandardMaterial color={accessoryColor} />
                </mesh>
              )
            })}
            {/* Center */}
            <mesh scale={[0.1, 0.1, 0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color={accessoryColor === "#FFFFFF" ? "#FFEB3B" : "#FFFFFF"} />
            </mesh>
          </group>
        )
      case "headphones":
        return (
          <group position={[0, 0.5, 0]}>
            {/* Headband - curved for better fit */}
            <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.5, 0.03, 16, 32, Math.PI]} />
              <meshStandardMaterial color={accessoryColor} />
            </mesh>

            {/* Left ear cup - more 3D and realistic */}
            <group position={[-0.5, 0.2, 0]}>
              {/* Outer cup */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
                <meshStandardMaterial color={accessoryColor} />
              </mesh>
              {/* Inner padding */}
              <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
              {/* Connection to band */}
              <mesh position={[0, 0.15, 0]} scale={[0.02, 0.15, 0.02]}>
                <boxGeometry />
                <meshStandardMaterial color={accessoryColor} />
              </mesh>
            </group>

            {/* Right ear cup - more 3D and realistic */}
            <group position={[0.5, 0.2, 0]}>
              {/* Outer cup */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
                <meshStandardMaterial color={accessoryColor} />
              </mesh>
              {/* Inner padding */}
              <mesh position={[-0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
              {/* Connection to band */}
              <mesh position={[0, 0.15, 0]} scale={[0.02, 0.15, 0.02]}>
                <boxGeometry />
                <meshStandardMaterial color={accessoryColor} />
              </mesh>
            </group>
          </group>
        )
    }
  }, [accessoryColor, accessoryType])

  // Arms component
  const Arms = useMemo(() => {
    const renderArms = () => {
      switch (armType) {
        case ARM_TYPES.NONE:
          return null
        case ARM_TYPES.ROUND:
          return (
            <group>
              {/* Left arm */}
              <mesh position={[-0.8, -0.5, 0]} scale={[0.2, 0.2, 0.2]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={bodyColor} />
              </mesh>
              {/* Right arm */}
              <mesh position={[0.8, -0.5, 0]} scale={[0.2, 0.2, 0.2]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={bodyColor} />
              </mesh>
            </group>
          )
        case ARM_TYPES.STICK:
          return (
            <group>
              {/* Left arm */}
              <mesh position={[-0.8, -0.5, 0]} rotation={[0, 0, Math.PI / 4]} scale={[0.1, 0.4, 0.1]}>
                <cylinderGeometry args={[1, 1, 1, 16]} />
                <meshStandardMaterial color={bodyColor} />
              </mesh>
              {/* Right arm */}
              <mesh position={[0.8, -0.5, 0]} rotation={[0, 0, -Math.PI / 4]} scale={[0.1, 0.4, 0.1]}>
                <cylinderGeometry args={[1, 1, 1, 16]} />
                <meshStandardMaterial color={bodyColor} />
              </mesh>
            </group>
          )
        case ARM_TYPES.STUBBY:
          return (
            <group>
              {/* Left arm */}
              <mesh position={[-0.8, -0.5, 0]} rotation={[0, 0, Math.PI / 6]} scale={[0.15, 0.25, 0.15]}>
                <capsuleGeometry args={[0.5, 1, 8, 16]} />
                <meshStandardMaterial color={bodyColor} />
              </mesh>
              {/* Right arm */}
              <mesh position={[0.8, -0.5, 0]} rotation={[0, 0, -Math.PI / 6]} scale={[0.15, 0.25, 0.15]}>
                <capsuleGeometry args={[0.5, 1, 8, 16]} />
                <meshStandardMaterial color={bodyColor} />
              </mesh>
            </group>
          )
        default:
          return null
      }
    }

    return renderArms()
  }, [armType, bodyColor])

  return (
    <group ref={groupRef}>
      {Body}
      {Head}
      {Face}
      {Accessory}
      {Arms}

      {hasSparkles && <DreiSparkles count={50} scale={[5, 5, 5]} size={6} speed={0.3} color="#FFF" />}
    </group>
  )
}

export default Character

