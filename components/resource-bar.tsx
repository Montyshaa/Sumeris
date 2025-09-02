"use client"

import { useEffect } from "react"
import { useGameStore } from "@/lib/game-state"
import { Hammer, Zap, Database, Users, Shield, Heart, Leaf, Scale } from "lucide-react"

export function ResourceBar() {
  const { resources, indices, calculateProduction } = useGameStore()

  useEffect(() => {
    // Calculate production immediately on mount
    calculateProduction()

    const TIME_ACCELERATION = 20 // Must match the value in game-state.ts
    const baseInterval = 30000 // 30 seconds
    const acceleratedInterval = baseInterval / TIME_ACCELERATION // 1.5 seconds for 20x speed

    // Set up interval for regular production updates
    const interval = setInterval(() => {
      calculateProduction()
    }, acceleratedInterval)

    // Also calculate when the component becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        calculateProduction()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [calculateProduction])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return Math.floor(num).toString()
  }

  const getIndexColor = (value: number): string => {
    if (value >= 80) return "text-green-400"
    if (value >= 60) return "text-yellow-400"
    if (value >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getIndexBgColor = (value: number): string => {
    if (value >= 80) return "bg-green-400/10"
    if (value >= 60) return "bg-yellow-400/10"
    if (value >= 40) return "bg-orange-400/10"
    return "bg-red-400/10"
  }

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Recursos */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-amber-400/10 rounded flex items-center justify-center">
                <Hammer className="w-3 h-3 text-amber-400" />
              </div>
              <span className="text-slate-300">MAT:</span>
              <span className="text-white font-mono">{formatNumber(resources.materials)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-yellow-400/10 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-yellow-400" />
              </div>
              <span className="text-slate-300">ENG:</span>
              <span className="text-white font-mono">{formatNumber(resources.energy)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-cyan-400/10 rounded flex items-center justify-center">
                <Database className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="text-slate-300">DAT:</span>
              <span className="text-white font-mono">{formatNumber(resources.data)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-purple-400/10 rounded flex items-center justify-center">
                <Users className="w-3 h-3 text-purple-400" />
              </div>
              <span className="text-slate-300">HR:</span>
              <span className="text-white font-mono">{resources.talent.toFixed(1)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-teal-400/10 rounded flex items-center justify-center">
                <Shield className="w-3 h-3 text-teal-400" />
              </div>
              <span className="text-slate-300">CC:</span>
              <span className="text-white font-mono">{formatNumber(resources.civicCredit)}</span>
            </div>
          </div>

          {/* Índices */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${getIndexBgColor(indices.welfare)}`}>
                <Heart className={`w-3 h-3 ${getIndexColor(indices.welfare)}`} />
              </div>
              <span className="text-slate-300">WB:</span>
              <span className={`font-mono ${getIndexColor(indices.welfare)}`}>{Math.floor(indices.welfare)}</span>
            </div>

            <div className="flex items-center gap-1 text-sm">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${getIndexBgColor(indices.sustainability)}`}
              >
                <Leaf className={`w-3 h-3 ${getIndexColor(indices.sustainability)}`} />
              </div>
              <span className="text-slate-300">SUS:</span>
              <span className={`font-mono ${getIndexColor(indices.sustainability)}`}>
                {Math.floor(indices.sustainability)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${getIndexBgColor(indices.legitimacy)}`}
              >
                <Scale className={`w-3 h-3 ${getIndexColor(indices.legitimacy)}`} />
              </div>
              <span className="text-slate-300">LEG:</span>
              <span className={`font-mono ${getIndexColor(indices.legitimacy)}`}>{Math.floor(indices.legitimacy)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
