"use client"

import { useGameStore } from "@/lib/game-state"
import { RESEARCH_DATA, getResearchByTree } from "@/lib/research-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Lock, Clock, Zap, Leaf, Brain } from "lucide-react"
import type { ResearchTree } from "@/lib/types"

const TREE_CONFIG = {
  socioeconomic: {
    name: "Socio-económica",
    icon: Zap,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  ecotech: {
    name: "Eco-tecnológica",
    icon: Leaf,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  "aero-ai": {
    name: "Aero-IA",
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
}

export function ResearchTrees() {
  const {
    startResearch,
    canAffordResearch,
    isResearchAvailable,
    isResearchCompleted,
    getCompletedResearchIds,
    researchQueue,
    resources,
  } = useGameStore()

  const completedIds = getCompletedResearchIds()

  const handleStartResearch = (researchId: string) => {
    const success = startResearch(researchId)
    if (success) {
      console.log(`[v0] Research started: ${researchId}`)
    }
  }

  const getResearchStatus = (researchId: string) => {
    if (isResearchCompleted(researchId)) return "completed"
    if (researchQueue.some((q) => q.researchId === researchId)) return "researching"
    if (isResearchAvailable(researchId)) return "available"
    return "locked"
  }

  const renderResearchCard = (research: any) => {
    const status = getResearchStatus(research.id)
    const canAfford = canAffordResearch(research.id)
    const treeConfig = TREE_CONFIG[research.tree as keyof typeof TREE_CONFIG]

    return (
      <TooltipProvider key={research.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`
                relative transition-all duration-200 cursor-pointer
                ${
                  status === "completed"
                    ? "bg-green-900/20 border-green-500/50"
                    : status === "researching"
                      ? "bg-yellow-900/20 border-yellow-500/50"
                      : status === "available"
                        ? "bg-slate-800/50 border-slate-600 hover:border-slate-500"
                        : "bg-slate-900/50 border-slate-700 opacity-60"
                }
              `}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{research.icon}</span>
                    <div>
                      <CardTitle className="text-sm text-white">{research.name}</CardTitle>
                      <p className="text-xs text-slate-400">Tier {research.tier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {status === "completed" && <CheckCircle className="h-4 w-4 text-green-400" />}
                    {status === "researching" && <Clock className="h-4 w-4 text-yellow-400" />}
                    {status === "locked" && <Lock className="h-4 w-4 text-slate-500" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-slate-300 mb-3 line-clamp-2">{research.description}</p>

                {/* Effects */}
                <div className="space-y-1 mb-3">
                  {research.effects.map((effect: any, idx: number) => (
                    <div key={idx} className="text-xs text-cyan-400">
                      {effect.description}
                    </div>
                  ))}
                </div>

                {/* Cost */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {Object.entries(research.cost).map(([resource, amount]) => {
                    if (amount === 0) return null
                    const resourceKey = resource as keyof typeof resources
                    const hasEnough = resources[resourceKey] >= (amount as number)
                    return (
                      <Badge
                        key={resource}
                        variant="outline"
                        className={`text-xs ${hasEnough ? "border-slate-600 text-slate-300" : "border-red-500/50 text-red-400"}`}
                      >
                        {amount} {resource.toUpperCase().slice(0, 3)}
                      </Badge>
                    )
                  })}
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                    {research.timeMinutes}m
                  </Badge>
                </div>

                {/* Action Button */}
                {status === "available" && (
                  <Button
                    size="sm"
                    onClick={() => handleStartResearch(research.id)}
                    disabled={!canAfford || researchQueue.length >= 1}
                    className={`w-full text-xs ${treeConfig.bgColor} ${treeConfig.borderColor} border ${treeConfig.color} hover:bg-opacity-20`}
                  >
                    {!canAfford ? "Recursos Insuficientes" : researchQueue.length >= 1 ? "Cola Llena" : "Investigar"}
                  </Button>
                )}
                {status === "researching" && (
                  <Badge className="w-full justify-center bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Investigando...
                  </Badge>
                )}
                {status === "completed" && (
                  <Badge className="w-full justify-center bg-green-500/20 text-green-400 border-green-500/30">
                    Completado
                  </Badge>
                )}
                {status === "locked" && (
                  <Badge className="w-full justify-center bg-slate-500/20 text-slate-400 border-slate-500/30">
                    Bloqueado
                  </Badge>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">{research.name}</p>
              <p className="text-sm text-slate-300">{research.description}</p>
              {research.prerequisites && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Prerrequisitos:</p>
                  {research.prerequisites.map((prereq: string) => {
                    const prereqResearch = RESEARCH_DATA.find((r) => r.id === prereq)
                    const isCompleted = completedIds.includes(prereq)
                    return (
                      <div key={prereq} className={`text-xs ${isCompleted ? "text-green-400" : "text-red-400"}`}>
                        • {prereqResearch?.name || prereq}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="space-y-8">
      {(Object.keys(TREE_CONFIG) as ResearchTree[]).map((treeKey) => {
        const treeConfig = TREE_CONFIG[treeKey]
        const treeResearch = getResearchByTree(treeKey)
        const TreeIcon = treeConfig.icon

        // Group by tier
        const researchByTier = treeResearch.reduce(
          (acc, research) => {
            if (!acc[research.tier]) acc[research.tier] = []
            acc[research.tier].push(research)
            return acc
          },
          {} as Record<number, typeof treeResearch>,
        )

        return (
          <Card key={treeKey} className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${treeConfig.color}`}>
                <TreeIcon className="h-5 w-5" />
                {treeConfig.name}
                <Badge variant="outline" className="ml-auto border-slate-600 text-slate-400">
                  {completedIds.filter((id) => RESEARCH_DATA.find((r) => r.id === id)?.tree === treeKey).length} /{" "}
                  {treeResearch.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(researchByTier)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([tier, researches]) => (
                    <div key={tier}>
                      <h4 className="text-sm font-medium text-slate-300 mb-3">Tier {tier}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {researches.map(renderResearchCard)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
