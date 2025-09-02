"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResourceBar } from "@/components/resource-bar"
import { useGameStore } from "@/lib/game-state"
import {
  Construction,
  Cpu,
  Database,
  Zap,
  User,
  Play,
  RefreshCw,
  Building2,
  Shield,
  Target,
  Users,
  Map,
} from "lucide-react"
import { ProductionDisplay } from "@/components/production-display"
import { DatabaseStatus } from "@/components/database-status"
import { BuildingsGrid } from "@/components/buildings-grid"
import { ConstructionQueue } from "@/components/construction-queue"
import { ResearchQueue } from "@/components/research-queue"
import { ResearchTrees } from "@/components/research-trees"
import { ActiveResearchEffects } from "@/components/active-research-effects"
import { ResearchProgressOverview } from "@/components/research-progress-overview"
import { useConstructionNotifications } from "@/hooks/use-construction-notifications"
import { useResearchNotifications } from "@/hooks/use-research-notifications"
import { usePolicyNotifications } from "@/hooks/use-policy-notifications"
import { useMissionNotifications } from "@/hooks/use-mission-notifications"
import { PoliciesGrid } from "@/components/policies-grid"
import { ActivePoliciesDisplay } from "@/components/active-policies-display"
import { ActivePolicyEffects } from "@/components/active-policy-effects"
import { PolicyManagementOverview } from "@/components/policy-management-overview"
import { PolicyRecommendations } from "@/components/policy-recommendations"
import { MissionsGrid } from "@/components/missions-grid"
import { MissionRewardsDisplay } from "@/components/mission-rewards-display"
import { TutorialGuide } from "@/components/tutorial-guide"
import { TutorialTooltips } from "@/components/tutorial-tooltips"
import { UnitsGrid } from "@/components/units-grid"
import { TrainingQueue } from "@/components/training-queue"
import { ArmyOverview } from "@/components/army-overview"
import { InteractiveMap } from "@/components/interactive-map"

export default function GamePage() {
  const {
    playerId,
    playerName,
    setPlayerInfo,
    resources,
    indices,
    syncWithDatabase,
    calculateProduction,
    tutorialDay,
  } = useGameStore()
  const [inputName, setInputName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Enable notifications
  useConstructionNotifications()
  useResearchNotifications()
  usePolicyNotifications()
  useMissionNotifications()

  // Check if player is already logged in
  const isLoggedIn = playerId && playerName

  const handleStartGame = async () => {
    if (!inputName.trim()) return

    setIsLoading(true)

    // Generate unique player ID (simplified version)
    const uniqueId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate brief loading
    await new Promise((resolve) => setTimeout(resolve, 500))

    await setPlayerInfo(uniqueId, inputName.trim())
    setIsLoading(false)
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await syncWithDatabase()
      // Dispatch custom event for database status component
      window.dispatchEvent(new CustomEvent("database-sync"))
    } catch (error) {
      console.error("[v0] Manual sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleManualProduction = () => {
    calculateProduction()
  }

  // Access screen for new players
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-8 h-8 text-slate-900" />
            </div>
            <CardTitle className="text-white text-xl">Acceso a Ciudad Tecnosocial</CardTitle>
            <p className="text-slate-400 text-sm">Sin contraseñas ni emails. Solo elige tu nombre y comienza.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Nombre de Jugador</label>
              <Input
                placeholder="Ingresa tu nombre..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                onKeyDown={(e) => e.key === "Enter" && handleStartGame()}
              />
            </div>
            <Button
              onClick={handleStartGame}
              disabled={!inputName.trim() || isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Iniciar Juego
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Resource Bar */}
      <div data-tutorial="resources">
        <ResourceBar />
      </div>

      {/* Game Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-medium">{playerName}</span>
              </div>
              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                ID: {playerId.slice(-8)}
              </Badge>
              <DatabaseStatus />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualProduction}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Producir
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                {isSyncing ? (
                  <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin mr-1" />
                ) : (
                  <Database className="w-3 h-3 mr-1" />
                )}
                Sync
              </Button>
              <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                En Desarrollo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {tutorialDay <= 3 && <TutorialGuide />}

        <Tabs defaultValue="base" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="base" className="data-[state=active]:bg-slate-700" data-tutorial="buildings">
              <Building2 className="w-4 h-4 mr-2" />
              Base
            </TabsTrigger>
            <TabsTrigger value="units" className="data-[state=active]:bg-slate-700" data-tutorial="units">
              <Users className="w-4 h-4 mr-2" />
              Unidades
            </TabsTrigger>
            <TabsTrigger value="research" className="data-[state=active]:bg-slate-700" data-tutorial="research">
              <Zap className="w-4 h-4 mr-2" />
              I+D
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-slate-700" data-tutorial="policies">
              <Shield className="w-4 h-4 mr-2" />
              Políticas
            </TabsTrigger>
            <TabsTrigger value="missions" className="data-[state=active]:bg-slate-700" data-tutorial="missions">
              <Target className="w-4 h-4 mr-2" />
              Misiones
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-slate-700" data-tutorial="map">
              <Map className="w-4 h-4 mr-2" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-slate-700">
              <Construction className="w-4 h-4 mr-2" />
              Estado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="space-y-6">
            {/* Construction Queue */}
            <ConstructionQueue />

            {/* Buildings Grid */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  Edificios de la Ciudad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BuildingsGrid />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="units" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TrainingQueue />

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-400" />
                      Entrenamiento de Unidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UnitsGrid />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <ArmyOverview />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ResearchQueue />
                <ResearchTrees />
              </div>
              <div className="space-y-6">
                <ResearchProgressOverview />
                <ActiveResearchEffects />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PoliciesGrid />
              </div>
              <div className="space-y-6">
                <ActivePoliciesDisplay />
                <ActivePolicyEffects />
                <PolicyManagementOverview />
                <PolicyRecommendations />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      Tutorial y Misiones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MissionsGrid />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <MissionRewardsDisplay />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Map className="w-5 h-5 text-cyan-400" />
                  Mapa Interactivo - 12 Distritos + 2 Órbitas
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">
                  Explora territorios, controla distritos y desbloquea órbitas para expandir tu ciudad tecnosocial.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] w-full">
                  <InteractiveMap />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            {/* Development Status */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Construction className="w-5 h-5 text-cyan-400" />
                  Estado del Desarrollo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">✅ Sistema de Recursos</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">✅ Sistema de Edificios</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">✅ Sistema de I+D</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">✅ Sistema de Políticas</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">✅ Sistema de Unidades</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">✅ Sistema de Misiones</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">🔄 Mapa Interactivo</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En Desarrollo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">⏳ Sistema de Combate PvP</span>
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Pendiente</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Resource Display */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center mb-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                  </div>
                  <CardTitle className="text-white text-sm">Recursos Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">MAT</span>
                      <span className="text-white font-mono">{Math.floor(resources.materials)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ENG</span>
                      <span className="text-white font-mono">{Math.floor(resources.energy)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">DAT</span>
                      <span className="text-white font-mono">{Math.floor(resources.data)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">HR</span>
                      <span className="text-white font-mono">{resources.talent.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CC</span>
                      <span className="text-white font-mono">{Math.floor(resources.civicCredit)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <div className="w-10 h-10 bg-emerald-400/10 rounded-lg flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <CardTitle className="text-white text-sm">Índices Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bienestar</span>
                      <span
                        className={`font-mono ${indices.welfare >= 60 ? "text-green-400" : indices.welfare >= 40 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {Math.floor(indices.welfare)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sostenibilidad</span>
                      <span
                        className={`font-mono ${indices.sustainability >= 60 ? "text-green-400" : indices.sustainability >= 40 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {Math.floor(indices.sustainability)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Legitimidad</span>
                      <span
                        className={`font-mono ${indices.legitimacy >= 60 ? "text-green-400" : indices.legitimacy >= 40 ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {Math.floor(indices.legitimacy)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Production Display */}
              <ProductionDisplay />

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Próximos Pasos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div>• Mapa Interactivo</div>
                    <div>• Sistema de Combate PvP</div>
                    <div>• Políticas Activables</div>
                    <div>• Misiones y Progresión</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TutorialTooltips />
    </div>
  )
}
