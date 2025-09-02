"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useGameStore } from "@/lib/game-state"
import { TERRITORIES, ORBITS, getBonusIcon, getBonusColor, getDefenseLevelColor } from "@/lib/map-data"
import type { Territory, Orbit } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const CELL_WIDTH = 300
const CELL_HEIGHT = 250
const MAP_WIDTH = 3 * CELL_WIDTH
const MAP_HEIGHT = 4 * CELL_HEIGHT
const VIEWBOX_WIDTH = 1200
const VIEWBOX_HEIGHT = 1000

export function InteractiveMap() {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const { mapState, exploreTerritory, controlTerritory, getHQLevel, initializeMapState, resources } = useGameStore()

  useEffect(() => {
    initializeMapState()
  }, [initializeMapState])

  const handleTerritoryClick = (territory: Territory) => {
    setSelectedTerritory(territory)
  }

  const handleExplore = (territoryId: string) => {
    const success = exploreTerritory(territoryId)
    if (success) {
      setSelectedTerritory(null)
    }
  }

  const handleControl = (territoryId: string) => {
    const success = controlTerritory(territoryId)
    if (success) {
      setSelectedTerritory(null)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale * delta)),
    }))
  }

  const isOrbitUnlocked = (orbit: Orbit): boolean => {
    return getHQLevel() >= orbit.unlockRequirements.hqLevel
  }

  const canAffordExploration = () => {
    return resources.materials >= 50 && resources.energy >= 30 && resources.data >= 20 && resources.civicCredit >= 10
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Mapa SVG */}
      <div className="flex-1 relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="w-full h-full cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <g id="world" transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>
            <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#grid)" />

            {/* Distritos */}
            <g id="districts">
              {TERRITORIES.map((territory) => {
                const x = 100 + territory.position.x * CELL_WIDTH
                const y = 100 + territory.position.y * CELL_HEIGHT
                const isExplored = mapState.exploredTerritories.includes(territory.id)
                const isOwned = mapState.playerTerritories.includes(territory.id)

                return (
                  <g key={territory.id}>
                    {/* Celda del distrito */}
                    <rect
                      x={x}
                      y={y}
                      width={CELL_WIDTH - 20}
                      height={CELL_HEIGHT - 20}
                      fill={isOwned ? "#065f46" : isExplored ? "#1e293b" : "#0f172a"}
                      stroke={isOwned ? "#10b981" : isExplored ? "#475569" : "#334155"}
                      strokeWidth="2"
                      rx="8"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleTerritoryClick(territory)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${territory.name} - ${isExplored ? "Explorado" : "Sin explorar"}`}
                    />

                    {/* Nombre del distrito */}
                    <text
                      x={x + CELL_WIDTH / 2 - 10}
                      y={y + 30}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="14"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {territory.name}
                    </text>

                    {/* Icono de bonificación */}
                    {isExplored && (
                      <>
                        <circle
                          cx={x + CELL_WIDTH / 2 - 10}
                          cy={y + CELL_HEIGHT / 2}
                          r="25"
                          fill={getBonusColor(territory.bonusType)}
                          opacity="0.2"
                        />
                        <text
                          x={x + CELL_WIDTH / 2 - 10}
                          y={y + CELL_HEIGHT / 2 + 5}
                          textAnchor="middle"
                          fontSize="20"
                          className="pointer-events-none"
                        >
                          {getBonusIcon(territory.bonusType)}
                        </text>
                        <text
                          x={x + CELL_WIDTH / 2 - 10}
                          y={y + CELL_HEIGHT / 2 + 35}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="12"
                          className="pointer-events-none"
                        >
                          +{territory.bonusValue}%
                        </text>
                      </>
                    )}

                    {/* Indicador de nivel de defensa */}
                    {isExplored && (
                      <rect
                        x={x + CELL_WIDTH - 50}
                        y={y + 10}
                        width="30"
                        height="20"
                        fill={getDefenseLevelColor(territory.defenseLevel)}
                        rx="4"
                      />
                    )}

                    {/* Indicador de propietario */}
                    {isOwned && (
                      <text
                        x={x + 10}
                        y={y + CELL_HEIGHT - 30}
                        fill="#10b981"
                        fontSize="12"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        CONTROLADO
                      </text>
                    )}

                    {!isExplored && (
                      <text
                        x={x + CELL_WIDTH / 2 - 10}
                        y={y + CELL_HEIGHT / 2 + 5}
                        textAnchor="middle"
                        fill="#6b7280"
                        fontSize="24"
                        className="pointer-events-none"
                      >
                        ?
                      </text>
                    )}
                  </g>
                )
              })}
            </g>

            {/* Órbitas */}
            <g id="orbits">
              {ORBITS.map((orbit) => {
                const centerX = VIEWBOX_WIDTH / 2
                const centerY = VIEWBOX_HEIGHT / 2
                const isUnlocked = isOrbitUnlocked(orbit)

                return (
                  <g key={orbit.id}>
                    {/* Círculo de órbita */}
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={orbit.radius}
                      fill="none"
                      stroke={isUnlocked ? "#06b6d4" : "#374151"}
                      strokeWidth="2"
                      strokeDasharray={isUnlocked ? "none" : "10,5"}
                      opacity={isUnlocked ? 0.8 : 0.4}
                    />

                    {/* Slots de órbita */}
                    {isUnlocked &&
                      orbit.slots.map((slot) => {
                        const angle = (slot.position * Math.PI) / 180
                        const slotX = centerX + Math.cos(angle) * orbit.radius
                        const slotY = centerY + Math.sin(angle) * orbit.radius

                        return (
                          <g key={slot.id}>
                            <circle
                              cx={slotX}
                              cy={slotY}
                              r="15"
                              fill={slot.isOccupied ? "#065f46" : "#1e293b"}
                              stroke={slot.isOccupied ? "#10b981" : "#475569"}
                              strokeWidth="2"
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                            />
                            {slot.isOccupied && (
                              <text
                                x={slotX}
                                y={slotY + 4}
                                textAnchor="middle"
                                fill="#10b981"
                                fontSize="12"
                                className="pointer-events-none"
                              >
                                ⚡
                              </text>
                            )}
                          </g>
                        )
                      })}

                    {/* Etiqueta de órbita */}
                    <text
                      x={centerX + orbit.radius + 20}
                      y={centerY}
                      fill={isUnlocked ? "#06b6d4" : "#6b7280"}
                      fontSize="14"
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {orbit.name}
                      {!isUnlocked && ` (HQ ${orbit.unlockRequirements.hqLevel})`}
                    </text>
                  </g>
                )
              })}
            </g>
          </g>
        </svg>

        {/* Controles de zoom */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(2, prev.scale * 1.2) }))}
            className="bg-slate-800 border-slate-600 hover:bg-slate-700"
          >
            +
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(0.5, prev.scale * 0.8) }))}
            className="bg-slate-800 border-slate-600 hover:bg-slate-700"
          >
            -
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            className="bg-slate-800 border-slate-600 hover:bg-slate-700"
          >
            ⌂
          </Button>
        </div>

        <div className="absolute top-4 left-4 bg-slate-800/90 rounded-lg p-3 border border-slate-600">
          <div className="text-sm space-y-1">
            <div className="text-cyan-400 font-semibold">Estado del Mapa</div>
            <div className="text-slate-300">
              Explorados: {mapState.exploredTerritories.length}/{TERRITORIES.length}
            </div>
            <div className="text-slate-300">
              Controlados: {mapState.playerTerritories.length}/{TERRITORIES.length}
            </div>
            <div className="text-slate-300">
              Órbitas: {ORBITS.filter((orbit) => isOrbitUnlocked(orbit)).length}/{ORBITS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de información */}
      {selectedTerritory && (
        <Card className="w-80 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              {getBonusIcon(selectedTerritory.bonusType)}
              {selectedTerritory.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Bonificación:</p>
              <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                {selectedTerritory.bonusType} +{selectedTerritory.bonusValue}%
              </Badge>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Nivel de Defensa:</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getDefenseLevelColor(selectedTerritory.defenseLevel) }}
                />
                <span className="text-sm">
                  {selectedTerritory.defenseLevel === 1
                    ? "Fácil"
                    : selectedTerritory.defenseLevel === 2
                      ? "Medio"
                      : "Difícil"}
                </span>
              </div>
            </div>

            {selectedTerritory.ownerId && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Controlado por:</p>
                <p className="text-sm font-medium">{selectedTerritory.ownerName || "Jugador desconocido"}</p>
              </div>
            )}

            <div className="space-y-2">
              {!mapState.exploredTerritories.includes(selectedTerritory.id) && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Coste: 50 MAT, 30 ENG, 20 DAT, 10 CC</div>
                  <Button
                    onClick={() => handleExplore(selectedTerritory.id)}
                    disabled={!canAffordExploration()}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600"
                  >
                    {canAffordExploration() ? "Explorar" : "Recursos Insuficientes"}
                  </Button>
                </div>
              )}

              {mapState.exploredTerritories.includes(selectedTerritory.id) &&
                !mapState.playerTerritories.includes(selectedTerritory.id) && (
                  <Button
                    onClick={() => handleControl(selectedTerritory.id)}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    Controlar (Sin Combate)
                  </Button>
                )}

              {mapState.playerTerritories.includes(selectedTerritory.id) && (
                <div className="text-center text-green-400 font-semibold">✓ Territorio Controlado</div>
              )}

              <Button
                variant="outline"
                onClick={() => setSelectedTerritory(null)}
                className="w-full border-slate-600 hover:bg-slate-700"
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
