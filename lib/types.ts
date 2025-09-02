export interface Resources {
  materials: number // MAT - materiales para construir
  energy: number // ENG - potencia edificios e investigación
  data: number // DAT - habilitan investigación y optimizaciones IA
  talent: number // HR - especialistas humanos
  civicCredit: number // CC - moneda lenta para políticas
}

export interface Indices {
  welfare: number // WB - bienestar (0-100)
  sustainability: number // SUS - sostenibilidad (0-100)
  legitimacy: number // LEG - legitimidad (0-100)
}

export interface GameState {
  playerId: string
  playerName: string
  resources: Resources
  indices: Indices
  lastUpdate: number
  productionRates: Resources
  buildings: Building[]
  constructionQueues: ConstructionQueue[]
  completedResearch: CompletedResearch[]
  researchQueue: ResearchQueue[]
  activePolicies: ActivePolicy[]
  playerMissions: PlayerMission[]
  tutorialDay: number
  units: Unit[]
  trainingQueues: TrainingQueue[]
  army: Army
  mapState: MapState // Added map state
}

// Multiplicadores de producción según índices
export const getProductionMultiplier = (indexValue: number): number => {
  if (indexValue >= 80) return 1.1 // +10%
  if (indexValue >= 60) return 1.0 // 0%
  if (indexValue >= 40) return 0.9 // -10%
  return 0.8 // -20%
}

export interface Building {
  id: string
  type: BuildingType
  level: number
  isUpgrading: boolean
  upgradeFinishTime?: number
}

export interface BuildingType {
  id: string
  name: string
  description: string
  icon: string
  maxLevel: number
  baseCost: Resources
  baseProduction: Partial<Resources>
  baseTime: number // minutes
  unlockRequirements?: {
    buildingLevel?: { [buildingId: string]: number }
    hqLevel?: number
  }
  levelBenefits: { [level: number]: string }
}

export interface ConstructionQueue {
  id: string
  buildingId: string
  targetLevel: number
  startTime: number
  finishTime: number
  cost: Resources
}

export interface Research {
  id: string
  name: string
  description: string
  tree: ResearchTree
  tier: number
  cost: Resources
  timeMinutes: number
  prerequisites?: string[]
  effects: ResearchEffect[]
  icon: string
}

export interface ResearchEffect {
  type: "resource_production" | "index_bonus" | "building_bonus" | "unlock_feature" | "cost_reduction"
  target?: string
  value: number
  description: string
}

export interface ResearchQueue {
  id: string
  researchId: string
  startTime: number
  finishTime: number
  cost: Resources
}

export interface CompletedResearch {
  researchId: string
  completedAt: number
}

export type ResearchTree = "socioeconomic" | "ecotech" | "aero-ai"

export interface Policy {
  id: string
  name: string
  description: string
  cost: number // CC cost to activate
  duration: number // minutes, 0 for permanent until deactivated
  cooldown: number // minutes before can be activated again
  effects: PolicyEffect[]
  icon: string
  category: PolicyCategory
}

export interface PolicyEffect {
  type: "resource_production" | "resource_cost" | "index_modifier" | "building_bonus" | "special"
  target?: string
  value: number
  description: string
}

export interface ActivePolicy {
  policyId: string
  activatedAt: number
  expiresAt?: number // undefined for permanent policies
  lastDeactivated?: number // for cooldown tracking
}

export type PolicyCategory = "economic" | "social" | "environmental" | "security"

export interface Mission {
  id: string
  name: string
  description: string
  day: number // 1, 2, or 3
  order: number // order within the day
  type: MissionType
  objective: MissionObjective
  reward: MissionReward
  icon: string
}

export type MissionType = "build" | "produce" | "research" | "policy" | "maintain" | "explore"

export interface MissionObjective {
  type: MissionType
  target?: string // building id, resource type, research id, policy id
  value: number // target level, amount, duration
  currentValue?: number // for tracking progress
}

export interface MissionReward {
  resources?: Partial<Resources>
  indices?: Partial<Indices>
  special?: string // special rewards like cosmetic items
}

export interface PlayerMission {
  missionId: string
  startedAt: number
  completedAt?: number
  progress: number // 0-1
}

export interface Unit {
  id: string
  type: UnitType
  count: number
  isTraining: boolean
  trainingFinishTime?: number
}

export interface UnitType {
  id: string
  name: string
  description: string
  icon: string
  cost: Resources
  trainingTime: number // minutes
  unlockRequirements: {
    buildingLevel?: { [buildingId: string]: number }
  }
  stats: UnitStats
  specialAbilities: string[]
}

export interface UnitStats {
  attack: number
  defense: number
  speed: number
  capacity: number // for resource carrying
  maintenance: Partial<Resources> // ongoing costs per unit
}

export interface TrainingQueue {
  id: string
  unitTypeId: string
  quantity: number
  startTime: number
  finishTime: number
  cost: Resources
}

export interface Army {
  units: Unit[]
  totalPower: number
  maintenanceCost: Resources
}

export interface Territory {
  id: string
  name: string
  type: TerritoryType
  position: { x: number; y: number }
  ownerId?: string
  ownerName?: string
  bonusType: BonusType
  bonusValue: number
  isExplored: boolean
  lastConflictTime?: number
  defenseLevel: number
  estimatedPower?: number
}

export interface Orbit {
  id: string
  name: string
  radius: number
  slots: OrbitSlot[]
  unlockRequirements: {
    hqLevel: number
  }
}

export interface OrbitSlot {
  id: string
  position: number // 0-360 degrees
  ownerId?: string
  ownerName?: string
  stationType?: string
  isOccupied: boolean
}

export type TerritoryType = "district" | "orbit"
export type BonusType = "materials" | "energy" | "data" | "talent" | "mixed"

export interface MapState {
  territories: Territory[]
  orbits: Orbit[]
  playerTerritories: string[] // territory IDs controlled by current player
  exploredTerritories: string[] // territory IDs explored by current player
}

export interface ScoutReport {
  territoryId: string
  scoutedAt: number
  estimatedPower: number
  resources: Partial<Resources>
  defenseInfo: string
  ownerInfo?: {
    name: string
    indices: Partial<Indices>
  }
}
