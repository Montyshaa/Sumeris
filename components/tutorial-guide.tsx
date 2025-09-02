"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGameStore } from "@/lib/game-state"
import { getMissionsByDay } from "@/lib/missions-data"
import { ChevronRight, Lightbulb, Target, CheckCircle } from "lucide-react"

export function TutorialGuide() {
  const { tutorialDay, playerMissions, isMissionCompleted, advanceTutorialDay, initializeMissions } = useGameStore()

  const [showGuide, setShowGuide] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  // Initialize missions if not already done
  useEffect(() => {
    if (playerMissions.length === 0) {
      initializeMissions()
    }
  }, [playerMissions.length, initializeMissions])

  // Check if we can advance to next day
  useEffect(() => {
    const currentDayMissions = getMissionsByDay(tutorialDay)
    const allCompleted = currentDayMissions.every((mission) => isMissionCompleted(mission.id))

    if (allCompleted && tutorialDay < 3) {
      // Auto-advance after a short delay
      const timer = setTimeout(() => {
        advanceTutorialDay()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [playerMissions, tutorialDay, isMissionCompleted, advanceTutorialDay])

  const currentDayMissions = getMissionsByDay(tutorialDay)
  const completedCount = currentDayMissions.filter((m) => isMissionCompleted(m.id)).length
  const isCurrentDayComplete = completedCount === currentDayMissions.length

  const tutorialSteps = {
    1: [
      {
        title: "¡Bienvenido a Ciudad Tecnosocial!",
        description:
          "Vas a gestionar una ciudad-estado futurista. Tu objetivo es equilibrar recursos, bienestar ciudadano y legitimidad política.",
        action: "Observa la barra superior con tus recursos actuales",
      },
      {
        title: "Construye tu Primera Mejora",
        description:
          "Los edificios son la base de tu economía. Mejora la Fábrica Modular para aumentar la producción de materiales.",
        action: "Ve a la pestaña 'Base' y mejora la Fábrica al nivel 2",
      },
      {
        title: "Mantén el Bienestar",
        description:
          "Los índices de Bienestar, Sostenibilidad y Legitimidad afectan tu producción. Mantén el bienestar por encima de 55.",
        action: "Observa los índices en la barra superior (WB, SUS, LEG)",
      },
      {
        title: "Acumula Recursos",
        description:
          "Los recursos se generan automáticamente cada 30 segundos. Necesitarás materiales para futuras construcciones.",
        action: "Espera a acumular 400 materiales o usa el botón 'Producir'",
      },
    ],
    2: [
      {
        title: "Día 2: Expansión y Políticas",
        description: "Ahora puedes entrenar unidades militares y activar políticas que afectan tu ciudad.",
        action: "Construye un Espaciopuerto para entrenar Drones",
      },
      {
        title: "Entrena tu Ejército",
        description: "Los Drones Ligeros son unidades básicas para defender tu territorio y atacar a otros jugadores.",
        action: "Entrena 20 Drones Ligeros desde el Espaciopuerto",
      },
      {
        title: "Activa tu Primera Política",
        description: "Las políticas consumen Crédito Cívico pero proporcionan beneficios temporales o permanentes.",
        action: "Ve a 'Políticas' y activa 'Salario Básico' por 60 minutos",
      },
      {
        title: "Equilibrio Ambiental",
        description:
          "La sostenibilidad es crucial para el éxito a largo plazo. Mantén un equilibrio entre crecimiento y medio ambiente.",
        action: "Mantén la sostenibilidad ≥ 60 durante 6 horas",
      },
    ],
    3: [
      {
        title: "Día 3: Tecnología Avanzada",
        description: "Desbloquea tecnologías avanzadas y establece el dominio territorial.",
        action: "Mejora la Nube de Datos para desbloquear el Parque de IA",
      },
      {
        title: "Investiga Tecnología Verde",
        description: "La investigación proporciona bonificaciones permanentes. El reciclaje mejora tu sostenibilidad.",
        action: "Ve a 'I+D' e investiga 'Reciclaje I'",
      },
      {
        title: "Capta Talento Especializado",
        description:
          "El talento humano es el recurso más valioso. Se genera lentamente pero es esencial para operaciones avanzadas.",
        action: "Acumula 1 unidad adicional de talento",
      },
      {
        title: "Dominio Territorial",
        description: "Controlar territorio te da acceso a recursos adicionales y bonificaciones estratégicas.",
        action: "Mantén control de un distrito durante 12 horas",
      },
    ],
  }

  const currentSteps = tutorialSteps[tutorialDay as keyof typeof tutorialSteps] || []
  const currentStepData = currentSteps[currentStep]

  if (!showGuide || tutorialDay > 3) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Tutorial - Día {tutorialDay}</CardTitle>
              <p className="text-cyan-200 text-sm">
                {completedCount}/{currentDayMissions.length} misiones completadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCurrentDayComplete && tutorialDay < 3 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                ¡Día Completado!
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Step Guide */}
        {currentStepData && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{currentStep + 1}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-2">{currentStepData.title}</h4>
                <p className="text-slate-300 text-sm mb-3">{currentStepData.description}</p>
                <div className="flex items-center gap-2 text-cyan-400 text-sm">
                  <Target className="w-3 h-3" />
                  {currentStepData.action}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-cyan-400" : index < currentStep ? "bg-green-400" : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Anterior
              </Button>
            )}
            {currentStep < currentSteps.length - 1 && (
              <Button
                size="sm"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                Siguiente
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Day Progress */}
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Progreso del día:</span>
            <span className="text-white">
              {completedCount}/{currentDayMissions.length}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / currentDayMissions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Next Day Preview */}
        {isCurrentDayComplete && tutorialDay < 3 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">¡Excelente trabajo!</span>
            </div>
            <p className="text-green-300 text-sm mt-1">
              Avanzando automáticamente al Día {tutorialDay + 1} en unos segundos...
            </p>
          </div>
        )}

        {/* Tutorial Complete */}
        {tutorialDay >= 3 && isCurrentDayComplete && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">¡Tutorial Completado!</span>
            </div>
            <p className="text-purple-300 text-sm mt-1">
              Has dominado los fundamentos de Ciudad Tecnosocial. ¡Ahora explora libremente!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
