import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  GameState,
  Resources,
  Indices,
  ConstructionQueue,
  ResearchQueue,
  ActivePolicy,
  PlayerMission,
  TrainingQueue,
  ScoutReport,
  Territory,
} from "./types"
import { GameDatabase } from "./database"
import {
  BUILDING_TYPES,
  calculateBuildingCost,
  calculateBuildingTime,
  calculateBuildingProduction,
  getBuildingEffects,
} from "./buildings-data"
import { getResearchById, getAvailableResearch } from "./research-data"
import { getPolicyById } from "./policies-data"
import { getMissionsByDay, getMissionById } from "./missions-data"
import {
  UNIT_TYPES,
  calculateUnitCost,
  calculateTrainingTime,
  calculateArmyPower,
  calculateMaintenanceCost,
} from "./units-data"
import { TERRITORIES, ORBITS } from "@/lib/map-data"

interface GameStore extends GameState {
  // Actions
  updateResources: (resources: Partial<Resources>) => void
  updateIndices: (indices: Partial<Indices>) => void
  setPlayerInfo: (playerId: string, playerName: string) => Promise<void>
  calculateProduction: () => void
  syncWithDatabase: () => void
  reset: () => void
  // Building-related actions
  startConstruction: (buildingId: string) => boolean
  finishConstruction: (queueId: string) => void
  processConstructionQueues: () => void
  getBuildingLevel: (buildingId: string) => number
  canAffordBuilding: (buildingId: string, targetLevel: number) => boolean
  getAvailableConstructionSlots: () => number
  cancelConstruction: (queueId: string) => boolean
  getTotalProductionRates: () => Resources
  // Unlock system methods
  isBuildingUnlocked: (buildingId: string) => boolean
  getBuildingUnlockRequirements: (buildingId: string) => string[]
  applyBuildingEffects: () => void
  getEffectiveIndices: () => Indices
  startResearch: (researchId: string) => boolean
  finishResearch: (queueId: string) => void
  processResearchQueues: () => void
  canAffordResearch: (researchId: string) => boolean
  isResearchAvailable: (researchId: string) => boolean
  isResearchCompleted: (researchId: string) => boolean
  cancelResearch: (queueId: string) => boolean
  getAvailableResearchSlots: () => number
  applyResearchEffects: () => void
  getCompletedResearchIds: () => string[]
  // Policy system methods
  activatePolicy: (policyId: string) => boolean
  deactivatePolicy: (policyId: string) => boolean
  canActivatePolicy: (policyId: string) => boolean
  isPolicyActive: (policyId: string) => boolean
  isPolicyOnCooldown: (policyId: string) => boolean
  getActivePolicyCount: () => number
  processPolicyExpiration: () => void
  applyPolicyEffects: () => void
  getPolicyEffectiveIndices: () => Indices
  getPolicyEffectiveProductionRates: () => Resources
  // Mission system methods
  initializeMissions: () => void
  checkMissionProgress: () => void
  completeMission: (missionId: string) => boolean
  getMissionProgress: (missionId: string) => number
  isMissionCompleted: (missionId: string) => boolean
  isMissionAvailable: (missionId: string) => boolean
  advanceTutorialDay: () => void
  getCurrentDayMissions: () => PlayerMission[]
  startTraining: (unitTypeId: string, quantity: number) => boolean
  finishTraining: (queueId: string) => void
  processTrainingQueues: () => void
  canAffordTraining: (unitTypeId: string, quantity: number) => boolean
  isUnitUnlocked: (unitTypeId: string) => boolean
  getUnitUnlockRequirements: (unitTypeId: string) => string[]
  getUnitCount: (unitTypeId: string) => number
  getTotalArmyPower: () => number
  getMaintenanceCost: () => Resources
  cancelTraining: (queueId: string) => boolean
  getAvailableTrainingSlots: () => number
  exploreTerritory: (territoryId: string) => boolean
  controlTerritory: (territoryId: string) => boolean
  getTerritoryBonuses: () => Resources
  isOrbitUnlocked: (orbitId: string) => boolean
  getControlledTerritories: () => string[]
  getExploredTerritories: () => string[]
  initializeMapState: () => void
  getHQLevel: () => number
  scoutTerritory: (territoryId: string) => ScoutReport | null
  getExplorationCost: (territoryId: string) => Resources
  canAffordExploration: (territoryId: string) => boolean
  getExplorationRewards: (territoryId: string) => Resources
  getTerritoryInfo: (territoryId: string) => Territory | null
}

const initialResources: Resources = {
  materials: 1000,
  energy: 500,
  data: 200,
  talent: 5,
  civicCredit: 50,
}

const initialIndices: Indices = {
  welfare: 60,
  sustainability: 55,
  legitimacy: 65,
}

const initialProductionRates: Resources = {
  materials: 10,
  energy: 8,
  data: 3,
  talent: 0.1,
  civicCredit: 2,
}

const TIME_ACCELERATION = 20 // 20x faster for testing

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      playerId: "",
      playerName: "",
      resources: initialResources,
      indices: initialIndices,
      lastUpdate: Date.now(),
      productionRates: initialProductionRates,
      // Initial building state
      buildings: [{ id: "hq", type: BUILDING_TYPES.hq, level: 1, isUpgrading: false }],
      constructionQueues: [],
      completedResearch: [],
      researchQueue: [],
      // Initial active policies state
      activePolicies: [],
      // Initial mission system state
      playerMissions: [],
      tutorialDay: 1,
      units: [],
      trainingQueues: [],
      army: {
        units: [],
        totalPower: 0,
        maintenanceCost: { materials: 0, energy: 0, data: 0, talent: 0, civicCredit: 0 },
      },
      mapState: {
        territories: [],
        orbits: [],
        playerTerritories: [],
        exploredTerritories: [],
      },

      updateResources: (newResources) =>
        set((state) => ({
          resources: { ...state.resources, ...newResources },
        })),

      updateIndices: (newIndices) =>
        set((state) => ({
          indices: { ...state.indices, ...newIndices },
        })),

      setPlayerInfo: async (playerId, playerName) => {
        set({ playerId, playerName })

        // Try to create player in database
        try {
          const db = GameDatabase.getInstance()
          await db.connect()
          const playerData = await db.createPlayer(playerName, playerId)

          if (playerData) {
            console.log("[v0] Player created in database:", playerData.name)
            // Update local state with database values if available
            set({
              resources: playerData.resources,
              indices: playerData.indices,
              lastUpdate: playerData.lastUpdate,
              buildings: playerData.buildings || [{ id: "hq", type: BUILDING_TYPES.hq, level: 1, isUpgrading: false }],
              constructionQueues: playerData.constructionQueues || [],
              completedResearch: playerData.completedResearch || [],
              researchQueue: playerData.researchQueue || [],
              activePolicies: playerData.activePolicies || [],
              playerMissions: playerData.playerMissions || [],
              tutorialDay: playerData.tutorialDay || 1,
            })
          }
        } catch (error) {
          console.error("[v0] Failed to create player in database:", error)
        }
      },

      calculateProduction: () => {
        const state = get()
        const now = Date.now()
        const timeDiff = (now - state.lastUpdate) / 1000 / 60 // minutos (no acceleration here)

        // Process construction queues first
        get().processConstructionQueues()
        get().processResearchQueues()
        // Process policy expiration
        get().processPolicyExpiration()
        get().processTrainingQueues() // Added training queue processing
        // Check mission progress
        get().checkMissionProgress()

        // Apply building effects to indices
        get().applyBuildingEffects()
        get().applyResearchEffects()
        // Apply policy effects
        get().applyPolicyEffects()

        // Allow production calculation even for small time differences for better UX
        if (timeDiff < 0.1) return

        // Get total production rates including buildings and policies
        const totalProductionRates = get().getPolicyEffectiveProductionRates()

        // Get effective indices (including building bonuses and policies)
        const effectiveIndices = get().getPolicyEffectiveIndices()

        const welfareMultiplier = getProductionMultiplier(effectiveIndices.welfare)
        const susMultiplier = getProductionMultiplier(effectiveIndices.sustainability)
        const legMultiplier = getProductionMultiplier(effectiveIndices.legitimacy)

        const avgMultiplier = (welfareMultiplier + susMultiplier + legMultiplier) / 3

        const universityLevel = get().getBuildingLevel("university")
        if (universityLevel >= 4 && effectiveIndices.welfare >= 70) {
          totalProductionRates.talent *= 2
        }

        const newResources = {
          materials: Math.max(
            0,
            Math.floor(state.resources.materials + totalProductionRates.materials * timeDiff * avgMultiplier),
          ),
          energy: Math.max(
            0,
            Math.floor(state.resources.energy + totalProductionRates.energy * timeDiff * avgMultiplier),
          ),
          data: Math.max(0, Math.floor(state.resources.data + totalProductionRates.data * timeDiff * avgMultiplier)),
          talent: Math.max(
            0,
            Math.floor((state.resources.talent + totalProductionRates.talent * timeDiff * avgMultiplier) * 10) / 10,
          ),
          civicCredit: Math.max(
            0,
            Math.floor(state.resources.civicCredit + totalProductionRates.civicCredit * timeDiff * avgMultiplier),
          ),
        }

        if (timeDiff > 1) {
          console.log("[v0] Production calculated:", {
            timeDiff: timeDiff.toFixed(2),
            avgMultiplier: avgMultiplier.toFixed(2),
            totalRates: totalProductionRates,
            effectiveIndices,
            resourcesGained: {
              materials: newResources.materials - state.resources.materials,
              energy: newResources.energy - state.resources.energy,
              data: newResources.data - state.resources.data,
              talent: +(newResources.talent - state.resources.talent).toFixed(1),
              civicCredit: newResources.civicCredit - state.resources.civicCredit,
            },
          })
        }

        set({
          resources: newResources,
          lastUpdate: now,
        })

        get().syncWithDatabase()
      },

      syncWithDatabase: async () => {
        const state = get()
        if (!state.playerId || !state.playerName) return

        try {
          const db = GameDatabase.getInstance()
          const success = await db.updatePlayerState(
            state.playerId,
            state.resources,
            state.indices,
            state.buildings,
            state.constructionQueues,
            state.completedResearch,
            state.researchQueue,
            state.activePolicies,
            state.playerMissions,
            state.tutorialDay,
            state.mapState, // Added map state to database sync
          )

          if (success) {
            console.log("[v0] State synced with database successfully")
          }
        } catch (error) {
          console.error("[v0] Failed to sync with database:", error)
        }
      },

      reset: () =>
        set({
          playerId: "",
          playerName: "",
          resources: initialResources,
          indices: initialIndices,
          lastUpdate: Date.now(),
          productionRates: initialProductionRates,
          buildings: [{ id: "hq", type: BUILDING_TYPES.hq, level: 1, isUpgrading: false }],
          constructionQueues: [],
          completedResearch: [],
          researchQueue: [],
          activePolicies: [],
          playerMissions: [],
          tutorialDay: 1,
          units: [],
          trainingQueues: [],
          army: {
            units: [],
            totalPower: 0,
            maintenanceCost: { materials: 0, energy: 0, data: 0, talent: 0, civicCredit: 0 },
          },
          mapState: {
            territories: [],
            orbits: [],
            playerTerritories: [],
            exploredTerritories: [],
          },
        }),

      startConstruction: (buildingId: string) => {
        const state = get()
        const buildingType = BUILDING_TYPES[buildingId]
        if (!buildingType) return false

        const currentLevel = get().getBuildingLevel(buildingId)
        const targetLevel = currentLevel + 1

        if (targetLevel > buildingType.maxLevel) return false
        if (!get().canAffordBuilding(buildingId, targetLevel)) return false
        if (get().getAvailableConstructionSlots() <= 0) return false

        let cost = calculateBuildingCost(buildingType, targetLevel)
        let time = calculateBuildingTime(buildingType, targetLevel)

        const completedIds = get().getCompletedResearchIds()
        completedIds.forEach((researchId) => {
          const research = getResearchById(researchId)
          if (research) {
            research.effects.forEach((effect) => {
              if (effect.type === "cost_reduction") {
                if (effect.target === "building_data" && cost.data > 0) {
                  cost = { ...cost, data: Math.floor(cost.data * (1 - effect.value)) }
                }
                if (effect.target === "building_energy" && cost.energy > 0) {
                  cost = { ...cost, energy: Math.floor(cost.energy * (1 - effect.value)) }
                }
                if (effect.target === "training_time") {
                  time = Math.floor(time * (1 - effect.value))
                }
              }
            })
          }
        })

        const now = Date.now()

        set((state) => ({
          resources: {
            materials: state.resources.materials - cost.materials,
            energy: state.resources.energy - cost.energy,
            data: state.resources.data - cost.data,
            talent: state.resources.talent - cost.talent,
            civicCredit: state.resources.civicCredit - cost.civicCredit,
          },
        }))

        const queueItem: ConstructionQueue = {
          id: `${buildingId}-${now}`,
          buildingId,
          targetLevel,
          startTime: now,
          finishTime: now + time * 60 * 1000,
          cost,
        }

        set((state) => {
          const existingBuildingIndex = state.buildings.findIndex((b) => b.id === buildingId)
          const updatedBuildings = [...state.buildings]

          if (existingBuildingIndex >= 0) {
            updatedBuildings[existingBuildingIndex] = {
              ...updatedBuildings[existingBuildingIndex],
              isUpgrading: true,
            }
          } else {
            updatedBuildings.push({
              id: buildingId,
              type: buildingType,
              level: currentLevel,
              isUpgrading: true,
            })
          }

          return {
            constructionQueues: [...state.constructionQueues, queueItem],
            buildings: updatedBuildings,
          }
        })

        console.log(`[v0] Construction started: ${buildingType.name} level ${targetLevel}`)

        setTimeout(() => get().syncWithDatabase(), 100)

        return true
      },

      finishConstruction: (queueId: string) => {
        const state = get()
        const queueItem = state.constructionQueues.find((q) => q.id === queueId)
        if (!queueItem) return

        set((state) => {
          const existingBuilding = state.buildings.find((b) => b.id === queueItem.buildingId)
          let updatedBuildings = [...state.buildings]

          if (existingBuilding) {
            updatedBuildings = state.buildings.map((building) => {
              if (building.id === queueItem.buildingId) {
                return {
                  ...building,
                  level: queueItem.targetLevel,
                  isUpgrading: false,
                }
              }
              return building
            })
          } else {
            const buildingType = BUILDING_TYPES[queueItem.buildingId]
            if (buildingType) {
              updatedBuildings.push({
                id: queueItem.buildingId,
                type: buildingType,
                level: queueItem.targetLevel,
                isUpgrading: false,
              })
            }
          }

          return {
            constructionQueues: state.constructionQueues.filter((q) => q.id !== queueId),
            buildings: updatedBuildings,
          }
        })

        console.log(`[v0] Construction completed: ${queueItem.buildingId} level ${queueItem.targetLevel}`)

        setTimeout(() => get().syncWithDatabase(), 100)
      },

      processConstructionQueues: () => {
        const state = get()
        const now = Date.now()

        state.constructionQueues.forEach((queue) => {
          if (now >= queue.finishTime) {
            get().finishConstruction(queue.id)
          }
        })
      },

      getBuildingLevel: (buildingId: string) => {
        const building = get().buildings.find((b) => b.id === buildingId)
        return building ? building.level : 0
      },

      canAffordBuilding: (buildingId: string, targetLevel: number) => {
        const state = get()
        const buildingType = BUILDING_TYPES[buildingId]
        if (!buildingType) return false

        let cost = calculateBuildingCost(buildingType, targetLevel)

        const completedIds = get().getCompletedResearchIds()
        completedIds.forEach((researchId) => {
          const research = getResearchById(researchId)
          if (research) {
            research.effects.forEach((effect) => {
              if (effect.type === "cost_reduction") {
                if (effect.target === "building_data" && cost.data > 0) {
                  cost = { ...cost, data: Math.floor(cost.data * (1 - effect.value)) }
                }
                if (effect.target === "building_energy" && cost.energy > 0) {
                  cost = { ...cost, energy: Math.floor(cost.energy * (1 - effect.value)) }
                }
              }
            })
          }
        })

        return (
          state.resources.materials >= cost.materials &&
          state.resources.energy >= cost.energy &&
          state.resources.data >= cost.data &&
          state.resources.talent >= cost.talent &&
          state.resources.civicCredit >= cost.civicCredit
        )
      },

      getAvailableConstructionSlots: () => {
        const state = get()
        const hqLevel = get().getBuildingLevel("hq")
        let maxSlots = 1

        if (hqLevel >= 5) maxSlots = 2
        if (hqLevel >= 10) maxSlots = 3

        return maxSlots - state.constructionQueues.length
      },

      cancelConstruction: (queueId: string) => {
        const state = get()
        const queueItem = state.constructionQueues.find((q) => q.id === queueId)
        if (!queueItem) return false

        const refundMultiplier = 0.75
        const refund = {
          materials: Math.floor(queueItem.cost.materials * refundMultiplier),
          energy: Math.floor(queueItem.cost.energy * refundMultiplier),
          data: Math.floor(queueItem.cost.data * refundMultiplier),
          talent: Math.floor(queueItem.cost.talent * refundMultiplier * 10) / 10,
          civicCredit: Math.floor(queueItem.cost.civicCredit * refundMultiplier),
        }

        set((state) => ({
          resources: {
            materials: state.resources.materials + refund.materials,
            energy: state.resources.energy + refund.energy,
            data: state.resources.data + refund.data,
            talent: state.resources.talent + refund.talent,
            civicCredit: state.resources.civicCredit + refund.civicCredit,
          },
          constructionQueues: state.constructionQueues.filter((q) => q.id !== queueId),
          buildings: state.buildings.map((b) => (b.id === queueItem.buildingId ? { ...b, isUpgrading: false } : b)),
        }))

        console.log(`[v0] Construction cancelled: ${queueItem.buildingId} (75% refund)`)

        setTimeout(() => get().syncWithDatabase(), 100)

        return true
      },

      startResearch: (researchId: string) => {
        const state = get()
        const research = getResearchById(researchId)
        if (!research) return false

        if (!get().canAffordResearch(researchId)) return false
        if (!get().isResearchAvailable(researchId)) return false
        if (get().getAvailableResearchSlots() <= 0) return false

        const cost = { ...research.cost }

        const completedIds = get().getCompletedResearchIds()
        completedIds.forEach((completedId) => {
          const completedResearch = getResearchById(completedId)
          if (completedResearch) {
            completedResearch.effects.forEach((effect) => {
              if (effect.type === "cost_reduction" && effect.target === "research_data" && cost.data > 0) {
                cost.data = Math.floor(cost.data * (1 - effect.value))
              }
            })
          }
        })

        const now = Date.now()

        set((state) => ({
          resources: {
            materials: state.resources.materials - cost.materials,
            energy: state.resources.energy - cost.energy,
            data: state.resources.data - cost.data,
            talent: state.resources.talent - cost.talent,
            civicCredit: state.resources.civicCredit - cost.civicCredit,
          },
        }))

        const queueItem: ResearchQueue = {
          id: `${researchId}-${now}`,
          researchId,
          startTime: now,
          finishTime: now + research.timeMinutes * 60 * 1000,
          cost,
        }

        set((state) => ({
          researchQueue: [...state.researchQueue, queueItem],
        }))

        console.log(`[v0] Research started: ${research.name}`)

        setTimeout(() => get().syncWithDatabase(), 100)

        return true
      },

      finishResearch: (queueId: string) => {
        const state = get()
        const queueItem = state.researchQueue.find((q) => q.id === queueId)
        if (!queueItem) return

        const research = getResearchById(queueItem.researchId)
        if (!research) return

        set((state) => ({
          researchQueue: state.researchQueue.filter((q) => q.id !== queueId),
          completedResearch: [
            ...state.completedResearch,
            {
              researchId: queueItem.researchId,
              completedAt: Date.now(),
            },
          ],
        }))

        console.log(`[v0] Research completed: ${research.name}`)

        setTimeout(() => get().syncWithDatabase(), 100)
      },

      processResearchQueues: () => {
        const state = get()
        const now = Date.now()

        state.researchQueue.forEach((queue) => {
          if (now >= queue.finishTime) {
            get().finishResearch(queue.id)
          }
        })
      },

      canAffordResearch: (researchId: string) => {
        const state = get()
        const research = getResearchById(researchId)
        if (!research) return false

        const cost = { ...research.cost }

        const completedIds = get().getCompletedResearchIds()
        completedIds.forEach((completedId) => {
          const completedResearch = getResearchById(completedId)
          if (completedResearch) {
            completedResearch.effects.forEach((effect) => {
              if (effect.type === "cost_reduction" && effect.target === "research_data" && cost.data > 0) {
                cost.data = Math.floor(cost.data * (1 - effect.value))
              }
            })
          }
        })

        return (
          state.resources.materials >= cost.materials &&
          state.resources.energy >= cost.energy &&
          state.resources.data >= cost.data &&
          state.resources.talent >= cost.talent &&
          state.resources.civicCredit >= cost.civicCredit
        )
      },

      isResearchAvailable: (researchId: string) => {
        const completedIds = get().getCompletedResearchIds()
        const availableResearch = getAvailableResearch(completedIds)
        return availableResearch.some((r) => r.id === researchId)
      },

      isResearchCompleted: (researchId: string) => {
        return get().completedResearch.some((r) => r.researchId === researchId)
      },

      cancelResearch: (queueId: string) => {
        const state = get()
        const queueItem = state.researchQueue.find((q) => q.id === queueId)
        if (!queueItem) return false

        const refundMultiplier = 0.75
        const refund = {
          materials: Math.floor(queueItem.cost.materials * refundMultiplier),
          energy: Math.floor(queueItem.cost.energy * refundMultiplier),
          data: Math.floor(queueItem.cost.data * refundMultiplier),
          talent: Math.floor(queueItem.cost.talent * refundMultiplier * 10) / 10,
          civicCredit: Math.floor(queueItem.cost.civicCredit * refundMultiplier),
        }

        set((state) => ({
          resources: {
            materials: state.resources.materials + refund.materials,
            energy: state.resources.energy + refund.energy,
            data: state.resources.data + refund.data,
            talent: state.resources.talent + refund.talent,
            civicCredit: state.resources.civicCredit + refund.civicCredit,
          },
          researchQueue: state.researchQueue.filter((q) => q.id !== queueId),
        }))

        const research = getResearchById(queueItem.researchId)
        console.log(`[v0] Research cancelled: ${research?.name} (75% refund)`)

        setTimeout(() => get().syncWithDatabase(), 100)

        return true
      },

      getAvailableResearchSlots: () => {
        const state = get()
        let maxSlots = 1

        const completedIds = get().getCompletedResearchIds()
        completedIds.forEach((researchId) => {
          const research = getResearchById(researchId)
          if (research) {
            research.effects.forEach((effect) => {
              if (effect.type === "unlock_feature" && effect.target === "research_slot") {
                maxSlots += effect.value
              }
            })
          }
        })

        return maxSlots - state.researchQueue.length
      },

      applyBuildingEffects: () => {
        // Building effects are applied dynamically in getEffectiveIndices() and getTotalProductionRates()
        // This method exists for consistency and future expansion
        // No direct state mutation needed as effects are calculated on-demand
      },

      applyResearchEffects: () => {
        // Research effects are applied dynamically in getEffectiveIndices() and getTotalProductionRates()
        // This method exists for consistency and future expansion
        // No direct state mutation needed as effects are calculated on-demand
      },

      getCompletedResearchIds: () => {
        return get().completedResearch.map((r) => r.researchId)
      },

      getTotalProductionRates: () => {
        const state = get()
        const totalProductionRates = { ...state.productionRates }

        state.buildings.forEach((building) => {
          if (!building.isUpgrading) {
            const buildingProduction = calculateBuildingProduction(building.type, building.level)
            Object.entries(buildingProduction).forEach(([resource, amount]) => {
              if (amount && amount > 0) {
                totalProductionRates[resource as keyof Resources] += amount
              }
            })
          }
        })

        const territoryBonuses = get().getTerritoryBonuses()
        Object.entries(territoryBonuses).forEach(([resource, bonus]) => {
          if (bonus > 0) {
            const resourceKey = resource as keyof Resources
            totalProductionRates[resourceKey] *= 1 + bonus
          }
        })

        const completedIds = get().getCompletedResearchIds()
        completedIds.forEach((researchId) => {
          const research = getResearchById(researchId)
          if (research) {
            research.effects.forEach((effect) => {
              if (effect.type === "resource_production" && effect.target && effect.value) {
                const resourceKey = effect.target as keyof Resources
                if (totalProductionRates[resourceKey] !== undefined) {
                  if (effect.value > 0) {
                    totalProductionRates[resourceKey] *= 1 + effect.value
                  } else {
                    totalProductionRates[resourceKey] *= 1 + effect.value
                  }
                }
              }
              if (effect.type === "resource_cost" && effect.target && effect.value) {
                const resourceKey = effect.target as keyof Resources
                if (totalProductionRates[resourceKey] !== undefined && effect.value > 1) {
                  totalProductionRates[resourceKey] *= 2 - effect.value
                }
              }
            })
          }
        })

        return totalProductionRates
      },

      getEffectiveIndices: () => {
        const state = get()
        const effectiveIndices = { ...state.indices }

        state.buildings.forEach((building) => {
          if (!building.isUpgrading) {
            const effects = getBuildingEffects(building.id, building.level)
            effects.forEach((effect) => {
              if (effect.type === "index_bonus" && effect.target && effect.value) {
                switch (effect.target) {
                  case "welfare":
                    effectiveIndices.welfare = Math.min(100, effectiveIndices.welfare + effect.value)
                    break
                  case "sustainability":
                    effectiveIndices.sustainability = Math.min(100, effectiveIndices.sustainability + effect.value)
                    break
                  case "legitimacy":
                    effectiveIndices.legitimacy = Math.min(100, effectiveIndices.legitimacy + effect.value)
                    break
                }
              }
            })
          }
        })

        const completedIds = get().getCompletedResearchIds()
        completedIds.forEach((researchId) => {
          const research = getResearchById(researchId)
          if (research) {
            research.effects.forEach((effect) => {
              if (effect.type === "index_bonus" && effect.target && effect.value) {
                switch (effect.target) {
                  case "welfare":
                    effectiveIndices.welfare = Math.min(100, effectiveIndices.welfare + effect.value)
                    break
                  case "sustainability":
                    effectiveIndices.sustainability = Math.min(100, effectiveIndices.sustainability + effect.value)
                    break
                  case "legitimacy":
                    effectiveIndices.legitimacy = Math.min(100, effectiveIndices.legitimacy + effect.value)
                    break
                }
              }
            })
          }
        })

        return effectiveIndices
      },

      isBuildingUnlocked: (buildingId: string) => {
        const state = get()
        const buildingType = BUILDING_TYPES[buildingId]
        if (!buildingType) return false

        if (buildingId === "hq") return true

        const hqLevel = get().getBuildingLevel("hq")

        switch (buildingId) {
          case "factory":
          case "solar":
          case "datacenter":
            return hqLevel >= 1
          case "university":
            return hqLevel >= 2
          case "social":
            return hqLevel >= 3
          case "spaceport":
            return hqLevel >= 4
          default:
            return true
        }
      },

      getBuildingUnlockRequirements: (buildingId: string) => {
        const requirements: string[] = []

        if (get().isBuildingUnlocked(buildingId)) {
          return requirements
        }

        const hqLevel = get().getBuildingLevel("hq")

        switch (buildingId) {
          case "university":
            if (hqLevel < 2) requirements.push("Nexo Cívico nivel 2")
            break
          case "social":
            if (hqLevel < 3) requirements.push("Nexo Cívico nivel 3")
            break
          case "spaceport":
            if (hqLevel < 4) requirements.push("Nexo Cívico nivel 4")
            break
        }

        return requirements
      },

      activatePolicy: (policyId: string) => {
        const state = get()
        const policy = getPolicyById(policyId)
        if (!policy) return false

        if (!get().canActivatePolicy(policyId)) return false

        const now = Date.now()

        set((state) => ({
          resources: {
            ...state.resources,
            civicCredit: state.resources.civicCredit - policy.cost,
          },
        }))

        const activePolicy: ActivePolicy = {
          policyId,
          activatedAt: now,
          expiresAt: policy.duration > 0 ? now + policy.duration * 60 * 1000 : undefined,
        }

        set((state) => ({
          activePolicies: [...state.activePolicies, activePolicy],
        }))

        console.log(`[v0] Policy activated: ${policy.name}`)

        setTimeout(() => get().syncWithDatabase(), 100)

        return true
      },

      deactivatePolicy: (policyId: string) => {
        const state = get()
        const policy = getPolicyById(policyId)
        if (!policy) return false

        const now = Date.now()

        set((state) => ({
          activePolicies: state.activePolicies
            .map((ap) => (ap.policyId === policyId ? { ...ap, lastDeactivated: now } : ap))
            .filter((ap) => ap.policyId !== policyId),
        }))

        console.log(`[v0] Policy deactivated: ${policy.name}`)

        setTimeout(() => get().syncWithDatabase(), 100)

        return true
      },

      canActivatePolicy: (policyId: string) => {
        const state = get()
        const policy = getPolicyById(policyId)
        if (!policy) return false

        if (state.resources.civicCredit < policy.cost) return false
        if (get().isPolicyActive(policyId)) return false
        if (get().isPolicyOnCooldown(policyId)) return false
        if (get().getActivePolicyCount() >= 3) return false

        const hqLevel = get().getBuildingLevel("hq")
        if (hqLevel < 3) return false

        return true
      },

      isPolicyActive: (policyId: string) => {
        const state = get()
        return state.activePolicies.some((ap) => ap.policyId === policyId)
      },

      isPolicyOnCooldown: (policyId: string) => {
        const state = get()
        const policy = getPolicyById(policyId)
        if (!policy) return false

        const now = Date.now()
        const lastDeactivated = state.activePolicies.find((ap) => ap.policyId === policyId)?.lastDeactivated

        if (!lastDeactivated) return false

        const cooldownEndTime = lastDeactivated + policy.cooldown * 60 * 1000
        return now < cooldownEndTime
      },

      getActivePolicyCount: () => {
        return get().activePolicies.length
      },

      processPolicyExpiration: () => {
        const state = get()
        const now = Date.now()

        const expiredPolicies = state.activePolicies.filter((ap) => {
          return ap.expiresAt && now >= ap.expiresAt
        })

        if (expiredPolicies.length > 0) {
          set((state) => ({
            activePolicies: state.activePolicies
              .filter((ap) => {
                if (ap.expiresAt && now >= ap.expiresAt) {
                  console.log(`[v0] Policy expired: ${ap.policyId}`)
                  return false
                }
                return true
              })
              .map((ap) => {
                if (ap.expiresAt && now >= ap.expiresAt) {
                  return { ...ap, lastDeactivated: now }
                }
                return ap
              }),
          }))
        }
      },

      applyPolicyEffects: () => {
        // Policy effects are applied dynamically in getPolicyEffectiveIndices() and getPolicyEffectiveProductionRates()
        // This method exists for consistency and future expansion
        // No direct state mutation needed as effects are calculated on-demand
      },

      getPolicyEffectiveIndices: () => {
        const baseIndices = get().getEffectiveIndices()
        const state = get()
        const effectiveIndices = { ...baseIndices }

        state.activePolicies.forEach((activePolicy) => {
          const policy = getPolicyById(activePolicy.policyId)
          if (policy) {
            policy.effects.forEach((effect) => {
              if (effect.type === "index_modifier" && effect.target && effect.value) {
                switch (effect.target) {
                  case "welfare":
                    effectiveIndices.welfare = Math.max(0, Math.min(100, effectiveIndices.welfare + effect.value))
                    break
                  case "sustainability":
                    effectiveIndices.sustainability = Math.max(
                      0,
                      Math.min(100, effectiveIndices.sustainability + effect.value),
                    )
                    break
                  case "legitimacy":
                    effectiveIndices.legitimacy = Math.max(0, Math.min(100, effectiveIndices.legitimacy + effect.value))
                    break
                }
              }
              if (effect.type === "special" && effect.target === "conditional_legitimacy") {
                if (effectiveIndices.welfare < 60) {
                  effectiveIndices.legitimacy = Math.max(0, Math.min(100, effectiveIndices.legitimacy + effect.value))
                }
              }
            })
          }
        })

        return effectiveIndices
      },

      getPolicyEffectiveProductionRates: () => {
        const baseRates = get().getTotalProductionRates()
        const state = get()
        const effectiveRates = { ...baseRates }

        state.activePolicies.forEach((activePolicy) => {
          const policy = getPolicyById(activePolicy.policyId)
          if (policy) {
            policy.effects.forEach((effect) => {
              if (effect.type === "resource_production" && effect.target && effect.value) {
                const resourceKey = effect.target as keyof Resources
                if (effectiveRates[resourceKey] !== undefined) {
                  effectiveRates[resourceKey] *= effect.value
                }
              }
              if (effect.type === "resource_cost" && effect.target && effect.value) {
                const resourceKey = effect.target as keyof Resources
                if (effectiveRates[resourceKey] !== undefined && effect.value > 1) {
                  effectiveRates[resourceKey] *= 2 - effect.value
                }
              }
            })
          }
        })

        return effectiveRates
      },

      // Mission system implementation
      initializeMissions: () => {
        const state = get()
        if (state.playerMissions.length > 0) return // Already initialized

        const day1Missions = getMissionsByDay(1)

        const initialMissions: PlayerMission[] = day1Missions.map((mission) => ({
          missionId: mission.id,
          startedAt: Date.now(),
          progress: 0,
        }))

        set({ playerMissions: initialMissions })
        console.log(`[v0] Initialized ${initialMissions.length} missions for day 1`)
      },

      checkMissionProgress: () => {
        const state = get()
        let hasUpdates = false

        const updatedMissions = state.playerMissions.map((playerMission) => {
          if (playerMission.completedAt) return playerMission // Already completed

          const mission = getMissionById(playerMission.missionId)
          if (!mission) return playerMission

          let newProgress = playerMission.progress
          let completed = false

          // Check progress based on mission type
          switch (mission.objective.type) {
            case "build":
              if (mission.objective.target) {
                const currentLevel = get().getBuildingLevel(mission.objective.target)
                newProgress = Math.min(currentLevel / mission.objective.value, 1)
                completed = currentLevel >= mission.objective.value
              }
              break

            case "produce":
              if (mission.objective.target && mission.objective.target in state.resources) {
                const resourceKey = mission.objective.target as keyof Resources
                const currentAmount = state.resources[resourceKey]
                // For produce missions, we track cumulative production since mission start
                const baseAmount = 100 // Assume starting amount for simplicity
                const produced = Math.max(0, currentAmount - baseAmount)
                newProgress = Math.min(produced / mission.objective.value, 1)
                completed = produced >= mission.objective.value
              }
              break

            case "research":
              if (mission.objective.target) {
                completed = get().isResearchCompleted(mission.objective.target)
                newProgress = completed ? 1 : 0
              }
              break

            case "policy":
              if (mission.objective.target) {
                const isActive = get().isPolicyActive(mission.objective.target)
                // For policy missions, check if it was activated (simplified)
                if (isActive) {
                  newProgress = 1
                  completed = true
                }
              }
              break

            case "maintain":
              if (mission.objective.target) {
                let currentValue = 0
                if (mission.objective.target === "welfare") currentValue = state.indices.welfare
                if (mission.objective.target === "sustainability") currentValue = state.indices.sustainability
                if (mission.objective.target === "legitimacy") currentValue = state.indices.legitimacy

                newProgress = currentValue >= mission.objective.value ? 1 : currentValue / mission.objective.value
                completed = currentValue >= mission.objective.value
              }
              break

            case "explore":
              // For now, mark as available but not auto-completed
              // This would be handled by map/combat system later
              break
          }

          if (newProgress !== playerMission.progress || completed) {
            hasUpdates = true

            if (completed && !playerMission.completedAt) {
              console.log(`[v0] Mission completed: ${mission.name}`)
              return {
                ...playerMission,
                progress: 1,
                completedAt: Date.now(),
              }
            }

            return {
              ...playerMission,
              progress: newProgress,
            }
          }

          return playerMission
        })

        if (hasUpdates) {
          set({ playerMissions: updatedMissions })

          // Check if any missions were just completed and award rewards
          updatedMissions.forEach((playerMission) => {
            if (
              playerMission.completedAt &&
              !state.playerMissions.find((pm) => pm.missionId === playerMission.missionId)?.completedAt
            ) {
              get().completeMission(playerMission.missionId)
            }
          })
        }
      },

      completeMission: (missionId: string) => {
        const mission = getMissionById(missionId)
        if (!mission) return false

        const state = get()
        const playerMission = state.playerMissions.find((pm) => pm.missionId === missionId)
        if (!playerMission || playerMission.completedAt) return false

        // Award rewards
        if (mission.reward.resources) {
          set((state) => ({
            resources: {
              materials: state.resources.materials + (mission.reward.resources?.materials || 0),
              energy: state.resources.energy + (mission.reward.resources?.energy || 0),
              data: state.resources.data + (mission.reward.resources?.data || 0),
              talent: state.resources.talent + (mission.reward.resources?.talent || 0),
              civicCredit: state.resources.civicCredit + (mission.reward.resources?.civicCredit || 0),
            },
          }))
        }

        if (mission.reward.indices) {
          set((state) => ({
            indices: {
              welfare: state.indices.welfare + (mission.reward.indices?.welfare || 0),
              sustainability: state.indices.sustainability + (mission.reward.indices?.sustainability || 0),
              legitimacy: state.indices.legitimacy + (mission.reward.indices?.legitimacy || 0),
            },
          }))
        }

        console.log(`[v0] Mission rewards awarded: ${mission.name}`)
        setTimeout(() => get().syncWithDatabase(), 100)
        return true
      },

      getMissionProgress: (missionId: string) => {
        const state = get()
        const playerMission = state.playerMissions.find((pm) => pm.missionId === missionId)
        return playerMission?.progress || 0
      },

      isMissionCompleted: (missionId: string) => {
        const state = get()
        const playerMission = state.playerMissions.find((pm) => pm.missionId === missionId)
        return !!playerMission?.completedAt
      },

      isMissionAvailable: (missionId: string) => {
        const state = get()
        const mission = getMissionById(missionId)
        if (!mission) return false

        // Mission is available if it's for the current tutorial day or earlier
        return mission.day <= state.tutorialDay
      },

      advanceTutorialDay: () => {
        const state = get()

        // Check if all missions for current day are completed
        const currentDayMissions = getMissionsByDay(state.tutorialDay)
        const allCompleted = currentDayMissions.every((mission) => get().isMissionCompleted(mission.id))

        if (allCompleted && state.tutorialDay < 3) {
          const newDay = state.tutorialDay + 1
          const newDayMissions = getMissionsByDay(newDay)

          const newMissions: PlayerMission[] = newDayMissions.map((mission) => ({
            missionId: mission.id,
            startedAt: Date.now(),
            progress: 0,
          }))

          set((state) => ({
            tutorialDay: newDay,
            playerMissions: [...state.playerMissions, ...newMissions],
          }))

          console.log(`[v0] Advanced to tutorial day ${newDay}`)
        }
      },

      getCurrentDayMissions: () => {
        const state = get()
        const currentMissions = getMissionsByDay(state.tutorialDay)

        return state.playerMissions.filter((pm) => currentMissions.some((mission) => mission.id === pm.missionId))
      },
      startTraining: (unitTypeId: string, quantity: number) => {
        const state = get()
        const unitType = UNIT_TYPES[unitTypeId]
        if (!unitType) return false

        if (!get().canAffordTraining(unitTypeId, quantity)) return false
        if (!get().isUnitUnlocked(unitTypeId)) return false
        if (get().getAvailableTrainingSlots() <= 0) return false

        let cost = calculateUnitCost(unitType, quantity)
        let time = calculateTrainingTime(unitType, quantity)

        // Apply research effects for training cost reduction
        const completedIds = get().getCompletedResearchIds()
        completedIds.forEach((researchId) => {
          const research = getResearchById(researchId)
          if (research) {
            research.effects.forEach((effect) => {
              if (effect.type === "cost_reduction") {
                if (effect.target === "training_time") {
                  time = Math.floor(time * (1 - effect.value))
                }
                if (effect.target === "unit_materials" && cost.materials > 0) {
                  cost = { ...cost, materials: Math.floor(cost.materials * (1 - effect.value)) }
                }
              }
            })
          }
        })

        const now = Date.now()

        // Deduct resources
        set((state) => ({
          resources: {
            materials: state.resources.materials - cost.materials,
            energy: state.resources.energy - cost.energy,
            data: state.resources.data - cost.data,
            talent: state.resources.talent - cost.talent,
            civicCredit: state.resources.civicCredit - cost.civicCredit,
          },
        }))

        const queueItem: TrainingQueue = {
          id: `${unitTypeId}-${quantity}-${now}`,
          unitTypeId,
          quantity,
          startTime: now,
          finishTime: now + time * 60 * 1000,
          cost,
        }

        set((state) => ({
          trainingQueues: [...state.trainingQueues, queueItem],
        }))

        console.log(`[v0] Training started: ${quantity}x ${unitType.name}`)
        setTimeout(() => get().syncWithDatabase(), 100)
        return true
      },

      finishTraining: (queueId: string) => {
        const state = get()
        const queue = state.trainingQueues.find((q) => q.id === queueId)
        if (!queue) return

        const unitType = UNIT_TYPES[queue.unitTypeId]
        if (!unitType) return

        set((state) => {
          const existingUnitIndex = state.units.findIndex((u) => u.type.id === queue.unitTypeId)
          const updatedUnits = [...state.units]

          if (existingUnitIndex >= 0) {
            updatedUnits[existingUnitIndex] = {
              ...updatedUnits[existingUnitIndex],
              count: updatedUnits[existingUnitIndex].count + queue.quantity,
              isTraining: false,
            }
          } else {
            updatedUnits.push({
              id: `unit-${queue.unitTypeId}`,
              type: unitType,
              count: queue.quantity,
              isTraining: false,
            })
          }

          // Update army stats
          const totalPower = calculateArmyPower(updatedUnits)
          const maintenanceCost = calculateMaintenanceCost(updatedUnits)

          return {
            units: updatedUnits,
            trainingQueues: state.trainingQueues.filter((q) => q.id !== queueId),
            army: {
              units: updatedUnits,
              totalPower,
              maintenanceCost,
            },
          }
        })

        console.log(`[v0] Training completed: ${queue.quantity}x ${unitType.name}`)
        setTimeout(() => get().syncWithDatabase(), 100)
      },

      processTrainingQueues: () => {
        const state = get()
        const now = Date.now()

        state.trainingQueues.forEach((queue) => {
          if (now >= queue.finishTime) {
            get().finishTraining(queue.id)
          }
        })
      },

      canAffordTraining: (unitTypeId: string, quantity: number) => {
        const state = get()
        const unitType = UNIT_TYPES[unitTypeId]
        if (!unitType) return false

        const cost = calculateUnitCost(unitType, quantity)
        return (
          state.resources.materials >= cost.materials &&
          state.resources.energy >= cost.energy &&
          state.resources.data >= cost.data &&
          state.resources.talent >= cost.talent &&
          state.resources.civicCredit >= cost.civicCredit
        )
      },

      isUnitUnlocked: (unitTypeId: string) => {
        const unitType = UNIT_TYPES[unitTypeId]
        if (!unitType) return false

        const requirements = unitType.unlockRequirements
        if (requirements.buildingLevel) {
          for (const [buildingId, requiredLevel] of Object.entries(requirements.buildingLevel)) {
            const currentLevel = get().getBuildingLevel(buildingId)
            if (currentLevel < requiredLevel) {
              return false
            }
          }
        }

        return true
      },

      getUnitUnlockRequirements: (unitTypeId: string) => {
        const unitType = UNIT_TYPES[unitTypeId]
        if (!unitType) return []

        const requirements: string[] = []
        const unlockReqs = unitType.unlockRequirements

        if (unlockReqs.buildingLevel) {
          Object.entries(unlockReqs.buildingLevel).forEach(([buildingId, level]) => {
            const buildingType = BUILDING_TYPES[buildingId]
            if (buildingType) {
              requirements.push(`${buildingType.name} nivel ${level}`)
            }
          })
        }

        return requirements
      },

      getUnitCount: (unitTypeId: string) => {
        const unit = get().units.find((u) => u.type.id === unitTypeId)
        return unit ? unit.count : 0
      },

      getTotalArmyPower: () => {
        return calculateArmyPower(get().units)
      },

      getMaintenanceCost: () => {
        return calculateMaintenanceCost(get().units)
      },

      cancelTraining: (queueId: string) => {
        const state = get()
        const queue = state.trainingQueues.find((q) => q.id === queueId)
        if (!queue) return false

        // Refund 75% of resources (25% penalty)
        const refund = {
          materials: Math.floor(queue.cost.materials * 0.75),
          energy: Math.floor(queue.cost.energy * 0.75),
          data: Math.floor(queue.cost.data * 0.75),
          talent: Math.floor(queue.cost.talent * 0.75),
          civicCredit: Math.floor(queue.cost.civicCredit * 0.75),
        }

        set((state) => ({
          resources: {
            materials: state.resources.materials + refund.materials,
            energy: state.resources.energy + refund.energy,
            data: state.resources.data + refund.data,
            talent: state.resources.talent + refund.talent,
            civicCredit: state.resources.civicCredit + refund.civicCredit,
          },
          trainingQueues: state.trainingQueues.filter((q) => q.id !== queueId),
        }))

        console.log(`[v0] Training cancelled: ${queue.unitTypeId} (75% refund)`)
        setTimeout(() => get().syncWithDatabase(), 100)
        return true
      },

      getAvailableTrainingSlots: () => {
        const spaceportLevel = get().getBuildingLevel("spaceport")
        if (spaceportLevel === 0) return 0

        // 1 slot base, +1 at level 5, +1 at level 10
        let maxSlots = 1
        if (spaceportLevel >= 5) maxSlots = 2
        if (spaceportLevel >= 10) maxSlots = 3

        const usedSlots = get().trainingQueues.length
        return Math.max(0, maxSlots - usedSlots)
      },

      exploreTerritory: (territoryId: string) => {
        const state = get()

        // Check if already explored
        if (state.mapState.exploredTerritories.includes(territoryId)) {
          return false
        }

        const explorationCost = get().getExplorationCost(territoryId)

        // Check if can afford exploration
        if (!get().canAffordExploration(territoryId)) {
          return false
        }

        const rewards = get().getExplorationRewards(territoryId)

        // Deduct exploration cost
        set((state) => ({
          resources: {
            materials: state.resources.materials - explorationCost.materials,
            energy: state.resources.energy - explorationCost.energy,
            data: state.resources.data - explorationCost.data,
            talent: state.resources.talent - explorationCost.talent,
            civicCredit: state.resources.civicCredit - explorationCost.civicCredit,
          },
          mapState: {
            ...state.mapState,
            exploredTerritories: [...state.mapState.exploredTerritories, territoryId],
          },
        }))

        set((state) => ({
          resources: {
            materials: state.resources.materials + rewards.materials,
            energy: state.resources.energy + rewards.energy,
            data: state.resources.data + rewards.data,
            talent: state.resources.talent + rewards.talent,
            civicCredit: state.resources.civicCredit + rewards.civicCredit,
          },
        }))

        console.log(`[v0] Territory explored: ${territoryId}, rewards:`, rewards)
        setTimeout(() => get().syncWithDatabase(), 100)
        return true
      },

      controlTerritory: (territoryId: string) => {
        const state = get()

        // Must be explored first
        if (!state.mapState.exploredTerritories.includes(territoryId)) {
          return false
        }

        // Check if already controlled
        if (state.mapState.playerTerritories.includes(territoryId)) {
          return false
        }

        const territory = get().getTerritoryInfo(territoryId)
        if (!territory) return false

        const controlCost = {
          materials: territory.defenseLevel * 100,
          energy: territory.defenseLevel * 75,
          data: territory.defenseLevel * 50,
          talent: territory.defenseLevel * 0.5,
          civicCredit: territory.defenseLevel * 25,
        }

        // Check if can afford control
        if (
          state.resources.materials < controlCost.materials ||
          state.resources.energy < controlCost.energy ||
          state.resources.data < controlCost.data ||
          state.resources.talent < controlCost.talent ||
          state.resources.civicCredit < controlCost.civicCredit
        ) {
          return false
        }

        // Deduct control cost
        set((state) => ({
          resources: {
            materials: state.resources.materials - controlCost.materials,
            energy: state.resources.energy - controlCost.energy,
            data: state.resources.data - controlCost.data,
            talent: state.resources.talent - controlCost.talent,
            civicCredit: state.resources.civicCredit - controlCost.civicCredit,
          },
          mapState: {
            ...state.mapState,
            playerTerritories: [...state.mapState.playerTerritories, territoryId],
          },
        }))

        console.log(`[v0] Territory controlled: ${territoryId}, cost:`, controlCost)
        setTimeout(() => get().syncWithDatabase(), 100)
        return true
      },

      getTerritoryBonuses: () => {
        const state = get()
        const bonuses: Resources = { materials: 0, energy: 0, data: 0, talent: 0, civicCredit: 0 }

        state.mapState.playerTerritories.forEach((territoryId) => {
          const territory = TERRITORIES.find((t) => t.id === territoryId)
          if (territory) {
            const bonusValue = territory.bonusValue / 100 // Convert percentage to decimal

            switch (territory.bonusType) {
              case "materials":
                bonuses.materials += bonusValue
                break
              case "energy":
                bonuses.energy += bonusValue
                break
              case "data":
                bonuses.data += bonusValue
                break
              case "talent":
                bonuses.talent += bonusValue
                break
              case "mixed":
                // Mixed territories give smaller bonuses to all resources
                const mixedBonus = bonusValue / 4
                bonuses.materials += mixedBonus
                bonuses.energy += mixedBonus
                bonuses.data += mixedBonus
                bonuses.talent += mixedBonus
                break
            }
          }
        })

        return bonuses
      },

      isOrbitUnlocked: (orbitId: string) => {
        const hqLevel = get().getBuildingLevel("hq")

        const orbit = ORBITS.find((o) => o.id === orbitId)

        if (!orbit) return false
        return hqLevel >= orbit.unlockRequirements.hqLevel
      },

      getControlledTerritories: () => {
        return get().mapState.playerTerritories
      },

      getExploredTerritories: () => {
        return get().mapState.exploredTerritories
      },

      initializeMapState: () => {
        set((state) => ({
          mapState: {
            territories: TERRITORIES,
            orbits: ORBITS,
            playerTerritories: state.mapState.playerTerritories || [],
            exploredTerritories: state.mapState.exploredTerritories || [],
          },
        }))

        console.log(`[v0] Map state initialized with ${TERRITORIES.length} territories and ${ORBITS.length} orbits`)
      },

      getHQLevel: () => {
        return get().getBuildingLevel("hq")
      },

      scoutTerritory: (territoryId: string) => {
        const territory = get().getTerritoryInfo(territoryId)
        if (!territory) return null

        const now = Date.now()
        const scoutReport: ScoutReport = {
          territoryId,
          scoutedAt: now,
          estimatedPower: territory.defenseLevel * 100 + Math.random() * 50,
          resources: {
            materials: territory.bonusType === "materials" ? territory.bonusValue * 10 : Math.random() * 100,
            energy: territory.bonusType === "energy" ? territory.bonusValue * 8 : Math.random() * 80,
            data: territory.bonusType === "data" ? territory.bonusValue * 5 : Math.random() * 50,
            talent: territory.bonusType === "talent" ? territory.bonusValue * 0.1 : Math.random() * 2,
            civicCredit: Math.random() * 30,
          },
          defenseInfo:
            territory.defenseLevel === 1
              ? "Defensas ligeras"
              : territory.defenseLevel === 2
                ? "Defensas moderadas"
                : "Defensas pesadas",
          ownerInfo: territory.ownerId
            ? {
                name: territory.ownerName || "Jugador desconocido",
                indices: {
                  welfare: 50 + Math.random() * 40,
                  sustainability: 50 + Math.random() * 40,
                  legitimacy: 50 + Math.random() * 40,
                },
              }
            : undefined,
        }

        return scoutReport
      },

      getExplorationCost: (territoryId: string) => {
        const territory = get().getTerritoryInfo(territoryId)
        if (!territory) {
          return { materials: 50, energy: 30, data: 20, talent: 0, civicCredit: 10 }
        }

        // Scale cost based on defense level
        const multiplier = territory.defenseLevel
        return {
          materials: 50 * multiplier,
          energy: 30 * multiplier,
          data: 20 * multiplier,
          talent: 0,
          civicCredit: 10 * multiplier,
        }
      },

      canAffordExploration: (territoryId: string) => {
        const state = get()
        const cost = get().getExplorationCost(territoryId)

        return (
          state.resources.materials >= cost.materials &&
          state.resources.energy >= cost.energy &&
          state.resources.data >= cost.data &&
          state.resources.talent >= cost.talent &&
          state.resources.civicCredit >= cost.civicCredit
        )
      },

      getExplorationRewards: (territoryId: string) => {
        const territory = get().getTerritoryInfo(territoryId)
        if (!territory) {
          return { materials: 0, energy: 0, data: 0, talent: 0, civicCredit: 0 }
        }

        // Base rewards scaled by territory bonus value
        const baseReward = territory.bonusValue
        return {
          materials: territory.bonusType === "materials" ? baseReward * 2 : baseReward * 0.5,
          energy: territory.bonusType === "energy" ? baseReward * 2 : baseReward * 0.5,
          data: territory.bonusType === "data" ? baseReward * 2 : baseReward * 0.5,
          talent: territory.bonusType === "talent" ? baseReward * 0.1 : baseReward * 0.02,
          civicCredit: baseReward * 0.8,
        }
      },

      getTerritoryInfo: (territoryId: string) => {
        return TERRITORIES.find((t) => t.id === territoryId) || null
      },
    }),
    {
      name: "ciudad-tecnosocial-storage",
      version: 1,
    },
  ),
)

function getProductionMultiplier(indexValue: number): number {
  if (indexValue >= 80) return 1.1
  if (indexValue >= 60) return 1.0
  if (indexValue >= 40) return 0.9
  return 0.8
}
