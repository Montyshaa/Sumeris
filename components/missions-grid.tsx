"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useGameStore } from "@/lib/game-state"
import { getMissionsByDay } from "@/lib/missions-data"
import { CheckCircle, Clock, Target, Gift } from "lucide-react"

export function MissionsGrid() {
  const {
    tutorialDay,
    playerMissions,
    getMissionProgress,
    isMissionCompleted,
    isMissionAvailable,
    initializeMissions,
  } = useGameStore()

  // Initialize missions if not already done
  if (playerMissions.length === 0) {
    initializeMissions()
  }

  const currentDayMissions = getMissionsByDay(tutorialDay)

  const formatReward = (reward: any) => {
    const parts = []
    if (reward.resources) {
      Object.entries(reward.resources).forEach(([key, value]) => {
        if (value && value > 0) {
          const resourceNames: { [key: string]: string } = {
            materials: "MAT",
            energy: "ENG",
            data: "DAT",
            talent: "HR",
            civicCredit: "CC",
          }
          parts.push(`+${value} ${resourceNames[key] || key}`)
        }
      })
    }
    if (reward.indices) {
      Object.entries(reward.indices).forEach(([key, value]) => {
        if (value && value > 0) {
          const indexNames: { [key: string]: string } = {
            welfare: "WB",
            sustainability: "SUS",
            legitimacy: "LEG",
          }
          parts.push(`+${value} ${indexNames[key] || key}`)
        }
      })
    }
    if (reward.special) {
      parts.push(reward.special)
    }
    return parts.join(", ")
  }

  const getMissionIcon = (type: string) => {
    switch (type) {
      case "build":
        return "🏗️"
      case "produce":
        return "📦"
      case "research":
        return "🔬"
      case "policy":
        return "📋"
      case "maintain":
        return "⚖️"
      case "explore":
        return "🗺️"
      default:
        return "🎯"
    }
  }

  return (
    <div className="space-y-6">
      {/* Tutorial Day Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Día {tutorialDay} - Tutorial</h2>
          <p className="text-slate-400 text-sm">Completa estas misiones para avanzar en el tutorial</p>
        </div>
        <Badge variant="outline" className="border-cyan-400 text-cyan-400">
          {currentDayMissions.filter((m) => isMissionCompleted(m.id)).length} / {currentDayMissions.length} Completadas
        </Badge>
      </div>

      {/* Missions Grid */}
      <div className="grid gap-4">
        {currentDayMissions.map((mission) => {
          const progress = getMissionProgress(mission.id)
          const completed = isMissionCompleted(mission.id)
          const available = isMissionAvailable(mission.id)

          return (
            <Card
              key={mission.id}
              className={`bg-slate-800/50 border-slate-700 transition-all ${
                completed
                  ? "border-green-500/50 bg-green-500/5"
                  : available
                    ? "border-slate-600 hover:border-slate-500"
                    : "border-slate-700/50 opacity-60"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getMissionIcon(mission.type)}</div>
                    <div>
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        {mission.name}
                        {completed && <CheckCircle className="w-4 h-4 text-green-400" />}
                      </CardTitle>
                      <p className="text-slate-400 text-sm mt-1">{mission.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      completed ? "border-green-500 text-green-400" : "border-slate-600 text-slate-400"
                    }`}
                  >
                    {mission.type.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Progreso
                      </span>
                      <span className="text-white font-mono">{Math.round(progress * 100)}%</span>
                    </div>
                    <Progress value={progress * 100} className="h-2 bg-slate-700" />
                  </div>

                  {/* Objective Details */}
                  <div className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Objetivo:</span>
                      <span className="text-white">
                        {mission.objective.target
                          ? `${mission.objective.target} → ${mission.objective.value}`
                          : mission.objective.value}
                      </span>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      Recompensa:
                    </span>
                    <span className="text-cyan-400 font-medium">{formatReward(mission.reward)}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-xs">
                      {completed ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Completada
                        </div>
                      ) : available ? (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Clock className="w-3 h-3" />
                          En progreso
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          Bloqueada
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      Orden: {mission.order}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tutorial Progress */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Progreso del Tutorial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[1, 2, 3].map((day) => {
              const dayMissions = getMissionsByDay(day)
              const completedCount = dayMissions.filter((m) => isMissionCompleted(m.id)).length
              const isCurrentDay = day === tutorialDay
              const isCompleted = completedCount === dayMissions.length

              return (
                <div key={day} className="space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-medium ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrentDay
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="text-xs">
                    <div className={`font-medium ${isCurrentDay ? "text-cyan-400" : "text-slate-400"}`}>Día {day}</div>
                    <div className="text-slate-500">
                      {completedCount}/{dayMissions.length}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
