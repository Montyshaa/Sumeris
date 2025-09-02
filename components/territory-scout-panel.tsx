"use client"

import { useState } from "react"
import { useGameStore } from "@/lib/game-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Target, Shield, Coins } from "lucide-react"
import type { ScoutReport } from "@/lib/types"

interface TerritoryScoutPanelProps {
  territoryId: string
  onClose: () => void
}

export function TerritoryScoutPanel({ territoryId, onClose }: TerritoryScoutPanelProps) {
  const [scoutReport, setScoutReport] = useState<ScoutReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    scoutTerritory,
    getTerritoryInfo,
    getExplorationCost,
    canAffordExploration,
    getExplorationRewards,
    exploreTerritory,
    controlTerritory,
    mapState,
    resources,
  } = useGameStore()

  const territory = getTerritoryInfo(territoryId)
  const explorationCost = getExplorationCost(territoryId)
  const explorationRewards = getExplorationRewards(territoryId)
  const canAfford = canAffordExploration(territoryId)
  const isExplored = mapState.exploredTerritories.includes(territoryId)
  const isControlled = mapState.playerTerritories.includes(territoryId)

  const handleScout = async () => {
    setIsLoading(true)
    // Simulate scouting delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const report = scoutTerritory(territoryId)
    setScoutReport(report)
    setIsLoading(false)
  }

  const handleExplore = () => {
    const success = exploreTerritory(territoryId)
    if (success) {
      onClose()
    }
  }

  const handleControl = () => {
    const success = controlTerritory(territoryId)
    if (success) {
      onClose()
    }
  }

  if (!territory) return null

  return (
    <Card className="w-96 bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Target className="w-5 h-5" />
          {territory.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Territory Basic Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Tipo de Bonificación:</span>
            <Badge variant="outline" className="border-cyan-500 text-cyan-400">
              {territory.bonusType} +{territory.bonusValue}%
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Nivel de Defensa:</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm">
                {territory.defenseLevel === 1 ? "Fácil" : territory.defenseLevel === 2 ? "Medio" : "Difícil"}
              </span>
            </div>
          </div>
        </div>

        {/* Scout Section */}
        {!isExplored && (
          <div className="space-y-3 border-t border-slate-600 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Reconocimiento</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleScout}
                disabled={isLoading}
                className="border-slate-600 hover:bg-slate-700 bg-transparent"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {isLoading ? "Explorando..." : "Scout"}
              </Button>
            </div>

            {scoutReport && (
              <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
                <div className="text-xs text-slate-400">Informe de Reconocimiento:</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Poder Estimado:</span>
                    <span className="text-white">{Math.floor(scoutReport.estimatedPower)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Defensas:</span>
                    <span className="text-white">{scoutReport.defenseInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recursos Estimados:</span>
                    <span className="text-white">{Math.floor(scoutReport.resources.materials || 0)} MAT</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exploration Section */}
        {!isExplored && (
          <div className="space-y-3 border-t border-slate-600 pt-4">
            <div className="text-sm font-medium text-slate-300">Exploración</div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400">Coste de Exploración:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">MAT:</span>
                  <span className={resources.materials >= explorationCost.materials ? "text-white" : "text-red-400"}>
                    {explorationCost.materials}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ENG:</span>
                  <span className={resources.energy >= explorationCost.energy ? "text-white" : "text-red-400"}>
                    {explorationCost.energy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DAT:</span>
                  <span className={resources.data >= explorationCost.data ? "text-white" : "text-red-400"}>
                    {explorationCost.data}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CC:</span>
                  <span
                    className={resources.civicCredit >= explorationCost.civicCredit ? "text-white" : "text-red-400"}
                  >
                    {explorationCost.civicCredit}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400">Recompensas Esperadas:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">MAT:</span>
                  <span className="text-green-400">+{Math.floor(explorationRewards.materials)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ENG:</span>
                  <span className="text-green-400">+{Math.floor(explorationRewards.energy)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DAT:</span>
                  <span className="text-green-400">+{Math.floor(explorationRewards.data)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CC:</span>
                  <span className="text-green-400">+{Math.floor(explorationRewards.civicCredit)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleExplore}
              disabled={!canAfford}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600"
            >
              {canAfford ? "Explorar Territorio" : "Recursos Insuficientes"}
            </Button>
          </div>
        )}

        {/* Control Section */}
        {isExplored && !isControlled && (
          <div className="space-y-3 border-t border-slate-600 pt-4">
            <div className="text-sm font-medium text-slate-300">Control</div>
            <Button onClick={handleControl} className="w-full bg-amber-600 hover:bg-amber-700">
              <Coins className="w-4 h-4 mr-2" />
              Controlar Territorio
            </Button>
          </div>
        )}

        {/* Status */}
        {isControlled && (
          <div className="text-center text-green-400 font-semibold border-t border-slate-600 pt-4">
            ✓ Territorio Controlado
          </div>
        )}

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full border-slate-600 hover:bg-slate-700 bg-transparent"
        >
          Cerrar
        </Button>
      </CardContent>
    </Card>
  )
}
