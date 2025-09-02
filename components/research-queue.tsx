"use client"

import { useGameStore } from "@/lib/game-state"
import { getResearchById } from "@/lib/research-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Clock, Beaker } from "lucide-react"
import { useEffect, useState } from "react"

export function ResearchQueue() {
  const { researchQueue, cancelResearch } = useGameStore()
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const TIME_ACCELERATION = 20 // Must match the value in game-state.ts
    const baseInterval = 1000 // 1 second
    const acceleratedInterval = baseInterval / TIME_ACCELERATION // 50ms for 20x speed

    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, acceleratedInterval)

    return () => clearInterval(interval)
  }, [])

  if (researchQueue.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Cola de Investigación (0/1)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">No hay investigaciones en progreso</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Cola de Investigación ({researchQueue.length}/1)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {researchQueue.map((queue) => {
          const research = getResearchById(queue.researchId)
          if (!research) return null

          const progress = Math.min(100, ((currentTime - queue.startTime) / (queue.finishTime - queue.startTime)) * 100)
          const timeRemaining = Math.max(0, queue.finishTime - currentTime)
          const minutes = Math.floor(timeRemaining / (1000 * 60))
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

          return (
            <div key={queue.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{research.icon}</span>
                  <div>
                    <h4 className="text-white font-medium">{research.name}</h4>
                    <p className="text-slate-400 text-sm">{research.tree}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {minutes}m {seconds}s
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelResearch(queue.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-right text-xs text-slate-400 mt-1">{progress.toFixed(1)}%</div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
