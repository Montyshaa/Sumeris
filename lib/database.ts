import type {
  Resources,
  Indices,
  Building,
  ConstructionQueue,
  CompletedResearch,
  ResearchQueue,
  ActivePolicy,
  PlayerMission,
  MapState,
} from "./types"

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!DATABASE_URL) {
  console.warn("[v0] No database URL found. Using local storage only.")
}

export interface PlayerData {
  id: number
  name: string
  code: string
  resources: Resources
  indices: Indices
  lastUpdate: number
  buildings: Building[]
  constructionQueues: ConstructionQueue[]
  completedResearch?: CompletedResearch[]
  researchQueue?: ResearchQueue[]
  activePolicies?: ActivePolicy[]
  playerMissions?: PlayerMission[]
  tutorialDay?: number
  mapState?: MapState
}

// Database operations
export class GameDatabase {
  private static instance: GameDatabase
  private connected = false

  static getInstance(): GameDatabase {
    if (!GameDatabase.instance) {
      GameDatabase.instance = new GameDatabase()
    }
    return GameDatabase.instance
  }

  async connect(): Promise<boolean> {
    if (!DATABASE_URL) {
      console.log("[v0] Database: Using local storage mode")
      return false
    }

    try {
      // Test connection with a simple query
      const response = await fetch("/api/db/test")
      this.connected = response.ok
      console.log("[v0] Database: Connected successfully")
      return this.connected
    } catch (error) {
      console.error("[v0] Database connection failed:", error)
      this.connected = false
      return false
    }
  }

  async createPlayer(name: string, code: string): Promise<PlayerData | null> {
    if (!this.connected) {
      console.log("[v0] Database: Creating player in local mode")
      return null
    }

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create player: ${response.statusText}`)
      }

      const playerData = await response.json()
      console.log("[v0] Database: Player created successfully")
      return playerData
    } catch (error) {
      console.error("[v0] Database: Failed to create player:", error)
      return null
    }
  }

  async getPlayer(code: string): Promise<PlayerData | null> {
    if (!this.connected) {
      return null
    }

    try {
      const response = await fetch(`/api/players/${code}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to get player: ${response.statusText}`)
      }

      const playerData = await response.json()
      console.log("[v0] Database: Player data retrieved")
      return playerData
    } catch (error) {
      console.error("[v0] Database: Failed to get player:", error)
      return null
    }
  }

  async updatePlayerState(
    code: string,
    resources: Resources,
    indices: Indices,
    buildings?: Building[],
    constructionQueues?: ConstructionQueue[],
    completedResearch?: CompletedResearch[],
    researchQueue?: ResearchQueue[],
    activePolicies?: ActivePolicy[],
    playerMissions?: PlayerMission[],
    tutorialDay?: number,
    mapState?: MapState,
  ): Promise<boolean> {
    if (!this.connected) {
      return false
    }

    try {
      const response = await fetch(`/api/players/${code}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resources,
          indices,
          ...(buildings && { buildings }),
          ...(constructionQueues && { constructionQueues }),
          ...(completedResearch && { completedResearch }),
          ...(researchQueue && { researchQueue }),
          ...(activePolicies && { activePolicies }),
          ...(playerMissions && { playerMissions }),
          ...(tutorialDay && { tutorialDay }),
          ...(mapState && { mapState }),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update player state: ${response.statusText}`)
      }

      console.log("[v0] Database: Player state updated")
      return true
    } catch (error) {
      console.error("[v0] Database: Failed to update player state:", error)
      return false
    }
  }
}
