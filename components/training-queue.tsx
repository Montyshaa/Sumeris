"use client"
import { useGameStore } from "@/lib/game-state"
import { UNIT_TYPES } from "@/lib/units-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Clock, Users } from "lucide-react"

export function TrainingQueue() {
  const { trainingQueues, cancelTraining, getAvailableTrainingSlots } = useGameStore()

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getProgress = (queue: any) => {
    const now = Date.now()
    const total = queue.finishTime - queue.startTime
    const elapsed = now - queue.startTime
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const getTimeRemaining = (queue: any) => {
    const now = Date.now()
    return Math.max(0, queue.finishTime - now)
  }

  const maxSlots = getAvailableTrainingSlots() + trainingQueues.length
  const usedSlots = trainingQueues.length

  if (trainingQueues.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Colas de Entrenamiento ({usedSlots}/{maxSlots})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">No hay entrenamientos activos</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Colas de Entrenamiento ({usedSlots}/{maxSlots})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trainingQueues.map((queue) => {
          const unitType = UNIT_TYPES[queue.unitTypeId]
          if (!unitType) return null

          const progress = getProgress(queue)
          const timeRemaining = getTimeRemaining(queue)

          return (
            <div key={queue.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{unitType.icon}</span>
                  <div>
                    <h4 className="text-white font-medium">
                      {queue.quantity}x {unitType.name}
                    </h4>
                    <p className="text-slate-400 text-sm">{unitType.description.slice(0, 50)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelTraining(queue.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{progress.toFixed(1)}%</span>
                  <span>Completado</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
