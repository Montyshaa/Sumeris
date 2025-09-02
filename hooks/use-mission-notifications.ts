"use client"

import { useEffect, useRef } from "react"
import { useGameStore } from "@/lib/game-state"
import { getMissionById } from "@/lib/missions-data"

export function useMissionNotifications() {
  const { playerMissions } = useGameStore()
  const previousMissions = useRef<typeof playerMissions>([])

  useEffect(() => {
    // Check for newly completed missions
    const newlyCompleted = playerMissions.filter((current) => {
      const previous = previousMissions.current.find((prev) => prev.missionId === current.missionId)
      return current.completedAt && (!previous || !previous.completedAt)
    })

    // Show notifications for newly completed missions
    newlyCompleted.forEach((playerMission) => {
      const mission = getMissionById(playerMission.missionId)
      if (mission) {
        // Create notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`Misión Completada: ${mission.name}`, {
            body: mission.description,
            icon: "/icon-192x192.png",
            tag: `mission-${mission.id}`,
          })
        }

        // Console log for development
        console.log(`[v0] 🎯 Mission completed: ${mission.name}`)

        // Dispatch custom event for UI components
        window.dispatchEvent(
          new CustomEvent("mission-completed", {
            detail: { mission, playerMission },
          }),
        )
      }
    })

    // Update previous missions reference
    previousMissions.current = [...playerMissions]
  }, [playerMissions])

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])
}
