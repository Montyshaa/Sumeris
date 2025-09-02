"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGameStore } from "@/lib/game-state"
import { getPolicyById } from "@/lib/policies-data"
import { Shield, TrendingUp, TrendingDown, Zap } from "lucide-react"

export function ActivePolicyEffects() {
  const {
    activePolicies,
    getPolicyEffectiveIndices,
    getPolicyEffectiveProductionRates,
    getEffectiveIndices,
    getTotalProductionRates,
  } = useGameStore()

  if (activePolicies.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-cyan-400" />
            Efectos de Políticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-400 text-sm">No hay efectos de políticas activos</div>
        </CardContent>
      </Card>
    )
  }

  // Calculate the difference between base and policy-affected values
  const baseIndices = getEffectiveIndices()
  const policyIndices = getPolicyEffectiveIndices()
  const baseRates = getTotalProductionRates()
  const policyRates = getPolicyEffectiveProductionRates()

  const indexDifferences = {
    welfare: policyIndices.welfare - baseIndices.welfare,
    sustainability: policyIndices.sustainability - baseIndices.sustainability,
    legitimacy: policyIndices.legitimacy - baseIndices.legitimacy,
  }

  const rateDifferences = {
    materials: (policyRates.materials / baseRates.materials - 1) * 100,
    energy: (policyRates.energy / baseRates.energy - 1) * 100,
    data: (policyRates.data / baseRates.data - 1) * 100,
    talent: (policyRates.talent / baseRates.talent - 1) * 100,
    civicCredit: (policyRates.civicCredit / baseRates.civicCredit - 1) * 100,
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-cyan-400" />
          Efectos de Políticas Activos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Index Effects */}
        <div className="space-y-2">
          <h4 className="text-slate-300 text-xs font-medium">Efectos en Índices</h4>
          <div className="space-y-1">
            {Object.entries(indexDifferences).map(([index, diff]) => {
              if (Math.abs(diff) < 0.1) return null

              const isPositive = diff > 0
              const indexName =
                index === "welfare" ? "Bienestar" : index === "sustainability" ? "Sostenibilidad" : "Legitimidad"

              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{indexName}</span>
                  <Badge
                    variant="outline"
                    className={`${isPositive ? "border-green-400 text-green-400" : "border-red-400 text-red-400"} text-xs`}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {isPositive ? "+" : ""}
                    {Math.round(diff)}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Production Effects */}
        <div className="space-y-2">
          <h4 className="text-slate-300 text-xs font-medium">Efectos en Producción</h4>
          <div className="space-y-1">
            {Object.entries(rateDifferences).map(([resource, diff]) => {
              if (Math.abs(diff) < 0.1) return null

              const isPositive = diff > 0
              const resourceName =
                resource === "materials"
                  ? "MAT"
                  : resource === "energy"
                    ? "ENG"
                    : resource === "data"
                      ? "DAT"
                      : resource === "talent"
                        ? "HR"
                        : "CC"

              return (
                <div key={resource} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{resourceName}</span>
                  <Badge
                    variant="outline"
                    className={`${isPositive ? "border-green-400 text-green-400" : "border-red-400 text-red-400"} text-xs`}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {isPositive ? "+" : ""}
                    {Math.round(diff)}%
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Policy List */}
        <div className="space-y-2">
          <h4 className="text-slate-300 text-xs font-medium">Políticas Contribuyendo</h4>
          <div className="space-y-1">
            {activePolicies.map((activePolicy) => {
              const policy = getPolicyById(activePolicy.policyId)
              if (!policy) return null

              return (
                <div key={activePolicy.policyId} className="flex items-center gap-2 text-xs">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-300">{policy.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
