"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useGameStore } from "@/lib/game-state"
import { getPoliciesByCategory } from "@/lib/policies-data"
import type { Policy, PolicyCategory } from "@/lib/types"
import { Clock, Zap, Shield, Leaf, DollarSign, Info, CheckCircle, XCircle } from "lucide-react"

const categoryIcons: Record<PolicyCategory, any> = {
  economic: DollarSign,
  social: Zap,
  environmental: Leaf,
  security: Shield,
}

const categoryColors: Record<PolicyCategory, string> = {
  economic: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  social: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  environmental: "text-green-400 bg-green-400/10 border-green-400/30",
  security: "text-red-400 bg-red-400/10 border-red-400/30",
}

interface PolicyCardProps {
  policy: Policy
}

function PolicyCard({ policy }: PolicyCardProps) {
  const {
    resources,
    activatePolicy,
    deactivatePolicy,
    canActivatePolicy,
    isPolicyActive,
    isPolicyOnCooldown,
    getBuildingLevel,
  } = useGameStore()

  const isActive = isPolicyActive(policy.id)
  const onCooldown = isPolicyOnCooldown(policy.id)
  const canAfford = resources.civicCredit >= policy.cost
  const canActivate = canActivatePolicy(policy.id)
  const hqLevel = getBuildingLevel("hq")
  const isUnlocked = hqLevel >= 3

  const handleToggle = () => {
    if (isActive) {
      deactivatePolicy(policy.id)
    } else {
      activatePolicy(policy.id)
    }
  }

  const getStatusColor = () => {
    if (isActive) return "border-green-400 bg-green-400/5"
    if (onCooldown) return "border-orange-400 bg-orange-400/5"
    if (!canActivate) return "border-slate-600 bg-slate-800/30"
    return "border-slate-700 bg-slate-800/50"
  }

  const getStatusText = () => {
    if (!isUnlocked) return "Requiere HQ nivel 3"
    if (isActive) return "Activa"
    if (onCooldown) return "En recarga"
    if (!canAfford) return `Requiere ${policy.cost} CC`
    return "Disponible"
  }

  const CategoryIcon = categoryIcons[policy.category]

  return (
    <Card className={`${getStatusColor()} transition-all duration-200 hover:border-cyan-400/50`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColors[policy.category]}`}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-white text-sm font-medium">{policy.name}</CardTitle>
              <Badge variant="outline" className={`text-xs mt-1 ${categoryColors[policy.category]}`}>
                {policy.category === "economic" && "Económica"}
                {policy.category === "social" && "Social"}
                {policy.category === "environmental" && "Ambiental"}
                {policy.category === "security" && "Seguridad"}
              </Badge>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-slate-400 hover:text-slate-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p className="text-sm">{policy.description}</p>
                  <div className="space-y-1">
                    {policy.effects.map((effect, index) => (
                      <div key={index} className="text-xs text-slate-300">
                        • {effect.description}
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-slate-400 text-xs leading-relaxed">{policy.description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Coste:</span>
            <span className={`font-mono ${canAfford ? "text-cyan-400" : "text-red-400"}`}>{policy.cost} CC</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Duración:</span>
            <span className="text-slate-300 font-mono">
              {policy.duration === 0 ? "Permanente" : `${policy.duration}min`}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Recarga:</span>
            <span className="text-slate-300 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {policy.cooldown}min
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-xs ${
              isActive
                ? "border-green-400 text-green-400"
                : onCooldown
                  ? "border-orange-400 text-orange-400"
                  : !isUnlocked
                    ? "border-slate-500 text-slate-500"
                    : "border-slate-600 text-slate-400"
            }`}
          >
            {isActive && <CheckCircle className="w-3 h-3 mr-1" />}
            {onCooldown && <Clock className="w-3 h-3 mr-1" />}
            {!canActivate && !isActive && !onCooldown && <XCircle className="w-3 h-3 mr-1" />}
            {getStatusText()}
          </Badge>

          <Button
            size="sm"
            variant={isActive ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={!isUnlocked || (!isActive && !canActivate)}
            className={
              isActive
                ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                : "bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30"
            }
          >
            {isActive ? "Desactivar" : "Activar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PoliciesGrid() {
  const { getActivePolicyCount } = useGameStore()
  const activePolicyCount = getActivePolicyCount()

  const categories: PolicyCategory[] = ["economic", "social", "environmental", "security"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-medium">Políticas Disponibles</h3>
        </div>
        <Badge variant="outline" className="border-cyan-400 text-cyan-400">
          {activePolicyCount}/3 Activas
        </Badge>
      </div>

      {categories.map((category) => {
        const policies = getPoliciesByCategory(category)
        const CategoryIcon = categoryIcons[category]

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${categoryColors[category]}`}>
                <CategoryIcon className="w-3 h-3" />
              </div>
              <h4 className="text-slate-300 font-medium capitalize">
                {category === "economic" && "Políticas Económicas"}
                {category === "social" && "Políticas Sociales"}
                {category === "environmental" && "Políticas Ambientales"}
                {category === "security" && "Políticas de Seguridad"}
              </h4>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {policies.map((policy) => (
                <PolicyCard key={policy.id} policy={policy} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
