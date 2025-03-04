"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SparklesIcon, Shuffle, RotateCcw, Download, Heart, Camera, Wand2 } from "lucide-react"
import ColorPicker from "@/components/color-picker"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createGIF } from "gifshot"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type * as THREE from "three"
import Logo from "@/components/logo"
import dynamic from "next/dynamic"

// Dynamically import the ThreeViewer component with no SSR
const ThreeViewer = dynamic(() => import("./three-viewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  ),
})

// Define the character parts and colors
const BODY_TYPES = ["round", "square", "bean", "pear"]
const HEAD_TYPES = ["round", "cat", "bear", "bunny", "fox", "hamster"]
const ACCESSORY_TYPES = ["none", "bow", "hat", "glasses", "crown", "flower", "headphones"]
const MOUTH_TYPES = ["smile", "cat", "open", "surprised", "shy"]
const POSES = ["default", "waving", "dancing", "shy", "excited"]
const PATTERNS = ["solid", "spots", "stripes", "hearts", "stars"]
const ARM_TYPES = ["none", "round", "stick", "stubby"]

const COLORS = [
  "#FFB6C1", // pink
  "#ADD8E6", // light blue
  "#90EE90", // light green
  "#FFFFE0", // light yellow
  "#E6E6FA", // lavender
  "#FFA07A", // light salmon
  "#FFFFFF", // white
  "#D3D3D3", // light gray
  "#FFC0CB", // pastel pink
  "#B0E0E6", // powder blue
  "#98FB98", // pale green
  "#FFFACD", // lemon chiffon
  "#DDA0DD", // plum
  "#FFDAB9", // peach
  "#F0F8FF", // alice blue
  "#F5F5F5", // white smoke
]

// Add a helper type for the Three.js viewer ref
type ThreeViewerRef = {
  takeScreenshot: () => string | null;
};

export default function CharacterDesigner() {
  const [bodyType, setBodyType] = useState("round")
  const [headType, setHeadType] = useState("round")
  const [accessoryType, setAccessoryType] = useState("none")
  const [mouthType, setMouthType] = useState("smile")
  const [pose, setPose] = useState("default")
  const [pattern, setPattern] = useState("solid")
  const [armType, setArmType] = useState("none")

  const [bodyColor, setBodyColor] = useState(COLORS[0])
  const [headColor, setHeadColor] = useState(COLORS[1])
  const [accessoryColor, setAccessoryColor] = useState(COLORS[2])
  const [patternColor, setPatternColor] = useState(COLORS[3])

  const [blushIntensity, setBlushIntensity] = useState(0.5)
  const [eyeSize, setEyeSize] = useState(0.7)
  const [eyeDistance, setEyeDistance] = useState(0.5)
  const [mouthSize, setMouthSize] = useState(0.6)

  const [hasEyebrows, setHasEyebrows] = useState(true)
  const [hasFreckles, setHasFreckles] = useState(false)
  const [hasSparkles, setHasSparkles] = useState(false)

  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [currentTab, setCurrentTab] = useState("body")
  const [showStars, setShowStars] = useState(false)

  // Auto-match head and body colors when toggled
  const [matchColors, setMatchColors] = useState(false)

  // Create a ref for the Three.js viewer
  const threeViewerRef = useRef<ThreeViewerRef>(null);

  useEffect(() => {
    if (matchColors) {
      setHeadColor(bodyColor)
    }
  }, [bodyColor, matchColors])

  const randomizeCharacter = () => {
    setBodyType(BODY_TYPES[Math.floor(Math.random() * BODY_TYPES.length)])
    setHeadType(HEAD_TYPES[Math.floor(Math.random() * HEAD_TYPES.length)])
    setAccessoryType(ACCESSORY_TYPES[Math.floor(Math.random() * ACCESSORY_TYPES.length)])
    setMouthType(MOUTH_TYPES[Math.floor(Math.random() * MOUTH_TYPES.length)])
    setArmType(ARM_TYPES[Math.floor(Math.random() * ARM_TYPES.length)])

    const randomBodyColor = COLORS[Math.floor(Math.random() * COLORS.length)]
    setBodyColor(randomBodyColor)
    setHeadColor(matchColors ? randomBodyColor : COLORS[Math.floor(Math.random() * COLORS.length)])
    setAccessoryColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    setPatternColor(COLORS[Math.floor(Math.random() * COLORS.length)])

    setBlushIntensity(Math.random())
    setEyeSize(0.5 + Math.random() * 0.5)
    setEyeDistance(0.3 + Math.random() * 0.7)
    setMouthSize(0.4 + Math.random() * 0.6)

    setHasEyebrows(Math.random() > 0.5)
    setHasFreckles(Math.random() > 0.7)
    setHasSparkles(Math.random() > 0.7)
  }

  const resetCharacter = () => {
    setBodyType("round")
    setHeadType("round")
    setAccessoryType("none")
    setMouthType("smile")
    setPose("default")
    setPattern("solid")
    setArmType("none")

    setBodyColor(COLORS[0])
    setHeadColor(COLORS[1])
    setAccessoryColor(COLORS[2])
    setPatternColor(COLORS[3])

    setBlushIntensity(0.5)
    setEyeSize(0.7)
    setEyeDistance(0.5)
    setMouthSize(0.6)

    setHasEyebrows(true)
    setHasFreckles(false)
    setHasSparkles(false)

    setBackgroundColor("#FFFFFF")
    setShowStars(false)
  }

  const makeExtraCute = () => {
    // Set to cutest options
    setBlushIntensity(0.8)
    setEyeSize(0.9)
    setHasEyebrows(true)
    setHasFreckles(true)
    setHasSparkles(true)
    setAccessoryType(["bow", "flower", "crown"][Math.floor(Math.random() * 3)])
    setArmType("round")
    setShowStars(true)

    // Set cute pastel colors
    setBodyColor("#FFC0CB") // Pink
    setHeadColor("#FFE0E0") // Light pink
    setAccessoryColor("#FFEB3B") // Yellow
    setBackgroundColor("#FFFFFF") // White background
  }

  const captureGIF = useCallback(() => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return

    const frames: string[] = []
    let frameCount = 0

    const captureFrame = () => {
      if (frameCount >= 30) {
        // Capture 30 frames
        createGIF(
          {
            images: frames,
            gifWidth: 512,
            gifHeight: 512,
            interval: 0.1, // 100ms between frames
            numWorkers: 2,
          },
          (obj) => {
            if (!obj.error) {
              const link = document.createElement("a")
              link.href = obj.image
              link.download = "my-kawaii-character.gif"
              link.click()
            }
          },
        )
        return
      }

      frames.push(canvas.toDataURL())
      frameCount++
      requestAnimationFrame(captureFrame)
    }

    captureFrame()
  }, [])

  const captureImage = useCallback(async () => {
    // Use our new function to capture the image
    if (threeViewerRef.current) {
      try {
        const dataUrl = threeViewerRef.current.takeScreenshot();
        
        if (!dataUrl) {
          console.error("Failed to capture screenshot");
          alert("Failed to save image. Please try again.");
          return;
        }
        
        // Create and trigger download
        const link = document.createElement("a");
        link.download = "my-kawaii-character.png";
        link.href = dataUrl;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        console.log("PNG captured and download initiated");
      } catch (error) {
        console.error("Error capturing PNG:", error);
        alert("There was an issue saving your character as PNG. Please try again.");
      }
    } else {
      console.error("Three.js viewer reference not available");
      alert("Could not access the 3D scene. Please try again.");
    }
  }, [threeViewerRef]);

  // Modify the download options
  const downloadOptions = [
    {
      label: "Download as PNG",
      icon: Camera,
      action: captureImage,
    },
    {
      label: "Download as GIF",
      icon: Download,
      action: captureGIF,
    },
  ]

  // Add this component for the download menu
  const DownloadMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-orange-300 hover:border-orange-400 hover:bg-orange-50">
          <Download className="h-4 w-4 text-orange-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {downloadOptions.map((option) => (
          <DropdownMenuItem key={option.label} onClick={option.action}>
            <option.icon className="mr-2 h-4 w-4" />
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const groupRef = useRef<THREE.Group>(null)

  return (
    <div className="w-full h-screen flex flex-row bg-white overflow-hidden">
      {/* 3D Viewer - Pass the reference */}
      <div className="w-2/3 h-full relative">
        <ThreeViewer
          threeRef={threeViewerRef}
          backgroundColor={backgroundColor}
          bodyType={bodyType}
          headType={headType}
          accessoryType={accessoryType}
          mouthType={mouthType}
          pose={pose}
          pattern={pattern}
          bodyColor={bodyColor}
          headColor={headColor}
          accessoryColor={accessoryColor}
          patternColor={patternColor}
          blushIntensity={blushIntensity}
          eyeSize={eyeSize}
          eyeDistance={eyeDistance}
          mouthSize={mouthSize}
          hasEyebrows={hasEyebrows}
          hasFreckles={hasFreckles}
          hasSparkles={hasSparkles}
          armType={armType}
        />

        {/* Logo in top-left corner */}
        <div className="absolute top-4 left-4 w-8 h-8">
          <Logo />
        </div>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={randomizeCharacter}
                  className="border-orange-300 hover:border-orange-400 hover:bg-orange-50"
                >
                  <Shuffle className="h-4 w-4 text-orange-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Randomize</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetCharacter}
                  className="border-orange-300 hover:border-orange-400 hover:bg-orange-50"
                >
                  <RotateCcw className="h-4 w-4 text-orange-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={makeExtraCute}
                  className="border-orange-300 hover:border-orange-400 hover:bg-orange-50"
                >
                  <Wand2 className="h-4 w-4 text-orange-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Make Extra Cute!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DownloadMenu />
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Controls */}
      <div className="w-1/3 h-full bg-white border-l border-gray-100 flex flex-col">
        <Tabs defaultValue="body" value={currentTab} onValueChange={setCurrentTab} className="h-full">
          <TabsList className="w-full grid grid-cols-4 h-auto border border-gray-100 rounded-none">
            <TabsTrigger
              value="body"
              className="rounded-none data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:shadow-none"
            >
              Body
            </TabsTrigger>
            <TabsTrigger
              value="head"
              className="rounded-none data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:shadow-none"
            >
              Head
            </TabsTrigger>
            <TabsTrigger
              value="face"
              className="rounded-none data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:shadow-none"
            >
              Face
            </TabsTrigger>
            <TabsTrigger
              value="extras"
              className="rounded-none data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:shadow-none"
            >
              Extras
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            {/* Previous TabsContent sections remain the same, just moved inside this scrollable container */}
            <TabsContent value="body" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Body Type</h3>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                      {bodyType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BODY_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={bodyType === type ? "default" : "outline"}
                        className={`capitalize ${
                          bodyType === type
                            ? "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 border border-orange-200"
                            : "border border-gray-200 text-gray-700 hover:bg-orange-50"
                        }`}
                        onClick={() => setBodyType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Arm Type</h3>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                      {armType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ARM_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={armType === type ? "default" : "outline"}
                        className={`capitalize ${
                          armType === type
                            ? "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 border border-orange-200"
                            : "border border-gray-200 text-gray-700 hover:bg-orange-50"
                        }`}
                        onClick={() => setArmType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Body Color</h3>
                  <ColorPicker colors={COLORS} selectedColor={bodyColor} onSelectColor={setBodyColor} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="head" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Head Type</h3>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                      {headType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {HEAD_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={headType === type ? "default" : "outline"}
                        className={`capitalize ${
                          headType === type
                            ? "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 border border-orange-200"
                            : "border border-gray-200 text-gray-700 hover:bg-orange-50"
                        }`}
                        onClick={() => setHeadType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Accessory</h3>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                      {accessoryType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ACCESSORY_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={accessoryType === type ? "default" : "outline"}
                        className={`capitalize ${
                          accessoryType === type
                            ? "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 border border-orange-200"
                            : "border border-gray-200 text-gray-700 hover:bg-orange-50"
                        }`}
                        onClick={() => setAccessoryType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Head Color</h3>
                  <ColorPicker colors={COLORS} selectedColor={headColor} onSelectColor={setHeadColor} />
                </div>

                {accessoryType !== "none" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Accessory Color</h3>
                    <ColorPicker colors={COLORS} selectedColor={accessoryColor} onSelectColor={setAccessoryColor} />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="match-colors" checked={matchColors} onCheckedChange={setMatchColors} />
                  <Label htmlFor="match-colors" className="text-sm text-gray-700">
                    Match Head to Body Color
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="face" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Mouth Type</h3>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                      {mouthType}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {MOUTH_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={mouthType === type ? "default" : "outline"}
                        className={`capitalize ${
                          mouthType === type
                            ? "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 border border-orange-200"
                            : "border border-gray-200 text-gray-700 hover:bg-orange-50"
                        }`}
                        onClick={() => setMouthType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Eye Size</h3>
                    <span className="text-sm text-gray-500">{Math.round(eyeSize * 100)}%</span>
                  </div>
                  <Slider
                    value={[eyeSize]}
                    min={0.5}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => setEyeSize(value[0])}
                    className="py-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Eye Distance</h3>
                    <span className="text-sm text-gray-500">{Math.round(eyeDistance * 100)}%</span>
                  </div>
                  <Slider
                    value={[eyeDistance]}
                    min={0.3}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => setEyeDistance(value[0])}
                    className="py-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Mouth Size</h3>
                    <span className="text-sm text-gray-500">{Math.round(mouthSize * 100)}%</span>
                  </div>
                  <Slider
                    value={[mouthSize]}
                    min={0.4}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => setMouthSize(value[0])}
                    className="py-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Blush Intensity</h3>
                    <span className="text-sm text-gray-500">{Math.round(blushIntensity * 100)}%</span>
                  </div>
                  <Slider
                    value={[blushIntensity]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => setBlushIntensity(value[0])}
                    className="py-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="eyebrows" checked={hasEyebrows} onCheckedChange={setHasEyebrows} />
                  <Label htmlFor="eyebrows" className="text-sm text-gray-700">
                    Add Eyebrows
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="freckles" checked={hasFreckles} onCheckedChange={setHasFreckles} />
                  <Label htmlFor="freckles" className="text-sm text-gray-700">
                    Add Freckles
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extras" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Background Color</h3>
                  <ColorPicker
                    colors={[...COLORS, "#FFFFFF", "#E0F7FF", "#E8FDE0", "#FFF9E0", "#FFF9E0", "#F5E0FF"]}
                    selectedColor={backgroundColor}
                    onSelectColor={setBackgroundColor}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="stars" checked={showStars} onCheckedChange={setShowStars} />
                  <Label htmlFor="stars" className="text-sm text-gray-700">
                    Show Stars Background
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="sparkles" checked={hasSparkles} onCheckedChange={setHasSparkles} />
                  <Label htmlFor="sparkles" className="text-sm text-gray-700">
                    Add Sparkle Effects
                  </Label>
                </div>

                <Separator className="bg-gray-100" />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Quick Styles</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700"
                      onClick={makeExtraCute}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Super Cute
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-200 hover:bg-orange-50 text-gray-700"
                      onClick={() => {
                        setHeadType("cat")
                        setMouthType("cat")
                        setAccessoryType("bow")
                        setArmType("round")
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Kitty Style
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-200 hover:bg-orange-50 text-gray-700"
                      onClick={() => {
                        setHeadType("bunny")
                        setMouthType("shy")
                        setAccessoryType("flower")
                        setArmType("stubby")
                      }}
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Bunny Style
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-200 hover:bg-orange-50 text-gray-700"
                      onClick={() => {
                        setBodyType("square")
                        setHeadType("fox")
                        setMouthType("open")
                        setAccessoryType("crown")
                        setArmType("stick")
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Fox Style
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 border border-orange-200"
                      onClick={captureImage}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Save as PNG
                    </Button>
                    <Button
                      className="bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700 border border-orange-200"
                      onClick={captureGIF}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Save as GIF
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

