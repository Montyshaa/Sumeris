"use client"

import { useEffect } from "react"
import { useGameStore } from "@/lib/game-state"
import { getResearchById } from "@/lib/research-data"

export function useResearchNotifications() {
  const { researchQueue } = useGameStore()

  useEffect(() => {
    if (researchQueue.length === 0) return

    const checkCompletions = () => {
      const now = Date.now()

      researchQueue.forEach((queue) => {
        if (now >= queue.finishTime) {
          const research = getResearchById(queue.researchId)
          if (research) {
            // Show notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Investigación Completada", {
                body: `${research.name} ha sido completada`,
                icon: "/icon-192x192.png",
              })
            }

            // Show browser alert as fallback
            console.log(`[v0] Research completed notification: ${research.name}`)
          }
        }
      })
    }

    // Check immediately
    checkCompletions()

    const TIME_ACCELERATION = 20 // Must match the value in game-state.ts
    const baseInterval = 5000 // 5 seconds
    const acceleratedInterval = baseInterval / TIME_ACCELERATION // 250ms for 20x speed

    const interval = setInterval(checkCompletions, acceleratedInterval)

    return () => clearInterval(interval)
  }, [researchQueue])

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])
}
