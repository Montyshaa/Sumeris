"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Pause } from "lucide-react"
import { useGameStore } from "@/lib/game-state"

export function TimeControl() {
  const { timeMultiplier, setTimeMultiplier } = useGameStore()
  const [inputValue, setInputValue] = useState(timeMultiplier.toString())
  const [isActive, setIsActive] = useState(timeMultiplier > 1)

  const handleApply = () => {
    const value = Number.parseFloat(inputValue)
    if (value > 0 && value <= 100) {
      setTimeMultiplier(value)
      setIsActive(value > 1)
    }
  }

  const handleToggle = () => {
    if (isActive) {
      setTimeMultiplier(1)
      setIsActive(false)
    } else {
      const value = Number.parseFloat(inputValue)
      if (value > 1) {
        setTimeMultiplier(value)
        setIsActive(true)
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-cyan-400" />
      <Input
        type="number"
        min="1"
        max="100"
        step="0.1"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-16 h-8 text-xs bg-slate-700 border-slate-600 text-white"
        placeholder="1x"
      />
      <Button
        size="sm"
        variant="outline"
        onClick={handleApply}
        className="h-8 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
      >
        Aplicar
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleToggle}
        className={`h-8 px-2 text-xs border-slate-600 hover:bg-slate-700 ${
          isActive ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" : "bg-transparent text-slate-300"
        }`}
      >
        {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      </Button>
      <Badge
        variant="outline"
        className={`text-xs ${
          timeMultiplier > 1 ? "border-cyan-400 text-cyan-400" : "border-slate-600 text-slate-400"
        }`}
      >
        {timeMultiplier}x
      </Badge>
    </div>
  )
}
