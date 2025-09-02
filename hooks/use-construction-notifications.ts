"use client"

import { useEffect, useRef } from "react"
import { useGameStore } from "@/lib/game-state"

export function useConstructionNotifications() {
  const { constructionQueues } = useGameStore()
  const previousQueues = useRef<typeof constructionQueues>([])

  useEffect(() => {
    // Check for completed constructions
    const currentTime = Date.now()
    const previousIds = new Set(previousQueues.current.map((q) => q.id))
    const currentIds = new Set(constructionQueues.map((q) => q.id))

    // Find constructions that were removed (completed or cancelled)
    const removedQueues = previousQueues.current.filter((q) => !currentIds.has(q.id))

    removedQueues.forEach((queue) => {
      if (currentTime >= queue.finishTime) {
        // Construction completed
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Construcción Completada", {
            body: `${queue.buildingId} nivel ${queue.targetLevel} está listo`,
            icon: "/icon-192x192.png",
          })
        }
      }
    })

    previousQueues.current = [...constructionQueues]
  }, [constructionQueues])

  // Request notification permission on first use
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])
}
