"use client"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  colors: string[]
  selectedColor: string
  onSelectColor: (color: string) => void
}

export default function ColorPicker({ colors, selectedColor, onSelectColor }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((color) => (
        <button
          key={color}
          className={cn(
            "w-full h-10 rounded-md transition-all flex items-center justify-center",
            selectedColor === color ? "ring-2 ring-offset-2 ring-black" : "",
          )}
          style={{ backgroundColor: color }}
          onClick={() => onSelectColor(color)}
          aria-label={`Select color ${color}`}
        >
          {selectedColor === color && <Check className="h-4 w-4 text-white drop-shadow-md" />}
        </button>
      ))}
    </div>
  )
}

