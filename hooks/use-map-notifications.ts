"use client"

import { useEffect } from "react"
import { useGameStore } from "@/lib/game-state"

export function useMapNotifications() {
  const { exploredTerritories, playerTerritories } = useGameStore((state) => state.mapState)

  useEffect(() => {
    // This would integrate with a notification system
    // For now, we'll just log to console
    const lastExplored = exploredTerritories[exploredTerritories.length - 1]
    if (lastExplored) {
      console.log(`[v0] Territory explored: ${lastExplored}`)
    }
  }, [exploredTerritories])

  useEffect(() => {
    const lastControlled = playerTerritories[playerTerritories.length - 1]
    if (lastControlled) {
      console.log(`[v0] Territory controlled: ${lastControlled}`)
    }
  }, [playerTerritories])
}
