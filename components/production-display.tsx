"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/game-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Zap, Building2 } from "lucide-react"
import { getProductionMultiplier } from "@/lib/types"

export function ProductionDisplay() {
  const { getTotalProductionRates, indices } = useGameStore()
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0)
  const [totalRates, setTotalRates] = useState(getTotalProductionRates())

  useEffect(() => {
    // Calculate current production multiplier
    const welfareMultiplier = getProductionMultiplier(indices.welfare)
    const susMultiplier = getProductionMultiplier(indices.sustainability)
    const legMultiplier = getProductionMultiplier(indices.legitimacy)
    const avgMultiplier = (welfareMultiplier + susMultiplier + legMultiplier) / 3

    setCurrentMultiplier(avgMultiplier)

    setTotalRates(getTotalProductionRates())
  }, [indices, getTotalProductionRates])

  const getMultiplierColor = (multiplier: number): string => {
    if (multiplier >= 1.05) return "text-green-400"
    if (multiplier >= 0.95) return "text-yellow-400"
    return "text-red-400"
  }

  const getMultiplierBadgeColor = (multiplier: number): string => {
    if (multiplier >= 1.05) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (multiplier >= 0.95) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const formatRate = (rate: number): string => {
    const effectiveRate = rate * currentMultiplier
    return effectiveRate >= 1 ? effectiveRate.toFixed(1) : effectiveRate.toFixed(2)
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-400/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <CardTitle className="text-white text-sm">Producción Total</CardTitle>
          </div>
          <Badge className={getMultiplierBadgeColor(currentMultiplier)}>
            {currentMultiplier >= 1 ? "+" : ""}
            {((currentMultiplier - 1) * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <Clock className="w-3 h-3" />
            <span>Por minuto</span>
            <Building2 className="w-3 h-3 ml-2" />
            <span>Base + Edificios</span>
            <Zap className="w-3 h-3 ml-2" />
            <span className={getMultiplierColor(currentMultiplier)}>
              Eficiencia: {(currentMultiplier * 100).toFixed(0)}%
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">MAT/min</span>
              <span className={`font-mono ${getMultiplierColor(currentMultiplier)}`}>
                +{formatRate(totalRates.materials)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ENG/min</span>
              <span className={`font-mono ${getMultiplierColor(currentMultiplier)}`}>
                +{formatRate(totalRates.energy)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">DAT/min</span>
              <span className={`font-mono ${getMultiplierColor(currentMultiplier)}`}>
                +{formatRate(totalRates.data)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">HR/min</span>
              <span className={`font-mono ${getMultiplierColor(currentMultiplier)}`}>
                +{formatRate(totalRates.talent)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">CC/min</span>
              <span className={`font-mono ${getMultiplierColor(currentMultiplier)}`}>
                +{formatRate(totalRates.civicCredit)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
