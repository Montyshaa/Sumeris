"use client"

import { useGameStore } from "@/lib/game-state"
import { RESEARCH_DATA, getResearchByTree } from "@/lib/research-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Zap, Leaf, Brain, Trophy } from "lucide-react"
import type { ResearchTree } from "@/lib/types"

const TREE_CONFIG = {
  socioeconomic: {
    name: "Socio-económica",
    icon: Zap,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  ecotech: {
    name: "Eco-tecnológica",
    icon: Leaf,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  "aero-ai": {
    name: "Aero-IA",
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
}

export function ResearchProgressOverview() {
  const { getCompletedResearchIds, researchQueue } = useGameStore()
  const completedIds = getCompletedResearchIds()
  const totalResearch = RESEARCH_DATA.length
  const completedCount = completedIds.length
  const inProgressCount = researchQueue.length

  const getTreeProgress = (treeKey: ResearchTree) => {
    const treeResearch = getResearchByTree(treeKey)
    const completedInTree = completedIds.filter((id) => RESEARCH_DATA.find((r) => r.id === id)?.tree === treeKey).length
    return {
      completed: completedInTree,
      total: treeResearch.length,
      percentage: (completedInTree / treeResearch.length) * 100,
    }
  }

  const getNextRecommendations = () => {
    const availableResearch = RESEARCH_DATA.filter((research) => {
      // Skip if already completed
      if (completedIds.includes(research.id)) return false

      // Skip if in queue
      if (researchQueue.some((q) => q.researchId === research.id)) return false

      // Check prerequisites
      if (research.prerequisites) {
        return research.prerequisites.every((prereq) => completedIds.includes(prereq))
      }

      return true
    })

    // Sort by tier (lower tier first) and return top 3
    return availableResearch.sort((a, b) => a.tier - b.tier).slice(0, 3)
  }

  const recommendations = getNextRecommendations()

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Progreso General de Investigación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Investigaciones Completadas</span>
              <span className="text-white font-mono">
                {completedCount} / {totalResearch}
              </span>
            </div>
            <Progress value={(completedCount / totalResearch) * 100} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Completadas: {completedCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>En Progreso: {inProgressCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span>Disponibles: {recommendations.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree Progress */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400 text-sm">Progreso por Árbol Tecnológico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(Object.keys(TREE_CONFIG) as ResearchTree[]).map((treeKey) => {
              const treeConfig = TREE_CONFIG[treeKey]
              const progress = getTreeProgress(treeKey)
              const TreeIcon = treeConfig.icon

              return (
                <div key={treeKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TreeIcon className={`h-4 w-4 ${treeConfig.color}`} />
                      <span className="text-slate-300 text-sm">{treeConfig.name}</span>
                    </div>
                    <span className="text-white font-mono text-sm">
                      {progress.completed} / {progress.total}
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-1.5" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400 text-sm">Próximas Investigaciones Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((research) => {
                const treeConfig = TREE_CONFIG[research.tree as keyof typeof TREE_CONFIG]
                return (
                  <div
                    key={research.id}
                    className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-600"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{research.icon}</span>
                      <div>
                        <div className="text-white text-sm font-medium">{research.name}</div>
                        <div className="text-slate-400 text-xs">
                          {treeConfig.name} • Tier {research.tier}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                        {research.timeMinutes}m
                      </Badge>
                      <div className="text-xs text-slate-400">
                        {Object.entries(research.cost)
                          .filter(([_, amount]) => amount > 0)
                          .map(([resource, amount]) => `${amount} ${resource.toUpperCase().slice(0, 3)}`)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
