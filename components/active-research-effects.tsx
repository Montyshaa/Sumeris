"use client"

import type React from "react"

import { useGameStore } from "@/lib/game-state"
import { getResearchById } from "@/lib/research-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Shield, Wrench } from "lucide-react"

export function ActiveResearchEffects() {
  const { getCompletedResearchIds } = useGameStore()
  const completedIds = getCompletedResearchIds()

  if (completedIds.length === 0) {
    return null
  }

  const activeEffects: Array<{
    name: string
    effect: string
    type: string
    icon: React.ReactNode
  }> = []

  completedIds.forEach((researchId) => {
    const research = getResearchById(researchId)
    if (research) {
      research.effects.forEach((effect) => {
        let icon = <Zap key="zap-icon" className="h-3 w-3" />
        let type = "Bonus"

        switch (effect.type) {
          case "resource_production":
            icon = <TrendingUp key="trending-up-icon" className="h-3 w-3" />
            type = "Producción"
            break
          case "index_bonus":
            icon = <Shield key="shield-icon" className="h-3 w-3" />
            type = "Índice"
            break
          case "cost_reduction":
            icon = <Wrench key="wrench-icon" className="h-3 w-3" />
            type = "Reducción"
            break
          case "unlock_feature":
            icon = <Zap key="zap-icon" className="h-3 w-3" />
            type = "Desbloqueo"
            break
        }

        activeEffects.push({
          name: research.name,
          effect: effect.description,
          type,
          icon,
        })
      })
    }
  })

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Efectos de Investigación Activos ({activeEffects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activeEffects.map((effect, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {effect.icon}
                <span className="text-slate-300 truncate">{effect.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                  {effect.type}
                </Badge>
                <span className="text-cyan-400 text-xs">{effect.effect}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
