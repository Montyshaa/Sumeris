"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGameStore } from "@/lib/game-state"
import { POLICIES } from "@/lib/policies-data"
import { Shield, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { useMemo } from "react"

export function PolicyManagementOverview() {
  const { activePolicies, resources, getBuildingLevel } = useGameStore()

  const stats = useMemo(() => {
    const now = Date.now()
    const hqLevel = getBuildingLevel("hq")
    const isUnlocked = hqLevel >= 3

    // Calculate policy statistics
    const totalPolicies = POLICIES.length
    const activePolicyCount = activePolicies.length
    const maxActivePolicies = 3

    // Find policies expiring soon (within 30 minutes)
    const expiringSoon = activePolicies.filter((ap) => {
      if (!ap.expiresAt) return false
      const timeLeft = ap.expiresAt - now
      return timeLeft > 0 && timeLeft <= 30 * 60 * 1000
    })

    // Calculate policies on cooldown
    const onCooldown = POLICIES.filter((policy) => {
      const activePolicy = activePolicies.find((ap) => ap.policyId === policy.id)
      if (!activePolicy?.lastDeactivated) return false

      const cooldownEndTime = activePolicy.lastDeactivated + policy.cooldown * 60 * 1000
      return now < cooldownEndTime
    })

    // Calculate affordable policies
    const affordable = POLICIES.filter((policy) => resources.civicCredit >= policy.cost)

    return {
      totalPolicies,
      activePolicyCount,
      maxActivePolicies,
      expiringSoon: expiringSoon.length,
      onCooldown: onCooldown.length,
      affordable: affordable.length,
      isUnlocked,
      hqLevel,
    }
  }, [activePolicies, resources.civicCredit, getBuildingLevel])

  const getUsagePercentage = () => {
    return (stats.activePolicyCount / stats.maxActivePolicies) * 100
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 100) return "text-red-400"
    if (percentage >= 66) return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-cyan-400" />
          Gestión de Políticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stats.isUnlocked ? (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Requiere Nexo Cívico nivel 3</p>
            <p className="text-slate-500 text-xs">Nivel actual: {stats.hqLevel}</p>
          </div>
        ) : (
          <>
            {/* Policy Slots Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Slots de Políticas</span>
                <span className={`font-mono ${getUsageColor()}`}>
                  {stats.activePolicyCount}/{stats.maxActivePolicies}
                </span>
              </div>
              <Progress value={getUsagePercentage()} className="h-2 bg-slate-700" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-slate-400">Expiran Pronto</span>
                </div>
                <div className="text-lg font-mono text-white">{stats.expiringSoon}</div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-slate-400">En Recarga</span>
                </div>
                <div className="text-lg font-mono text-white">{stats.onCooldown}</div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-slate-400">Disponibles</span>
                </div>
                <div className="text-lg font-mono text-white">{stats.affordable}</div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-slate-400">Total</span>
                </div>
                <div className="text-lg font-mono text-white">{stats.totalPolicies}</div>
              </div>
            </div>

            {/* Warnings */}
            {stats.expiringSoon > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Atención</span>
                </div>
                <p className="text-orange-300 text-xs">
                  {stats.expiringSoon} política{stats.expiringSoon !== 1 ? "s" : ""} expira
                  {stats.expiringSoon === 1 ? "" : "n"} pronto
                </p>
              </div>
            )}

            {stats.activePolicyCount === stats.maxActivePolicies && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Slots Llenos</span>
                </div>
                <p className="text-red-300 text-xs">Desactiva una política para activar otra</p>
              </div>
            )}

            {/* Current CC Balance */}
            <div className="border-t border-slate-700 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Crédito Cívico</span>
                <span className="text-cyan-400 font-mono">{Math.floor(resources.civicCredit)} CC</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
