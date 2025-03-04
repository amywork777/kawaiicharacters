"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { Suspense, useEffect, useState, Component, ErrorInfo, useCallback, forwardRef, useImperativeHandle, useRef } from "react"
import Character from "./character"
import { Environment } from "@react-three/drei"

interface ThreeViewerProps {
  backgroundColor: string
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
  threeRef?: React.MutableRefObject<{
    takeScreenshot: () => string | null;
  } | null>
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}

function ErrorFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-red-500">Failed to load 3D viewer. Please refresh the page.</div>
    </div>
  )
}

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Three.js error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Scene component that has access to the renderer
const Scene = forwardRef((props: ThreeViewerProps, ref) => {
  const { gl, scene, camera } = useThree()
  
  // Expose the take screenshot function to the parent component
  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      // Render the scene
      gl.render(scene, camera)
      
      // Return the canvas element with the rendered content
      return gl.domElement.toDataURL('image/png', 1.0)
    }
  }))
  
  return (
    <>
      <color attach="background" args={[props.backgroundColor]} />
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.8} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.8} />
      <directionalLight position={[0, 5, 5]} intensity={1.2} castShadow />
      
      {/* Environment mapping for reflections */}
      <Environment preset="sunset" />
      
      <Character 
        bodyType={props.bodyType}
        headType={props.headType}
        accessoryType={props.accessoryType}
        mouthType={props.mouthType}
        pose={props.pose}
        pattern={props.pattern}
        bodyColor={props.bodyColor}
        headColor={props.headColor}
        accessoryColor={props.accessoryColor}
        patternColor={props.patternColor}
        blushIntensity={props.blushIntensity}
        eyeSize={props.eyeSize}
        eyeDistance={props.eyeDistance}
        mouthSize={props.mouthSize}
        hasEyebrows={props.hasEyebrows}
        hasFreckles={props.hasFreckles}
        hasSparkles={props.hasSparkles}
        armType={props.armType}
      />
    </>
  )
})

Scene.displayName = 'Scene'

export default function ThreeViewer(props: ThreeViewerProps) {
  const [isClient, setIsClient] = useState(false)
  const sceneRef = useRef(null)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Connect the scene's screenshot function to the external ref
  useEffect(() => {
    if (props.threeRef && sceneRef.current) {
      props.threeRef.current = {
        takeScreenshot: () => {
          if (sceneRef.current) {
            // @ts-ignore - We know takeScreenshot exists on our ref
            return sceneRef.current.takeScreenshot();
          }
          return null;
        }
      };
    }
  }, [props.threeRef, sceneRef.current]);

  if (!isClient) {
    return <LoadingFallback />
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <div className="w-full h-full">
          <Canvas
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: "100%", height: "100%" }}
            dpr={[1, 2]}
          >
            <Scene ref={sceneRef} {...props} />
          </Canvas>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
} 