import { useGameStore } from "@/lib/game-state"
import { UNIT_TYPES } from "@/lib/units-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sword, Shield, Zap, Package, TrendingDown, Users, AlertTriangle } from "lucide-react"

export function ArmyOverview() {
  const { units, getTotalArmyPower, getMaintenanceCost, resources } = useGameStore()

  const totalPower = getTotalArmyPower()
  const maintenanceCost = getMaintenanceCost()
  const totalUnits = units.reduce((sum, unit) => sum + unit.count, 0)

  const getUnitEfficiency = (unitId: string) => {
    const unit = units.find((u) => u.type.id === unitId)
    if (!unit || unit.count === 0) return 0

    const unitType = UNIT_TYPES[unitId]
    if (!unitType) return 0

    // Calculate efficiency based on maintenance cost vs available resources
    const unitMaintenance = unitType.stats.maintenance
    let efficiency = 100

    if (unitMaintenance.materials && unitMaintenance.materials > 0) {
      const materialRatio = resources.materials / (unitMaintenance.materials * unit.count * 24) // 24h worth
      if (materialRatio < 1) efficiency = Math.min(efficiency, materialRatio * 100)
    }

    if (unitMaintenance.energy && unitMaintenance.energy > 0) {
      const energyRatio = resources.energy / (unitMaintenance.energy * unit.count * 24)
      if (energyRatio < 1) efficiency = Math.min(efficiency, energyRatio * 100)
    }

    return Math.max(0, Math.min(100, efficiency))
  }

  const getMaintenanceStatus = () => {
    const totalMaintenance = {
      materials: maintenanceCost.materials * 24, // Daily cost
      energy: maintenanceCost.energy * 24,
      data: maintenanceCost.data * 24,
    }

    const canAfford = {
      materials: resources.materials >= totalMaintenance.materials,
      energy: resources.energy >= totalMaintenance.energy,
      data: resources.data >= totalMaintenance.data,
    }

    const allAffordable = canAfford.materials && canAfford.energy && canAfford.data
    return { canAfford, allAffordable, totalMaintenance }
  }

  const maintenanceStatus = getMaintenanceStatus()

  if (totalUnits === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Resumen del Ejército
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No tienes unidades entrenadas</p>
            <p className="text-slate-500 text-sm mt-2">Entrena unidades en el Espaciopuerto para formar tu ejército</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Resumen del Ejército
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Army Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{totalUnits}</div>
              <div className="text-xs text-slate-400">Total Unidades</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                <Sword className="w-5 h-5" />
                {Math.floor(totalPower)}
              </div>
              <div className="text-xs text-slate-400">Poder Total</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400 flex items-center justify-center gap-1">
                <TrendingDown className="w-5 h-5" />
                {(maintenanceCost.materials + maintenanceCost.energy + maintenanceCost.data).toFixed(1)}
              </div>
              <div className="text-xs text-slate-400">Mantenimiento/h</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div
                className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                  maintenanceStatus.allAffordable ? "text-green-400" : "text-red-400"
                }`}
              >
                {maintenanceStatus.allAffordable ? (
                  <Shield className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                {maintenanceStatus.allAffordable ? "100" : "0"}%
              </div>
              <div className="text-xs text-slate-400">Eficiencia</div>
            </div>
          </div>

          {/* Maintenance Cost Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">Costes de Mantenimiento (por hora):</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {maintenanceCost.materials > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">MAT:</span>
                  <span className={maintenanceStatus.canAfford.materials ? "text-white" : "text-red-400"}>
                    -{maintenanceCost.materials.toFixed(1)}/h
                  </span>
                </div>
              )}
              {maintenanceCost.energy > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ENG:</span>
                  <span className={maintenanceStatus.canAfford.energy ? "text-white" : "text-red-400"}>
                    -{maintenanceCost.energy.toFixed(1)}/h
                  </span>
                </div>
              )}
              {maintenanceCost.data > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">DAT:</span>
                  <span className={maintenanceStatus.canAfford.data ? "text-white" : "text-red-400"}>
                    -{maintenanceCost.data.toFixed(1)}/h
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Unit Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">Composición del Ejército:</h4>
            <div className="space-y-3">
              {units
                .filter((unit) => unit.count > 0)
                .map((unit) => {
                  const unitType = UNIT_TYPES[unit.type.id]
                  if (!unitType) return null

                  const efficiency = getUnitEfficiency(unit.type.id)
                  const unitPower = ((unitType.stats.attack + unitType.stats.defense) / 2) * unit.count

                  return (
                    <div key={unit.id} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{unitType.icon}</span>
                          <div>
                            <h5 className="text-white font-medium">{unitType.name}</h5>
                            <p className="text-slate-400 text-xs">{unit.count} unidades</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-400 font-mono text-sm flex items-center gap-1">
                            <Sword className="w-3 h-3" />
                            {Math.floor(unitPower)}
                          </div>
                          <div className="text-xs text-slate-400">Poder</div>
                        </div>
                      </div>

                      {/* Unit Stats */}
                      <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-center">
                              <div className="text-red-400 flex items-center justify-center gap-1">
                                <Sword className="w-3 h-3" />
                                {unitType.stats.attack}
                              </div>
                              <div className="text-slate-500">ATK</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Ataque por unidad</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-center">
                              <div className="text-blue-400 flex items-center justify-center gap-1">
                                <Shield className="w-3 h-3" />
                                {unitType.stats.defense}
                              </div>
                              <div className="text-slate-500">DEF</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Defensa por unidad</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-center">
                              <div className="text-green-400 flex items-center justify-center gap-1">
                                <Zap className="w-3 h-3" />
                                {unitType.stats.speed}
                              </div>
                              <div className="text-slate-500">VEL</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Velocidad</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-center">
                              <div className="text-purple-400 flex items-center justify-center gap-1">
                                <Package className="w-3 h-3" />
                                {unitType.stats.capacity}
                              </div>
                              <div className="text-slate-500">CAP</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Capacidad de carga</TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Efficiency Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Eficiencia:</span>
                          <span
                            className={
                              efficiency >= 80
                                ? "text-green-400"
                                : efficiency >= 50
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }
                          >
                            {efficiency.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={efficiency} className="h-2" />
                        {efficiency < 100 && (
                          <p className="text-xs text-yellow-400">⚠️ Recursos insuficientes para mantenimiento óptimo</p>
                        )}
                      </div>

                      {/* Special Abilities */}
                      <div className="mt-2">
                        <div className="text-xs text-slate-400 mb-1">Habilidades:</div>
                        <div className="flex flex-wrap gap-1">
                          {unitType.specialAbilities.slice(0, 2).map((ability, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-cyan-400 text-cyan-400 text-xs px-1 py-0"
                            >
                              {ability.split(":")[0]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {!maintenanceStatus.allAffordable && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Advertencia de Mantenimiento</span>
              </div>
              <p className="text-red-300 text-sm">
                No tienes suficientes recursos para mantener tu ejército a plena eficiencia. Las unidades pueden sufrir
                penalizaciones de rendimiento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
