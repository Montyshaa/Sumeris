"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/lib/game-state"
import { HelpCircle, X } from "lucide-react"

interface TooltipData {
  id: string
  target: string
  title: string
  content: string
  position: "top" | "bottom" | "left" | "right"
  day: number
}

const TUTORIAL_TOOLTIPS: TooltipData[] = [
  {
    id: "resources-bar",
    target: "[data-tutorial='resources']",
    title: "Barra de Recursos",
    content:
      "Aquí ves tus recursos actuales y los índices de tu ciudad. Los índices afectan la producción: mantén WB, SUS y LEG por encima de 60 para máxima eficiencia.",
    position: "bottom",
    day: 1,
  },
  {
    id: "buildings-tab",
    target: "[data-tutorial='buildings']",
    title: "Edificios",
    content:
      "Los edificios generan recursos automáticamente. Mejóralos para aumentar la producción. Cada tipo tiene beneficios especiales en ciertos niveles.",
    position: "bottom",
    day: 1,
  },
  {
    id: "research-tab",
    target: "[data-tutorial='research']",
    title: "Investigación y Desarrollo",
    content:
      "Las tecnologías proporcionan bonificaciones permanentes. Hay tres árboles: Socio-económico, Eco-tecnológico y Aero-IA.",
    position: "bottom",
    day: 2,
  },
  {
    id: "policies-tab",
    target: "[data-tutorial='policies']",
    title: "Políticas",
    content:
      "Activa hasta 3 políticas simultáneas que modifican tu economía. Consumen Crédito Cívico y tienen tiempos de recarga.",
    position: "bottom",
    day: 2,
  },
  {
    id: "missions-tab",
    target: "[data-tutorial='missions']",
    title: "Misiones Tutorial",
    content: "Completa estas misiones para aprender las mecánicas del juego y obtener recompensas valiosas.",
    position: "bottom",
    day: 1,
  },
]

export function TutorialTooltips() {
  const { tutorialDay } = useGameStore()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [shownTooltips, setShownTooltips] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Show tooltips for current day that haven't been shown yet
    const currentDayTooltips = TUTORIAL_TOOLTIPS.filter(
      (tooltip) => tooltip.day === tutorialDay && !shownTooltips.has(tooltip.id),
    )

    if (currentDayTooltips.length > 0 && !activeTooltip) {
      // Show first unshown tooltip after a delay
      const timer = setTimeout(() => {
        setActiveTooltip(currentDayTooltips[0].id)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [tutorialDay, shownTooltips, activeTooltip])

  const handleCloseTooltip = (tooltipId: string) => {
    setActiveTooltip(null)
    setShownTooltips((prev) => new Set([...prev, tooltipId]))
  }

  const activeTooltipData = TUTORIAL_TOOLTIPS.find((t) => t.id === activeTooltip)

  if (!activeTooltipData || tutorialDay > 3) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" />

      {/* Tooltip */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="bg-slate-800 border border-cyan-500/50 rounded-lg p-4 max-w-sm shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">{activeTooltipData.title}</h4>
              <p className="text-slate-300 text-sm">{activeTooltipData.content}</p>
            </div>
            <button
              onClick={() => handleCloseTooltip(activeTooltipData.id)}
              className="text-slate-400 hover:text-white flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleCloseTooltip(activeTooltipData.id)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
