"use client"

import { useGameStore } from "@/lib/game-state"
import {
  BUILDING_TYPES,
  calculateBuildingCost,
  calculateBuildingTime,
  calculateBuildingProduction,
  getActiveLevelBenefits,
  getNextLevelBenefit,
} from "@/lib/buildings-data"
import { UNIT_TYPES } from "@/lib/units-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUp, Clock, Lock, Zap, Info, Sword } from "lucide-react"
import { useState } from "react"

export function BuildingsGrid() {
  const {
    buildings,
    startConstruction,
    canAffordBuilding,
    getBuildingLevel,
    getAvailableConstructionSlots,
    resources,
    isBuildingUnlocked,
    getBuildingUnlockRequirements,
    getUnitCount,
    getAvailableTrainingSlots,
    getTotalArmyPower,
  } = useGameStore()

  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.floor(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.floor(minutes % 60)
    return `${hours}h ${remainingMinutes}m`
  }

  const formatResources = (resources: any) => {
    const parts = []
    if (resources.materials > 0) parts.push(`${resources.materials} MAT`)
    if (resources.energy > 0) parts.push(`${resources.energy} ENG`)
    if (resources.data > 0) parts.push(`${resources.data} DAT`)
    if (resources.talent > 0) parts.push(`${resources.talent} HR`)
    if (resources.civicCredit > 0) parts.push(`${resources.civicCredit} CC`)
    return parts.join(", ")
  }

  const canUpgrade = (buildingId: string) => {
    const currentLevel = getBuildingLevel(buildingId)
    const buildingType = BUILDING_TYPES[buildingId]
    const building = buildings.find((b) => b.id === buildingId)

    if (!buildingType || currentLevel >= buildingType.maxLevel) return false
    if (building?.isUpgrading) return false
    if (getAvailableConstructionSlots() <= 0) return false

    return canAffordBuilding(buildingId, currentLevel + 1)
  }

  const handleUpgrade = (buildingId: string) => {
    const success = startConstruction(buildingId)
    if (success) {
      console.log(`[v0] Started construction for ${buildingId}`)
    }
  }

  const getAvailableUnits = (spaceportLevel: number) => {
    const availableUnits = []

    if (spaceportLevel >= 1) {
      availableUnits.push(UNIT_TYPES.drone)
    }
    if (spaceportLevel >= 4) {
      availableUnits.push(UNIT_TYPES.armored)
    }
    if (spaceportLevel >= 7) {
      availableUnits.push(UNIT_TYPES.corvette)
    }

    // Mediators are unlocked by University, not Spaceport
    const universityLevel = getBuildingLevel("university")
    if (universityLevel >= 7) {
      availableUnits.push(UNIT_TYPES.mediator)
    }

    return availableUnits
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.values(BUILDING_TYPES).map((buildingType) => {
          const currentLevel = getBuildingLevel(buildingType.id)
          const building = buildings.find((b) => b.id === buildingType.id)
          const isUpgrading = building?.isUpgrading || false
          const nextLevel = currentLevel + 1
          const upgradeCost = calculateBuildingCost(buildingType, nextLevel)
          const upgradeTime = calculateBuildingTime(buildingType, nextLevel)
          const currentProduction = calculateBuildingProduction(buildingType, currentLevel)
          const nextProduction = calculateBuildingProduction(buildingType, nextLevel)
          const canUpgradeBuilding = canUpgrade(buildingType.id)
          const isMaxLevel = currentLevel >= buildingType.maxLevel
          const isUnlocked = isBuildingUnlocked(buildingType.id)
          const unlockRequirements = getBuildingUnlockRequirements(buildingType.id)
          const isLocked = currentLevel === 0 && !isUnlocked
          const activeBenefits = getActiveLevelBenefits(buildingType, currentLevel)
          const nextBenefit = getNextLevelBenefit(buildingType, currentLevel)

          const isSpaceport = buildingType.id === "spaceport"
          const availableUnits = isSpaceport ? getAvailableUnits(currentLevel) : []
          const trainingSlots = isSpaceport ? getAvailableTrainingSlots() : 0
          const totalArmyPower = isSpaceport ? getTotalArmyPower() : 0

          return (
            <Card
              key={buildingType.id}
              className={`bg-slate-800/50 border-slate-700 transition-all duration-200 ${
                selectedBuilding === buildingType.id ? "ring-2 ring-cyan-400/50" : ""
              } ${isUpgrading ? "bg-yellow-900/20 border-yellow-500/30" : ""} ${
                isLocked ? "bg-slate-900/50 border-slate-600 opacity-75" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl ${isLocked ? "grayscale" : ""}`}>{buildingType.icon}</span>
                    <div>
                      <CardTitle className={`text-sm ${isLocked ? "text-slate-400" : "text-white"}`}>
                        {buildingType.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isLocked
                              ? "border-slate-500 text-slate-500"
                              : isMaxLevel
                                ? "border-green-500 text-green-400"
                                : currentLevel === 0
                                  ? "border-slate-500 text-slate-400"
                                  : "border-cyan-500 text-cyan-400"
                          }`}
                        >
                          {isLocked ? "Bloqueado" : `Nivel ${currentLevel}`}
                        </Badge>
                        {isUpgrading && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Mejorando
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto text-slate-400 hover:text-slate-200"
                        onClick={() =>
                          setSelectedBuilding(selectedBuilding === buildingType.id ? null : buildingType.id)
                        }
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{buildingType.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {isLocked && (
                  <div className="p-2 bg-red-900/20 border border-red-500/30 rounded text-xs">
                    <div className="flex items-center gap-1 text-red-400 mb-1">
                      <Lock className="w-3 h-3" />
                      Requisitos:
                    </div>
                    {unlockRequirements.map((req, index) => (
                      <div key={index} className="text-red-300">
                        • {req}
                      </div>
                    ))}
                  </div>
                )}

                {isSpaceport && !isLocked && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Slots de Entrenamiento:</span>
                      <span className="text-cyan-400">{trainingSlots}</span>
                    </div>
                    {totalArmyPower > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Poder del Ejército:</span>
                        <span className="text-orange-400 flex items-center gap-1">
                          <Sword className="w-3 h-3" />
                          {Math.floor(totalArmyPower)}
                        </span>
                      </div>
                    )}

                    {availableUnits.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400">Unidades Disponibles:</div>
                        <div className="grid grid-cols-2 gap-1">
                          {availableUnits.map((unit) => {
                            const count = getUnitCount(unit.id)
                            return (
                              <div key={unit.id} className="flex items-center gap-1 text-xs">
                                <span>{unit.icon}</span>
                                <span className="text-slate-300 truncate">{unit.name.split(" ")[0]}</span>
                                {count > 0 && (
                                  <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-xs px-1 py-0">
                                    {count}
                                  </Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Current Production */}
                {!isLocked && Object.keys(currentProduction).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Producción Actual:</div>
                    <div className="text-xs text-green-400 font-mono">
                      {Object.entries(currentProduction).map(([resource, amount]) => (
                        <div key={resource}>
                          +{amount}/min {resource.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isLocked && activeBenefits.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Beneficios Activos:</div>
                    {activeBenefits.map((benefit, index) => (
                      <div key={index} className="p-1 bg-green-900/20 rounded text-xs text-green-400">
                        <Zap className="w-3 h-3 inline mr-1" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upgrade Section */}
                {!isMaxLevel && !isLocked && (
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Mejorar a Nivel {nextLevel}</span>
                      <span className="text-xs text-slate-400">{formatTime(upgradeTime)}</span>
                    </div>

                    <div className="text-xs text-slate-400">Coste: {formatResources(upgradeCost)}</div>

                    {Object.keys(nextProduction).length > 0 && (
                      <div className="text-xs text-cyan-400">
                        Producción:{" "}
                        {Object.entries(nextProduction)
                          .map(([resource, amount]) => `+${amount}/min ${resource.toUpperCase()}`)
                          .join(", ")}
                      </div>
                    )}

                    {nextBenefit && (
                      <div className="text-xs text-cyan-400 p-1 bg-cyan-900/20 rounded">
                        <Zap className="w-3 h-3 inline mr-1" />L{nextLevel}: {nextBenefit}
                      </div>
                    )}

                    <Button
                      onClick={() => handleUpgrade(buildingType.id)}
                      disabled={!canUpgradeBuilding || isUpgrading}
                      className={`w-full text-xs ${
                        canUpgradeBuilding
                          ? "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                          : "bg-slate-700 text-slate-400"
                      }`}
                      size="sm"
                    >
                      {isUpgrading ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Mejorando...
                        </div>
                      ) : getAvailableConstructionSlots() <= 0 ? (
                        "Sin Colas"
                      ) : !canAffordBuilding(buildingType.id, nextLevel) ? (
                        "Sin Recursos"
                      ) : (
                        <div className="flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" />
                          Mejorar
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                {isMaxLevel && (
                  <div className="text-center py-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Nivel Máximo</Badge>
                  </div>
                )}

                {/* Expanded Info */}
                {selectedBuilding === buildingType.id && (
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <div className="text-xs text-slate-300">{buildingType.description}</div>

                    {Object.keys(buildingType.levelBenefits).length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400">Beneficios por Nivel:</div>
                        {Object.entries(buildingType.levelBenefits).map(([level, benefit]) => (
                          <div
                            key={level}
                            className={`text-xs p-1 rounded ${
                              Number.parseInt(level) <= currentLevel
                                ? "text-green-400 bg-green-900/20"
                                : Number.parseInt(level) === nextLevel
                                  ? "text-cyan-400 bg-cyan-900/20"
                                  : "text-slate-400"
                            }`}
                          >
                            L{level}: {benefit}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
