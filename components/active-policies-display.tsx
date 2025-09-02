"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/game-state"
import { getPolicyById } from "@/lib/policies-data"
import { Shield, Clock, X } from "lucide-react"
import { useEffect, useState } from "react"

export function ActivePoliciesDisplay() {
  const { activePolicies, deactivatePolicy } = useGameStore()
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({})

  const TIME_ACCELERATION = 20 // Must match the value in game-state.ts
  const baseInterval = 1000 // 1 second
  const acceleratedInterval = baseInterval / TIME_ACCELERATION // 50ms for 20x speed

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const newTimeRemaining: Record<string, number> = {}

      activePolicies.forEach((activePolicy) => {
        if (activePolicy.expiresAt) {
          const remaining = Math.max(0, activePolicy.expiresAt - now)
          newTimeRemaining[activePolicy.policyId] = remaining
        }
      })

      setTimeRemaining(newTimeRemaining)
    }, acceleratedInterval)

    return () => clearInterval(interval)
  }, [activePolicies])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (activePolicies.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-cyan-400" />
            Políticas Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-400 text-sm">No hay políticas activas</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-cyan-400" />
          Políticas Activas ({activePolicies.length}/3)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activePolicies.map((activePolicy) => {
          const policy = getPolicyById(activePolicy.policyId)
          if (!policy) return null

          const remaining = timeRemaining[activePolicy.policyId]
          const isPermanent = !activePolicy.expiresAt

          return (
            <div
              key={activePolicy.policyId}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{policy.name}</span>
                  <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                    Activa
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {isPermanent
                    ? "Permanente"
                    : remaining !== undefined
                      ? `${formatTime(remaining)} restante`
                      : "Calculando..."}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => deactivatePolicy(activePolicy.policyId)}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
