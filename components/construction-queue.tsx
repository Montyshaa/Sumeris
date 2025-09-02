"use client"

import { useGameStore } from "@/lib/game-state"
import { BUILDING_TYPES } from "@/lib/buildings-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Clock, Hammer } from "lucide-react"
import { useEffect, useState } from "react"

export function ConstructionQueue() {
  const { constructionQueues, cancelConstruction, getAvailableConstructionSlots } = useGameStore()
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update current time every second for progress bars
  useEffect(() => {
    const TIME_ACCELERATION = 20 // Must match the value in game-state.ts
    const baseInterval = 1000 // 1 second
    const acceleratedInterval = baseInterval / TIME_ACCELERATION // 50ms for 20x speed

    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, acceleratedInterval)

    return () => clearInterval(interval)
  }, [])

  const formatTimeRemaining = (finishTime: number) => {
    const remaining = Math.max(0, finishTime - currentTime)
    const minutes = Math.floor(remaining / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    if (minutes > 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }

    return `${minutes}m ${seconds}s`
  }

  const getProgress = (startTime: number, finishTime: number) => {
    const total = finishTime - startTime
    const elapsed = currentTime - startTime
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const availableSlots = getAvailableConstructionSlots()
  const maxSlots = availableSlots + constructionQueues.length

  if (constructionQueues.length === 0 && maxSlots === 1) {
    return null // Don't show empty queue if only 1 slot available
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Hammer className="w-5 h-5" />
          Colas de Construcción ({constructionQueues.length}/{maxSlots})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {constructionQueues.map((queue) => {
          const buildingType = BUILDING_TYPES[queue.buildingId]
          const progress = getProgress(queue.startTime, queue.finishTime)
          const isCompleted = currentTime >= queue.finishTime

          return (
            <div
              key={queue.id}
              className={`p-3 rounded-lg border ${
                isCompleted ? "bg-green-900/20 border-green-500/30" : "bg-slate-800/50 border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{buildingType.icon}</span>
                  <div>
                    <div className="font-medium text-slate-200">{buildingType.name}</div>
                    <div className="text-sm text-slate-400">Nivel {queue.targetLevel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <div className="text-green-400 font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ¡Completado!
                    </div>
                  ) : (
                    <>
                      <div className="text-slate-300 text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeRemaining(queue.finishTime)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelConstruction(queue.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {!isCompleted && (
                <div className="space-y-1">
                  <Progress value={progress} className="h-2 bg-slate-700" />
                  <div className="text-xs text-slate-400 text-right">{progress.toFixed(1)}%</div>
                </div>
              )}
            </div>
          )
        })}

        {availableSlots > 0 && (
          <div className="p-3 rounded-lg border-2 border-dashed border-slate-600 text-center">
            <div className="text-slate-400 text-sm">
              {availableSlots} {availableSlots === 1 ? "cola disponible" : "colas disponibles"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
