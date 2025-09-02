"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGameStore } from "@/lib/game-state"
import { getMissionById } from "@/lib/missions-data"
import { Gift, TrendingUp, Award } from "lucide-react"

export function MissionRewardsDisplay() {
  const { playerMissions } = useGameStore()

  const completedMissions = playerMissions.filter((pm) => pm.completedAt)

  const totalRewards = completedMissions.reduce(
    (acc, pm) => {
      const mission = getMissionById(pm.missionId)
      if (mission?.reward.resources) {
        Object.entries(mission.reward.resources).forEach(([key, value]) => {
          if (value && value > 0) {
            acc.resources[key as keyof typeof acc.resources] =
              (acc.resources[key as keyof typeof acc.resources] || 0) + value
          }
        })
      }
      if (mission?.reward.indices) {
        Object.entries(mission.reward.indices).forEach(([key, value]) => {
          if (value && value > 0) {
            acc.indices[key as keyof typeof acc.indices] = (acc.indices[key as keyof typeof acc.indices] || 0) + value
          }
        })
      }
      if (mission?.reward.special) {
        acc.special.push(mission.reward.special)
      }
      return acc
    },
    {
      resources: {} as Record<string, number>,
      indices: {} as Record<string, number>,
      special: [] as string[],
    },
  )

  const resourceNames: Record<string, string> = {
    materials: "Materiales",
    energy: "Energía",
    data: "Datos",
    talent: "Talento",
    civicCredit: "Crédito Cívico",
  }

  const indexNames: Record<string, string> = {
    welfare: "Bienestar",
    sustainability: "Sostenibilidad",
    legitimacy: "Legitimidad",
  }

  if (completedMissions.length === 0) {
    return (
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Gift className="w-4 h-4 text-cyan-400" />
            Recompensas de Misiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-400 text-sm">Completa misiones para obtener recompensas</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Gift className="w-4 h-4 text-cyan-400" />
          Recompensas Obtenidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resource Rewards */}
        {Object.keys(totalRewards.resources).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <TrendingUp className="w-3 h-3" />
              Recursos Ganados
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(totalRewards.resources).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{resourceNames[key] || key}</span>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    +{value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Index Rewards */}
        {Object.keys(totalRewards.indices).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <TrendingUp className="w-3 h-3" />
              Índices Mejorados
            </div>
            <div className="space-y-1">
              {Object.entries(totalRewards.indices).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{indexNames[key] || key}</span>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                    +{value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Rewards */}
        {totalRewards.special.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Award className="w-3 h-3" />
              Recompensas Especiales
            </div>
            <div className="space-y-1">
              {totalRewards.special.map((special, index) => (
                <div key={index} className="text-xs text-purple-400 bg-purple-500/10 rounded px-2 py-1">
                  {special}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Misiones Completadas</span>
            <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-xs">
              {completedMissions.length}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
