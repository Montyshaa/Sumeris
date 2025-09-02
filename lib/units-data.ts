import type { UnitType, Resources, Unit } from "./types"

export const UNIT_TYPES: { [key: string]: UnitType } = {
  drone: {
    id: "drone",
    name: "Drones Ligeros",
    description: "Unidades baratas y rápidas, ideales para reconocimiento y saqueo de recursos.",
    icon: "🚁",
    cost: {
      materials: 50,
      energy: 30,
      data: 10,
      talent: 0,
      civicCredit: 0,
    },
    trainingTime: 15, // 15 minutes
    unlockRequirements: {
      buildingLevel: { spaceport: 1 },
    },
    stats: {
      attack: 25,
      defense: 15,
      speed: 90,
      capacity: 20,
      maintenance: {
        materials: 0,
        energy: 2,
        data: 0,
        talent: 0,
        civicCredit: 0,
      },
    },
    specialAbilities: [
      "Saqueo +10%: Obtienen 10% más recursos en ataques exitosos",
      "Velocidad alta: Se mueven más rápido que otras unidades",
      "Frágiles: Vulnerables a defensas anti-aéreas",
    ],
  },

  armored: {
    id: "armored",
    name: "Blindados Urbanos",
    description: "Unidades pesadas especializadas en asalto y destrucción de fortificaciones.",
    icon: "🚗",
    cost: {
      materials: 150,
      energy: 80,
      data: 20,
      talent: 1,
      civicCredit: 0,
    },
    trainingTime: 45, // 45 minutes
    unlockRequirements: {
      buildingLevel: { spaceport: 4 },
    },
    stats: {
      attack: 80,
      defense: 70,
      speed: 40,
      capacity: 50,
      maintenance: {
        materials: 2,
        energy: 5,
        data: 0,
        talent: 0,
        civicCredit: 0,
      },
    },
    specialAbilities: [
      "Anti-fortificación: +50% daño contra defensas",
      "Blindaje pesado: Resistente a ataques ligeros",
      "Lento: Velocidad reducida en combate",
    ],
  },

  mediator: {
    id: "mediator",
    name: "Mediadores",
    description: "Especialistas diplomáticos que reducen penalizaciones y facilitan captación de talento.",
    icon: "👥",
    cost: {
      materials: 80,
      energy: 40,
      data: 60,
      talent: 2,
      civicCredit: 10,
    },
    trainingTime: 60, // 1 hour
    unlockRequirements: {
      buildingLevel: { university: 7 },
    },
    stats: {
      attack: 20,
      defense: 30,
      speed: 60,
      capacity: 10,
      maintenance: {
        materials: 0,
        energy: 1,
        data: 2,
        talent: 0,
        civicCredit: 1,
      },
    },
    specialAbilities: [
      "Diplomacia: Reduce penalizaciones de legitimidad en ataques",
      "Captación: +25% probabilidad de captar talento enemigo",
      "Apoyo: Mejora moral de otras unidades",
    ],
  },

  corvette: {
    id: "corvette",
    name: "Corbetas Orbitales",
    description: "Naves espaciales que dominan las órbitas y proporcionan superioridad aérea.",
    icon: "🚀",
    cost: {
      materials: 300,
      energy: 200,
      data: 150,
      talent: 3,
      civicCredit: 0,
    },
    trainingTime: 120, // 2 hours
    unlockRequirements: {
      buildingLevel: { spaceport: 7 },
    },
    stats: {
      attack: 120,
      defense: 90,
      speed: 100,
      capacity: 80,
      maintenance: {
        materials: 5,
        energy: 10,
        data: 3,
        talent: 0,
        civicCredit: 0,
      },
    },
    specialAbilities: [
      "Orbital: Puede atacar desde órbitas",
      "Superioridad aérea: +30% daño contra drones",
      "Aura defensiva: +15% defensa a distritos controlados",
    ],
  },
}

// Helper functions for unit calculations
export const calculateUnitCost = (unitType: UnitType, quantity: number): Resources => {
  return {
    materials: unitType.cost.materials * quantity,
    energy: unitType.cost.energy * quantity,
    data: unitType.cost.data * quantity,
    talent: unitType.cost.talent * quantity,
    civicCredit: unitType.cost.civicCredit * quantity,
  }
}

export const calculateTrainingTime = (unitType: UnitType, quantity: number): number => {
  // Training time scales with quantity but with diminishing returns
  return Math.ceil(unitType.trainingTime * quantity * 0.8)
}

export const calculateArmyPower = (units: Unit[]): number => {
  return units.reduce((total, unit) => {
    const unitType = UNIT_TYPES[unit.type.id]
    if (!unitType) return total

    const unitPower = (unitType.stats.attack + unitType.stats.defense) / 2
    return total + unitPower * unit.count
  }, 0)
}

export const calculateMaintenanceCost = (units: Unit[]): Resources => {
  return units.reduce(
    (total, unit) => {
      const unitType = UNIT_TYPES[unit.type.id]
      if (!unitType) return total

      return {
        materials: total.materials + (unitType.stats.maintenance.materials || 0) * unit.count,
        energy: total.energy + (unitType.stats.maintenance.energy || 0) * unit.count,
        data: total.data + (unitType.stats.maintenance.data || 0) * unit.count,
        talent: total.talent + (unitType.stats.maintenance.talent || 0) * unit.count,
        civicCredit: total.civicCredit + (unitType.stats.maintenance.civicCredit || 0) * unit.count,
      }
    },
    { materials: 0, energy: 0, data: 0, talent: 0, civicCredit: 0 },
  )
}
