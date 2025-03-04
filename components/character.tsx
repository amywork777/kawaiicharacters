"use client"

import React, { useRef, useMemo, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { animated } from "@react-spring/three"
import { Sparkles as DreiSparkles } from "@react-three/drei"
import { Shape, ExtrudeGeometry } from "three"
import * as THREE from 'three'

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

// Function to make colors more pastel and vibrant
const enhanceColor = (color: string): string => {
  // If it's a hex color, convert to slightly more vibrant version while keeping pastel quality
  if (color.startsWith('#')) {
    // Parse the hex color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Increase saturation while maintaining pastel quality
    const newR = Math.min(255, Math.round(r * 1.15));
    const newG = Math.min(255, Math.round(g * 1.15));
    const newB = Math.min(255, Math.round(b * 1.15));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  return color;
};

// Create a standard shiny material for all objects
const createShinyMaterial = (color: string, emissiveIntensity = 0.2) => {
  return (
    <meshPhysicalMaterial 
      color={enhanceColor(color)}
      emissive={color}
      emissiveIntensity={emissiveIntensity}
      roughness={0.2}
      metalness={0.3}
      clearcoat={0.8}
      clearcoatRoughness={0.2}
      reflectivity={0.5}
      envMapIntensity={1.2}
    />
  );
};

// Create a unified character style
const CHARACTER_PROPORTIONS = {
  // Base proportions
  bodyHeight: 1.0,
  bodyWidth: 1.0,
  headScale: 1.0,
  // Positioning
  headPositionY: 0.8,
  accessoryOffset: 0.1,
  // Cohesive design constants
  roundness: 32, // Higher values = smoother curves
  jointSmoothing: 0.07, // For smoother connections between parts
};

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
  const [isMounted, setIsMounted] = useState(false)
  const groupRef = useRef<Group>(null)
  const bodyRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Create animated components
  const AnimatedGroup = animated("group")

  // Gentle floating animation for all poses
  useFrame((state) => {
    if (!isMounted || !groupRef.current) return

    const time = state.clock.getElapsedTime()
    
    // Base floating animation
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.1

    // Different animations based on pose
    switch (pose) {
      case "default":
        groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.1
        break
      case "shy":
        groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.05
        groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.05
        break
      case "excited":
        groupRef.current.position.y = Math.sin(time * 2) * 0.15
        groupRef.current.rotation.z = Math.sin(time * 2) * 0.1
        break
      case "dancing":
        if (bodyRef.current) {
          bodyRef.current.rotation.y = Math.sin(time * 2) * 0.2
        }
        break
    }
  })

  if (!isMounted) {
    return null
  }

  // Pattern rendering function
  const getPatternGeometry = (pattern: string) => {
    if (pattern === "spots") {
      return <circleGeometry args={[1, 32]} />
    } else if (pattern === "stripes") {
      return <planeGeometry args={[2, 0.3]} />
    } else {
      return <primitive object={createPatternShape(pattern)} />
    }
  }

  // Body component based on type
  const renderBody = () => {
    const patternPositions = [
      [0.3, 0, 0.51],
      [-0.2, 0.3, 0.51],
      [0.1, -0.2, 0.51],
      [-0.3, -0.1, 0.51],
    ]

    const renderPattern = () => {
      if (pattern === "solid") return null

      return (
        <group>
          {patternPositions.map(([x, y, z], index) => (
            <mesh key={index} position={[x, y, z]} rotation={[0, 0, Math.random() * Math.PI]} scale={[0.2, 0.2, 0.1]}>
              {getPatternGeometry(pattern)}
              {createShinyMaterial(patternColor, 0.3)}
            </mesh>
          ))}
        </group>
      )
    }

    switch (bodyType) {
      case "square":
        return (
          <AnimatedGroup ref={bodyRef}>
            <mesh position={[0, -0.7, 0]} scale={[1 * CHARACTER_PROPORTIONS.bodyWidth, 1 * CHARACTER_PROPORTIONS.bodyHeight, 1]}>
              <boxGeometry args={[1, 1, 1]} />
              {createShinyMaterial(bodyColor)}
            </mesh>
            {/* Rounded corners using small spheres at the corners */}
            {[[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5],
              [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]].map((pos, i) => (
              <mesh key={i} position={[pos[0] * CHARACTER_PROPORTIONS.bodyWidth, pos[1] * CHARACTER_PROPORTIONS.bodyHeight + -0.7, pos[2]]} scale={[0.1, 0.1, 0.1]}>
                <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
                {createShinyMaterial(bodyColor)}
              </mesh>
            ))}
            {renderPattern()}
          </AnimatedGroup>
        )
      case "bean":
        return (
          <AnimatedGroup ref={bodyRef}>
            <mesh position={[0, -0.7, 0]} scale={[1 * CHARACTER_PROPORTIONS.bodyWidth, 1.3 * CHARACTER_PROPORTIONS.bodyHeight, 0.8]}>
              <capsuleGeometry args={[0.4, 0.8, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
              {createShinyMaterial(bodyColor)}
            </mesh>
            {renderPattern()}
          </AnimatedGroup>
        )
      case "pear":
        return (
          <AnimatedGroup ref={bodyRef}>
            <mesh position={[0, -0.5, 0]} scale={[1 * CHARACTER_PROPORTIONS.bodyWidth, 1.2 * CHARACTER_PROPORTIONS.bodyHeight, 0.8]}>
              <sphereGeometry args={[0.5, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
              {createShinyMaterial(bodyColor)}
            </mesh>
            <mesh position={[0, -1.1, 0]} scale={[0.9 * CHARACTER_PROPORTIONS.bodyWidth, 0.8 * CHARACTER_PROPORTIONS.bodyHeight, 0.7]}>
              <sphereGeometry args={[0.5, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
              {createShinyMaterial(bodyColor)}
            </mesh>
            {/* Connection between spheres for smoother transition */}
            <mesh position={[0, -0.8, 0]} scale={[0.3, 0.5, 0.3]}>
              <cylinderGeometry args={[1, 1, 1, CHARACTER_PROPORTIONS.roundness]} />
              {createShinyMaterial(bodyColor)}
            </mesh>
            {renderPattern()}
          </AnimatedGroup>
        )
      case "round":
      default:
        return (
          <AnimatedGroup ref={bodyRef}>
            <mesh position={[0, -0.7, 0]} scale={[1 * CHARACTER_PROPORTIONS.bodyWidth, 1 * CHARACTER_PROPORTIONS.bodyHeight, 0.9]}>
              <sphereGeometry args={[0.6, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
              {createShinyMaterial(bodyColor)}
            </mesh>
            {renderPattern()}
          </AnimatedGroup>
        )
    }
  }

  // Head component based on type
  const renderHead = () => {
    // Base head position based on unified proportions
    const headY = CHARACTER_PROPORTIONS.headPositionY;
    const headScale = CHARACTER_PROPORTIONS.headScale;
    
    switch (headType) {
      case "cat":
        return (
          <AnimatedGroup ref={headRef} position={[0, headY, 0]}>
            <mesh scale={[0.5 * headScale, 0.5 * headScale, 0.5 * headScale]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Cat ears with improved connections */}
            <group position={[0, 0.1, 0]}>
              <mesh position={[-0.3, 0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
                <coneGeometry args={[0.15, 0.3, CHARACTER_PROPORTIONS.roundness]} />
                {createShinyMaterial(headColor)}
              </mesh>
              <mesh position={[0.3, 0.25, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <coneGeometry args={[0.15, 0.3, CHARACTER_PROPORTIONS.roundness]} />
                {createShinyMaterial(headColor)}
              </mesh>
              {/* Ear base smoothing */}
              <mesh position={[-0.3, 0.12, 0]} scale={[0.15, CHARACTER_PROPORTIONS.jointSmoothing, 0.15]}>
                <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
                {createShinyMaterial(headColor)}
              </mesh>
              <mesh position={[0.3, 0.12, 0]} scale={[0.15, CHARACTER_PROPORTIONS.jointSmoothing, 0.15]}>
                <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
                {createShinyMaterial(headColor)}
              </mesh>
              {/* Inner ears */}
              <mesh position={[-0.3, 0.25, 0.05]} rotation={[0, 0, Math.PI / 4]} scale={[0.7, 0.7, 0.7]}>
                <coneGeometry args={[0.15, 0.2, CHARACTER_PROPORTIONS.roundness]} />
                {createShinyMaterial("#FFD6E0")}
              </mesh>
              <mesh position={[0.3, 0.25, 0.05]} rotation={[0, 0, -Math.PI / 4]} scale={[0.7, 0.7, 0.7]}>
                <coneGeometry args={[0.15, 0.2, CHARACTER_PROPORTIONS.roundness]} />
                {createShinyMaterial("#FFD6E0")}
              </mesh>
            </group>
          </AnimatedGroup>
        )
      case "bear":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Bear ears */}
            <mesh position={[-0.3, 0.4, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              {createShinyMaterial(headColor)}
            </mesh>
            <mesh position={[0.3, 0.4, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              {createShinyMaterial(headColor)}
            </mesh>
          </AnimatedGroup>
        )
      case "bunny":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Bunny ears */}
            <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, Math.PI / 12]}>
              <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
              {createShinyMaterial(headColor)}
            </mesh>
            <mesh position={[0.2, 0.4, 0]} rotation={[0, 0, -Math.PI / 12]}>
              <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Inner ears */}
            <mesh position={[-0.2, 0.4, 0.02]} rotation={[0, 0, Math.PI / 12]} scale={[0.7, 0.9, 0.1]}>
              <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
              {createShinyMaterial("#FFB6C1")}
            </mesh>
            <mesh position={[0.2, 0.4, 0.02]} rotation={[0, 0, -Math.PI / 12]} scale={[0.7, 0.9, 0.1]}>
              <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
              {createShinyMaterial("#FFB6C1")}
            </mesh>
          </AnimatedGroup>
        )
      case "round":
      default:
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
          </AnimatedGroup>
        )
      case "fox":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            {/* Main head */}
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Snout */}
            <mesh position={[0, -0.1, 0.3]} scale={[0.3, 0.25, 0.3]}>
              <coneGeometry args={[0.5, 1, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Ears */}
            <mesh position={[-0.25, 0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
              <coneGeometry args={[0.15, 0.4, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            <mesh position={[0.25, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <coneGeometry args={[0.15, 0.4, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Inner ears */}
            <mesh position={[-0.25, 0.4, 0.02]} rotation={[0, 0, Math.PI / 6]} scale={[0.8, 0.8, 0.1]}>
              <coneGeometry args={[0.15, 0.4, 32]} />
              {createShinyMaterial("#FFB6C1")}
            </mesh>
            <mesh position={[0.25, 0.4, 0.02]} rotation={[0, 0, -Math.PI / 6]} scale={[0.8, 0.8, 0.1]}>
              <coneGeometry args={[0.15, 0.4, 32]} />
              {createShinyMaterial("#FFB6C1")}
            </mesh>
          </AnimatedGroup>
        )
      case "hamster":
        return (
          <AnimatedGroup ref={headRef} position={[0, 0.5, 0]}>
            {/* Main head */}
            <mesh scale={[1.2, 1, 1]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Cheeks */}
            <mesh position={[-0.4, -0.1, 0]} scale={[0.3, 0.25, 0.3]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            <mesh position={[0.4, -0.1, 0]} scale={[0.3, 0.25, 0.3]}>
              <sphereGeometry args={[0.5, 32, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            {/* Ears */}
            <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, Math.PI / 12]}>
              <circleGeometry args={[0.15, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
            <mesh position={[0.2, 0.4, 0]} rotation={[0, 0, -Math.PI / 12]}>
              <circleGeometry args={[0.15, 32]} />
              {createShinyMaterial(headColor)}
            </mesh>
          </AnimatedGroup>
        )
    }
  }

  // Face components
  const renderFace = () => {
    // Move eyeSpacing calculation outside of renderEyes so it can be used by both functions
    const eyeSpacing = 0.2 * eyeDistance;
    const eyeDepth = 0.25; // Make eyes more forward-facing for better visibility

    const renderEyes = () => {
      // Improved eye rendering with better positioning and depth
      return (
        <>
          <mesh position={[-eyeSpacing, 0, eyeDepth]} scale={[0.1 * eyeSize, 0.1 * eyeSize, 0.05]}>
            <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
            <meshPhysicalMaterial color="black" clearcoat={1.0} clearcoatRoughness={0.1} metalness={0.5} />
          </mesh>
          <mesh position={[eyeSpacing, 0, eyeDepth]} scale={[0.1 * eyeSize, 0.1 * eyeSize, 0.05]}>
            <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
            <meshPhysicalMaterial color="black" clearcoat={1.0} clearcoatRoughness={0.1} metalness={0.5} />
          </mesh>
        </>
      )
    }
    
    // Add eye reflections (highlights) for better 3D appearance
    const renderEyeHighlights = () => {
      return (
        <>
          <mesh position={[-eyeSpacing - 0.02, 0.02, eyeDepth + 0.05]} scale={[0.03 * eyeSize, 0.03 * eyeSize, 0.01]}>
            <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh position={[eyeSpacing - 0.02, 0.02, eyeDepth + 0.05]} scale={[0.03 * eyeSize, 0.03 * eyeSize, 0.01]}>
            <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </>
      )
    }

    const renderEyebrows = () => {
      if (!hasEyebrows) return null

      // Create eyebrows above each eye
      return (
        <>
          {/* Left eyebrow */}
          <mesh position={[-eyeSpacing, 0.15, 0.2]} rotation={[0, 0, Math.PI / 12]} scale={[0.12, 0.03, 0.01]}>
            <boxGeometry />
            <meshPhysicalMaterial color="black" clearcoat={0.5} clearcoatRoughness={0.2} />
          </mesh>

          {/* Right eyebrow */}
          <mesh position={[eyeSpacing, 0.15, 0.2]} rotation={[0, 0, -Math.PI / 12]} scale={[0.12, 0.03, 0.01]}>
            <boxGeometry />
            <meshPhysicalMaterial color="black" clearcoat={0.5} clearcoatRoughness={0.2} />
          </mesh>
        </>
      )
    }

    const renderMouth = () => {
      const mouthZ = 0.25; // Consistent mouth depth with eyes
      
      // Updated mouth types as requested
      switch (mouthType) {
        case "cat":
          // Symmetrical X-shaped cat mouth
          return (
            <group position={[0, -0.2, mouthZ]}>
              {/* Top-left to bottom-right diagonal */}
              <mesh rotation={[0, 0, Math.PI / 4]} scale={[0.15 * mouthSize, 0.02 * mouthSize, 0.05]}>
                <boxGeometry />
                <meshPhysicalMaterial color="#FF6B6B" clearcoat={0.8} clearcoatRoughness={0.1} />
              </mesh>
              {/* Top-right to bottom-left diagonal */}
              <mesh rotation={[0, 0, -Math.PI / 4]} scale={[0.15 * mouthSize, 0.02 * mouthSize, 0.05]}>
                <boxGeometry />
                <meshPhysicalMaterial color="#FF6B6B" clearcoat={0.8} clearcoatRoughness={0.1} />
              </mesh>
            </group>
          )
        case "smile":
          // Frown - upside down curved line
          return (
            <mesh position={[0, -0.2, mouthZ]} rotation={[0, 0, Math.PI]} scale={[0.2 * mouthSize, 0.1 * mouthSize, 0.05]}>
              <torusGeometry args={[0.5, 0.15, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness, Math.PI]} />
              <meshPhysicalMaterial color="#FF6B6B" clearcoat={0.8} clearcoatRoughness={0.1} />
            </mesh>
          )
        case "open":
          // A surprised open mouth
          return (
            <group position={[0, -0.2, mouthZ]}>
              <mesh scale={[0.15 * mouthSize, 0.12 * mouthSize, 0.05]}>
                <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
                <meshPhysicalMaterial color="#FF9999" clearcoat={0.8} clearcoatRoughness={0.1} />
              </mesh>
              <mesh position={[0, 0, 0.01]} scale={[0.12 * mouthSize, 0.09 * mouthSize, 0.05]}>
                <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
                <meshPhysicalMaterial color="#993333" clearcoat={0.8} clearcoatRoughness={0.1} />
              </mesh>
            </group>
          )
        case "surprised":
          // An O-shaped surprised mouth
          return (
            <group position={[0, -0.2, mouthZ]}>
              <mesh scale={[0.1 * mouthSize, 0.1 * mouthSize, 0.05]}>
                <ringGeometry args={[0.3, 0.6, CHARACTER_PROPORTIONS.roundness]} />
                <meshPhysicalMaterial color="#FF6B6B" clearcoat={0.8} clearcoatRoughness={0.1} />
              </mesh>
              <mesh position={[0, 0, -0.01]} scale={[0.08 * mouthSize, 0.08 * mouthSize, 0.01]}>
                <circleGeometry args={[1, CHARACTER_PROPORTIONS.roundness]} />
                <meshPhysicalMaterial color="#993333" clearcoat={0.8} clearcoatRoughness={0.1} />
              </mesh>
            </group>
          )
        case "shy":
          // A small, understated mouth for shy expression
          return (
            <group position={[0, -0.2, mouthZ]}>
              <mesh scale={[0.1 * mouthSize, 0.03 * mouthSize, 0.05]}>
                <capsuleGeometry args={[0.3, 0.6, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
                <meshPhysicalMaterial color="#FF6B6B" clearcoat={0.8} clearcoatRoughness={0.1} />
              </mesh>
            </group>
          )
        default:
          // A simple straight line for neutral expression
          return (
            <mesh position={[0, -0.2, mouthZ]} rotation={[0, 0, 0]} scale={[0.2 * mouthSize, 0.02 * mouthSize, 0.05]}>
              <boxGeometry />
              <meshPhysicalMaterial color="#FF6B6B" clearcoat={0.8} clearcoatRoughness={0.1} />
            </mesh>
          )
      }
    }

    // Position face elements appropriately on the head
    const facePositionY = CHARACTER_PROPORTIONS.headPositionY + 0.05;
    return (
      <group position={[0, facePositionY, 0.3]}>
        {renderEyes()}
        {renderEyeHighlights()}
        {hasEyebrows && renderEyebrows()}
        {renderMouth()}
        
        {/* Improved blush positioning - more centered on the face */}
        {blushIntensity > 0 && (
          <group position={[0, -0.05, 0.25]}>
            <mesh position={[-0.22, -0.05, 0]} rotation={[0, -Math.PI / 12, 0]} scale={[0.18 * blushIntensity, 0.12 * blushIntensity, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
              <meshPhysicalMaterial color="#FF9090" transparent opacity={0.7 * blushIntensity} clearcoat={0.5} />
            </mesh>
            <mesh position={[0.22, -0.05, 0]} rotation={[0, Math.PI / 12, 0]} scale={[0.18 * blushIntensity, 0.12 * blushIntensity, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness, CHARACTER_PROPORTIONS.roundness]} />
              <meshPhysicalMaterial color="#FF9090" transparent opacity={0.7 * blushIntensity} clearcoat={0.5} />
            </mesh>
          </group>
        )}
        
        {/* Keep freckles and sparkles */}
        {hasFreckles && (
          <group position={[0, 0, 0.26]}>
            {/* Left cheek freckles */}
            <mesh position={[-0.2, -0.05, 0]} rotation={[0, -Math.PI / 20, 0]} scale={[0.02, 0.02, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
            <mesh position={[-0.25, -0.08, 0]} rotation={[0, -Math.PI / 16, 0]} scale={[0.018, 0.018, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
            <mesh position={[-0.17, -0.09, 0]} rotation={[0, -Math.PI / 24, 0]} scale={[0.017, 0.017, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
            
            {/* Right cheek freckles */}
            <mesh position={[0.2, -0.05, 0]} rotation={[0, Math.PI / 20, 0]} scale={[0.02, 0.02, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
            <mesh position={[0.25, -0.08, 0]} rotation={[0, Math.PI / 16, 0]} scale={[0.018, 0.018, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
            <mesh position={[0.17, -0.09, 0]} rotation={[0, Math.PI / 24, 0]} scale={[0.017, 0.017, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
            
            {/* Nose bridge freckles */}
            <mesh position={[0, 0.05, 0.1]} scale={[0.016, 0.016, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
            <mesh position={[-0.03, 0.03, 0.1]} scale={[0.014, 0.014, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
            <mesh position={[0.03, 0.03, 0.1]} scale={[0.014, 0.014, 0.01]}>
              <sphereGeometry args={[1, CHARACTER_PROPORTIONS.roundness / 2, CHARACTER_PROPORTIONS.roundness / 2]} />
              <meshPhysicalMaterial color="#FF9090" clearcoat={0.5} />
            </mesh>
          </group>
        )}

        {/* Add sparkle effects if enabled */}
        {hasSparkles && (
          <group>
            {[
              [-0.4, 0.2, 0.3],
              [0.4, 0.3, 0.2],
              [-0.2, -0.2, 0.4],
              [0.3, 0.1, 0.3],
              [-0.3, 0.35, 0.25],
              [0.25, -0.15, 0.35]
            ].map((pos, index) => (
              <group key={index} position={[pos[0], pos[1], pos[2]]}>
                <mesh scale={[0.03, 0.03, 0.01]} rotation={[0, 0, Math.PI / 4]}>
                  <boxGeometry args={[1, 0.2, 0.2]} />
                  <meshBasicMaterial color="white" />
                </mesh>
                <mesh scale={[0.03, 0.03, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
                  <boxGeometry args={[1, 0.2, 0.2]} />
                  <meshBasicMaterial color="white" />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </group>
    )
  }

  // Accessory component
  const renderAccessory = () => {
    switch (accessoryType) {
      case "bow":
        return (
          <group position={[0, 1.1, 0]}>
            {/* Left loop */}
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.15, 0.05, 16, 32, Math.PI * 1.5]} />
              {createShinyMaterial(accessoryColor)}
            </mesh>
            {/* Right loop */}
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <torusGeometry args={[0.15, 0.05, 16, 32, Math.PI * 1.5]} />
              {createShinyMaterial(accessoryColor)}
            </mesh>
            {/* Center knot */}
            <mesh scale={[0.2, 0.15, 0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
              {createShinyMaterial(accessoryColor)}
            </mesh>
            {/* Ribbons */}
            <mesh position={[0.1, -0.2, 0]} rotation={[0, 0, Math.PI / 6]} scale={[0.3, 0.1, 0.05]}>
              <boxGeometry />
              {createShinyMaterial(accessoryColor)}
            </mesh>
            <mesh position={[-0.1, -0.2, 0]} rotation={[0, 0, -Math.PI / 6]} scale={[0.3, 0.1, 0.05]}>
              <boxGeometry />
              {createShinyMaterial(accessoryColor)}
            </mesh>
          </group>
        )
      case "hat":
        return (
          <group position={[0, 1.1, 0]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 0.2, 32]} />
              {createShinyMaterial(accessoryColor)}
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
              {createShinyMaterial(accessoryColor)}
            </mesh>
          </group>
        )
      case "glasses":
        return (
          <group position={[0, 0.5, 0.6]}>
            <mesh position={[-0.25, 0, 0]}>
              <torusGeometry args={[0.15, 0.02, 16, 32]} />
              {createShinyMaterial(accessoryColor)}
            </mesh>
            <mesh position={[0.25, 0, 0]}>
              <torusGeometry args={[0.15, 0.02, 16, 32]} />
              {createShinyMaterial(accessoryColor)}
            </mesh>
            <mesh position={[0, 0, 0]} scale={[0.2, 0.02, 0.02]}>
              <boxGeometry />
              {createShinyMaterial(accessoryColor)}
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
              {createShinyMaterial(accessoryColor)}
            </mesh>
            {/* Crown points */}
            {[-0.2, -0.1, 0, 0.1, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 0.15, 0]}>
                <coneGeometry args={[0.05, 0.1, 4]} />
                {createShinyMaterial(accessoryColor)}
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
                  {createShinyMaterial(accessoryColor)}
                </mesh>
              )
            })}
            {/* Center */}
            <mesh scale={[0.1, 0.1, 0.1]}>
              <sphereGeometry args={[1, 32, 32]} />
              {createShinyMaterial(accessoryColor === "#FFFFFF" ? "#FFEB3B" : "#FFFFFF")}
            </mesh>
          </group>
        )
      case "headphones":
        return (
          <group position={[0, 0.5, 0]}>
            {/* Headband - curved for better fit */}
            <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.5, 0.03, 16, 32, Math.PI]} />
              {createShinyMaterial(accessoryColor)}
            </mesh>

            {/* Left ear cup - more 3D and realistic */}
            <group position={[-0.5, 0.2, 0]}>
              {/* Outer cup */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
                {createShinyMaterial(accessoryColor)}
              </mesh>
              {/* Inner padding */}
              <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
              {/* Connection to band */}
              <mesh position={[0, 0.15, 0]} scale={[0.02, 0.15, 0.02]}>
                <boxGeometry />
                {createShinyMaterial(accessoryColor)}
              </mesh>
            </group>

            {/* Right ear cup - more 3D and realistic */}
            <group position={[0.5, 0.2, 0]}>
              {/* Outer cup */}
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
                {createShinyMaterial(accessoryColor)}
              </mesh>
              {/* Inner padding */}
              <mesh position={[-0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
              {/* Connection to band */}
              <mesh position={[0, 0.15, 0]} scale={[0.02, 0.15, 0.02]}>
                <boxGeometry />
                {createShinyMaterial(accessoryColor)}
              </mesh>
            </group>
          </group>
        )
    }
  }

  // Arms component
  const renderArms = () => {
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
                {createShinyMaterial(bodyColor)}
              </mesh>
              {/* Right arm */}
              <mesh position={[0.8, -0.5, 0]} scale={[0.2, 0.2, 0.2]}>
                <sphereGeometry args={[1, 32, 32]} />
                {createShinyMaterial(bodyColor)}
              </mesh>
            </group>
          )
        case ARM_TYPES.STICK:
          return (
            <group>
              {/* Left arm */}
              <mesh position={[-0.8, -0.5, 0]} rotation={[0, 0, Math.PI / 4]} scale={[0.1, 0.4, 0.1]}>
                <cylinderGeometry args={[1, 1, 1, 16]} />
                {createShinyMaterial(bodyColor)}
              </mesh>
              {/* Right arm */}
              <mesh position={[0.8, -0.5, 0]} rotation={[0, 0, -Math.PI / 4]} scale={[0.1, 0.4, 0.1]}>
                <cylinderGeometry args={[1, 1, 1, 16]} />
                {createShinyMaterial(bodyColor)}
              </mesh>
            </group>
          )
        case ARM_TYPES.STUBBY:
          return (
            <group>
              {/* Left arm */}
              <mesh position={[-0.8, -0.5, 0]} rotation={[0, 0, Math.PI / 6]} scale={[0.15, 0.25, 0.15]}>
                <capsuleGeometry args={[0.5, 1, 8, 16]} />
                {createShinyMaterial(bodyColor)}
              </mesh>
              {/* Right arm */}
              <mesh position={[0.8, -0.5, 0]} rotation={[0, 0, -Math.PI / 6]} scale={[0.15, 0.25, 0.15]}>
                <capsuleGeometry args={[0.5, 1, 8, 16]} />
                {createShinyMaterial(bodyColor)}
              </mesh>
            </group>
          )
        default:
          return null
      }
    }

    return renderArms()
  }

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />
      <directionalLight position={[0, -5, 5]} intensity={0.3} />
      
      {renderBody()}
      {renderHead()}
      {renderFace()}
      {renderAccessory()}
      {renderArms()}
      
      {/* Add 3D environment reflection */}
      <mesh scale={[20, 20, 20]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.01} side={THREE.BackSide} />
      </mesh>
      
      {/* Add shadow plane */}
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

export default Character

