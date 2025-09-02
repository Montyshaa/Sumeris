import type { BuildingType, Resources } from "./types"

export const BUILDING_TYPES: { [key: string]: BuildingType } = {
  hq: {
    id: "hq",
    name: "Nexo Cívico",
    description: "Centro de comando que define el nivel de tu ciudad",
    icon: "🏛️",
    maxLevel: 10,
    baseCost: {
      materials: 100,
      energy: 50,
      data: 20,
      talent: 0,
      civicCredit: 0,
    },
    baseProduction: {},
    baseTime: 5, // 5 minutes
    levelBenefits: {
      3: "Desbloquea políticas",
      5: "Segunda cola de construcción",
      7: "Primera órbita",
      10: "Segunda órbita",
    },
  },
  factory: {
    id: "factory",
    name: "Fábrica Modular",
    description: "Produce materiales para construcción",
    icon: "🏭",
    maxLevel: 10,
    baseCost: {
      materials: 80,
      energy: 40,
      data: 10,
      talent: 0,
      civicCredit: 0,
    },
    baseProduction: {
      materials: 5,
    },
    baseTime: 10,
    levelBenefits: {
      4: "Protección de almacén mejorada",
      7: "Modo Eco (-10% MAT, +5% SUS)",
      10: "Reducción de incidentes",
    },
  },
  powerPlant: {
    id: "powerPlant",
    name: "Planta Solar/Fusión",
    description: "Genera energía para la ciudad",
    icon: "⚡",
    maxLevel: 10,
    baseCost: {
      materials: 120,
      energy: 20,
      data: 15,
      talent: 0,
      civicCredit: 0,
    },
    baseProduction: {
      energy: 8,
    },
    baseTime: 15,
    levelBenefits: {
      5: "Modo Eco (+8 SUS, -15% ENG por 60min)",
      8: "Baterías de almacenamiento",
    },
  },
  dataCenter: {
    id: "dataCenter",
    name: "Nube de Datos",
    description: "Procesa datos para investigación",
    icon: "💾",
    maxLevel: 10,
    baseCost: {
      materials: 60,
      energy: 80,
      data: 30,
      talent: 0,
      civicCredit: 0,
    },
    baseProduction: {
      data: 4,
    },
    baseTime: 12,
    levelBenefits: {
      3: "Desbloquea Parque de IA",
      6: "Reduce coste DAT en I+D",
      9: "Auditoría preventiva (+LEG)",
    },
  },
  university: {
    id: "university",
    name: "Universidad/Incubadora",
    description: "Forma talento especializado",
    icon: "🎓",
    maxLevel: 10,
    baseCost: {
      materials: 150,
      energy: 60,
      data: 40,
      talent: 1,
      civicCredit: 0,
    },
    baseProduction: {
      talent: 0.2,
    },
    baseTime: 20,
    levelBenefits: {
      4: "Duplica generación si WB ≥ 70",
      7: "Desbloquea Mediadores",
      10: "Equipos de captación",
    },
  },
  socialCenter: {
    id: "socialCenter",
    name: "Centro Social",
    description: "Mejora el bienestar y genera crédito cívico",
    icon: "🏢",
    maxLevel: 10,
    baseCost: {
      materials: 90,
      energy: 30,
      data: 20,
      talent: 0,
      civicCredit: 10,
    },
    baseProduction: {
      civicCredit: 3,
    },
    baseTime: 8,
    levelBenefits: {
      2: "+5 WB permanente",
      5: "+5 WB permanente",
      8: "+5 WB permanente",
    },
  },
  spaceport: {
    id: "spaceport",
    name: "Espaciopuerto",
    description: "Entrena unidades y accede a órbitas",
    icon: "🚀",
    maxLevel: 10,
    baseCost: {
      materials: 200,
      energy: 100,
      data: 50,
      talent: 2,
      civicCredit: 0,
    },
    baseProduction: {},
    baseTime: 30,
    unlockRequirements: {
      hqLevel: 3,
    },
    levelBenefits: {
      1: "Entrena Drones (1 slot)",
      4: "Entrena Blindados",
      5: "Segunda cola de entrenamiento",
      7: "Entrena Corbetas",
      10: "Tercera cola de entrenamiento",
    },
  },
}

// Utility functions for building calculations
export const calculateBuildingCost = (buildingType: BuildingType, targetLevel: number): Resources => {
  const multiplier = Math.pow(1.6, targetLevel - 1)
  return {
    materials: Math.floor(buildingType.baseCost.materials * multiplier),
    energy: Math.floor(buildingType.baseCost.energy * multiplier),
    data: Math.floor(buildingType.baseCost.data * multiplier),
    talent: Math.floor(buildingType.baseCost.talent * multiplier * 10) / 10,
    civicCredit: Math.floor(buildingType.baseCost.civicCredit * multiplier),
  }
}

export const calculateBuildingTime = (buildingType: BuildingType, targetLevel: number): number => {
  // Time scales from base time to 8 hours (480 minutes) at level 10
  const timeMultiplier = Math.pow(1.5, targetLevel - 1)
  return Math.min(buildingType.baseTime * timeMultiplier, 480)
}

export const calculateBuildingProduction = (buildingType: BuildingType, level: number): Partial<Resources> => {
  const multiplier = Math.pow(1.4, level - 1)
  const production: Partial<Resources> = {}

  Object.entries(buildingType.baseProduction).forEach(([resource, baseAmount]) => {
    if (baseAmount && baseAmount > 0) {
      production[resource as keyof Resources] = Math.floor(baseAmount * multiplier * 10) / 10
    }
  })

  return production
}

export const checkBuildingUnlockRequirements = (
  buildingType: BuildingType,
  getBuildingLevel: (id: string) => number,
): { unlocked: boolean; missingRequirements: string[] } => {
  const missingRequirements: string[] = []

  if (buildingType.unlockRequirements) {
    if (buildingType.unlockRequirements.hqLevel) {
      const currentHqLevel = getBuildingLevel("hq")
      if (currentHqLevel < buildingType.unlockRequirements.hqLevel) {
        missingRequirements.push(`Nexo Cívico nivel ${buildingType.unlockRequirements.hqLevel}`)
      }
    }

    if (buildingType.unlockRequirements.buildingLevel) {
      Object.entries(buildingType.unlockRequirements.buildingLevel).forEach(([buildingId, requiredLevel]) => {
        const currentLevel = getBuildingLevel(buildingId)
        if (currentLevel < requiredLevel) {
          const requiredBuilding = BUILDING_TYPES[buildingId]
          missingRequirements.push(`${requiredBuilding?.name || buildingId} nivel ${requiredLevel}`)
        }
      })
    }
  }

  return {
    unlocked: missingRequirements.length === 0,
    missingRequirements,
  }
}

export const getActiveLevelBenefits = (buildingType: BuildingType, currentLevel: number): string[] => {
  const benefits: string[] = []

  Object.entries(buildingType.levelBenefits).forEach(([level, benefit]) => {
    if (Number.parseInt(level) <= currentLevel) {
      benefits.push(`L${level}: ${benefit}`)
    }
  })

  return benefits
}

export const getNextLevelBenefit = (buildingType: BuildingType, currentLevel: number): string | null => {
  const nextLevel = currentLevel + 1
  return buildingType.levelBenefits[nextLevel] || null
}

export interface BuildingEffect {
  type: "production_bonus" | "index_bonus" | "unlock_feature" | "cost_reduction"
  target?: string
  value?: number
  condition?: string
}

export const getBuildingEffects = (buildingId: string, level: number): BuildingEffect[] => {
  const effects: BuildingEffect[] = []

  switch (buildingId) {
    case "socialCenter":
      // Social Center provides permanent welfare bonuses
      if (level >= 2) effects.push({ type: "index_bonus", target: "welfare", value: 5 })
      if (level >= 5) effects.push({ type: "index_bonus", target: "welfare", value: 5 })
      if (level >= 8) effects.push({ type: "index_bonus", target: "welfare", value: 5 })
      break

    case "university":
      // University doubles talent generation if welfare >= 70
      if (level >= 4) {
        effects.push({
          type: "production_bonus",
          target: "talent",
          value: 2,
          condition: "welfare >= 70",
        })
      }
      break

    case "dataCenter":
      // Data Center reduces research costs
      if (level >= 6) {
        effects.push({ type: "cost_reduction", target: "research_data", value: 0.15 })
      }
      // Audit prevention increases legitimacy
      if (level >= 9) {
        effects.push({ type: "index_bonus", target: "legitimacy", value: 5 })
      }
      break

    case "factory":
      // Factory eco mode affects sustainability
      if (level >= 7) {
        effects.push({ type: "index_bonus", target: "sustainability", value: 5 })
      }
      break

    case "powerPlant":
      // Power plant eco mode affects sustainability
      if (level >= 5) {
        effects.push({ type: "index_bonus", target: "sustainability", value: 8 })
      }
      break

    case "spaceport":
      // Spaceport provides training efficiency bonuses
      if (level >= 3) {
        effects.push({ type: "cost_reduction", target: "unit_materials", value: 0.1 })
      }
      if (level >= 6) {
        effects.push({ type: "cost_reduction", target: "training_time", value: 0.15 })
      }
      if (level >= 9) {
        effects.push({ type: "production_bonus", target: "unit_capacity", value: 1.2 })
      }
      break
  }

  return effects
}
