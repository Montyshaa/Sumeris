"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/game-state"
import { POLICIES } from "@/lib/policies-data"
import { Lightbulb } from "lucide-react"
import { useMemo } from "react"

export function PolicyRecommendations() {
  const { resources, indices, activePolicies, canActivatePolicy, activatePolicy, getBuildingLevel } = useGameStore()

  const recommendations = useMemo(() => {
    const hqLevel = getBuildingLevel("hq")
    if (hqLevel < 3) return []

    const activeIds = activePolicies.map((ap) => ap.policyId)
    const availablePolicies = POLICIES.filter((policy) => !activeIds.includes(policy.id))

    // Score policies based on current situation
    const scoredPolicies = availablePolicies.map((policy) => {
      let score = 0
      const reasons: string[] = []

      // Check if indices are low and policy can help
      if (
        indices.welfare < 50 &&
        policy.effects.some((e) => e.type === "index_modifier" && e.target === "welfare" && e.value > 0)
      ) {
        score += 3
        reasons.push("Bienestar bajo")
      }

      if (
        indices.sustainability < 50 &&
        policy.effects.some((e) => e.type === "index_modifier" && e.target === "sustainability" && e.value > 0)
      ) {
        score += 3
        reasons.push("Sostenibilidad baja")
      }

      if (
        indices.legitimacy < 50 &&
        policy.effects.some((e) => e.type === "index_modifier" && e.target === "legitimacy" && e.value > 0)
      ) {
        score += 3
        reasons.push("Legitimidad baja")
      }

      // Check if we have excess CC
      if (resources.civicCredit > policy.cost * 2) {
        score += 1
        reasons.push("CC abundante")
      }

      // Prefer policies we can afford
      if (resources.civicCredit >= policy.cost) {
        score += 2
      } else {
        score -= 2
        reasons.push("CC insuficiente")
      }

      // Prefer permanent policies for stability
      if (policy.duration === 0) {
        score += 1
        reasons.push("Efecto permanente")
      }

      return {
        policy,
        score,
        reasons,
      }
    })

    // Sort by score and return top 3
    return scoredPolicies
      .filter((sp) => sp.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [resources, indices, activePolicies, getBuildingLevel])

  if (recommendations.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-400 text-sm">No hay recomendaciones disponibles</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Políticas Recomendadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map(({ policy, reasons }) => {
          const canActivate = canActivatePolicy(policy.id)
          const canAfford = resources.civicCredit >= policy.cost

          return (
            <div key={policy.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white text-sm font-medium">{policy.name}</h4>
                  <p className="text-slate-400 text-xs mt-1">{policy.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${canAfford ? "border-cyan-400 text-cyan-400" : "border-red-400 text-red-400"}`}
                >
                  {policy.cost} CC
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {reasons.map((reason, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-yellow-400/50 text-yellow-400">
                    {reason}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {policy.duration === 0 ? <span>Permanente</span> : <span>{policy.duration}min</span>}
                  <span>•</span>
                  <span>Recarga: {policy.cooldown}min</span>
                </div>

                <Button
                  size="sm"
                  onClick={() => activatePolicy(policy.id)}
                  disabled={!canActivate}
                  className="bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30 text-xs px-2 py-1 h-auto"
                >
                  Activar
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
