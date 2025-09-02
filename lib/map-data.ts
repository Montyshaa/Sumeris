import type { Territory, Orbit, BonusType } from "./types"

// 12 distritos en cuadrícula 3x4 según especificación del documento
export const TERRITORIES: Territory[] = [
  // Fila 1
  {
    id: "district-1",
    name: "Centro Urbano",
    type: "district",
    position: { x: 0, y: 0 },
    bonusType: "mixed",
    bonusValue: 15,
    isExplored: false,
    defenseLevel: 1,
  },
  {
    id: "district-2",
    name: "Zona Industrial",
    type: "district",
    position: { x: 1, y: 0 },
    bonusType: "materials",
    bonusValue: 25,
    isExplored: false,
    defenseLevel: 1,
  },
  {
    id: "district-3",
    name: "Complejo Energético",
    type: "district",
    position: { x: 2, y: 0 },
    bonusType: "energy",
    bonusValue: 20,
    isExplored: false,
    defenseLevel: 1,
  },

  // Fila 2
  {
    id: "district-4",
    name: "Distrito Residencial",
    type: "district",
    position: { x: 0, y: 1 },
    bonusType: "talent",
    bonusValue: 18,
    isExplored: false,
    defenseLevel: 1,
  },
  {
    id: "district-5",
    name: "Hub Tecnológico",
    type: "district",
    position: { x: 1, y: 1 },
    bonusType: "data",
    bonusValue: 22,
    isExplored: false,
    defenseLevel: 2,
  },
  {
    id: "district-6",
    name: "Puerto Comercial",
    type: "district",
    position: { x: 2, y: 1 },
    bonusType: "mixed",
    bonusValue: 12,
    isExplored: false,
    defenseLevel: 1,
  },

  // Fila 3
  {
    id: "district-7",
    name: "Sector Minero",
    type: "district",
    position: { x: 0, y: 2 },
    bonusType: "materials",
    bonusValue: 30,
    isExplored: false,
    defenseLevel: 2,
  },
  {
    id: "district-8",
    name: "Campus Universitario",
    type: "district",
    position: { x: 1, y: 2 },
    bonusType: "talent",
    bonusValue: 25,
    isExplored: false,
    defenseLevel: 1,
  },
  {
    id: "district-9",
    name: "Central de Datos",
    type: "district",
    position: { x: 2, y: 2 },
    bonusType: "data",
    bonusValue: 28,
    isExplored: false,
    defenseLevel: 2,
  },

  // Fila 4
  {
    id: "district-10",
    name: "Zona Fronteriza",
    type: "district",
    position: { x: 0, y: 3 },
    bonusType: "mixed",
    bonusValue: 10,
    isExplored: false,
    defenseLevel: 3,
  },
  {
    id: "district-11",
    name: "Reserva Energética",
    type: "district",
    position: { x: 1, y: 3 },
    bonusType: "energy",
    bonusValue: 35,
    isExplored: false,
    defenseLevel: 3,
  },
  {
    id: "district-12",
    name: "Enclave Estratégico",
    type: "district",
    position: { x: 2, y: 3 },
    bonusType: "mixed",
    bonusValue: 20,
    isExplored: false,
    defenseLevel: 3,
  },
]

// 2 órbitas según especificación del documento
export const ORBITS: Orbit[] = [
  {
    id: "orbit-1",
    name: "Órbita Baja",
    radius: 180,
    unlockRequirements: { hqLevel: 7 },
    slots: [
      { id: "orbit-1-slot-1", position: 0, isOccupied: false },
      { id: "orbit-1-slot-2", position: 90, isOccupied: false },
      { id: "orbit-1-slot-3", position: 180, isOccupied: false },
      { id: "orbit-1-slot-4", position: 270, isOccupied: false },
    ],
  },
  {
    id: "orbit-2",
    name: "Órbita Alta",
    radius: 240,
    unlockRequirements: { hqLevel: 10 },
    slots: [
      { id: "orbit-2-slot-1", position: 45, isOccupied: false },
      { id: "orbit-2-slot-2", position: 135, isOccupied: false },
      { id: "orbit-2-slot-3", position: 225, isOccupied: false },
      { id: "orbit-2-slot-4", position: 315, isOccupied: false },
    ],
  },
]

export const getBonusIcon = (bonusType: BonusType): string => {
  switch (bonusType) {
    case "materials":
      return "🏭"
    case "energy":
      return "⚡"
    case "data":
      return "💾"
    case "talent":
      return "👥"
    case "mixed":
      return "🌟"
    default:
      return "❓"
  }
}

export const getBonusColor = (bonusType: BonusType): string => {
  switch (bonusType) {
    case "materials":
      return "#f59e0b" // amber
    case "energy":
      return "#eab308" // yellow
    case "data":
      return "#06b6d4" // cyan
    case "talent":
      return "#8b5cf6" // violet
    case "mixed":
      return "#10b981" // emerald
    default:
      return "#6b7280" // gray
  }
}

export const getDefenseLevelColor = (level: number): string => {
  switch (level) {
    case 1:
      return "#22c55e" // green - easy
    case 2:
      return "#f59e0b" // amber - medium
    case 3:
      return "#ef4444" // red - hard
    default:
      return "#6b7280" // gray
  }
}
