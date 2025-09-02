"use client"

import { useEffect, useRef } from "react"
import { useGameStore } from "@/lib/game-state"
import { getPolicyById } from "@/lib/policies-data"

export function usePolicyNotifications() {
  const { activePolicies } = useGameStore()
  const previousPoliciesRef = useRef<string[]>([])

  useEffect(() => {
    const currentPolicyIds = activePolicies.map((ap) => ap.policyId)
    const previousPolicyIds = previousPoliciesRef.current

    // Check for newly activated policies
    const newlyActivated = currentPolicyIds.filter((id) => !previousPolicyIds.includes(id))
    newlyActivated.forEach((policyId) => {
      const policy = getPolicyById(policyId)
      if (policy) {
        console.log(`[v0] Policy activated: ${policy.name}`)

        // Show browser notification if supported and permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Política Activada", {
            body: `${policy.name} está ahora activa`,
            icon: "/icon-192x192.png",
            tag: `policy-activated-${policyId}`,
          })
        }
      }
    })

    // Check for deactivated policies
    const deactivated = previousPolicyIds.filter((id) => !currentPolicyIds.includes(id))
    deactivated.forEach((policyId) => {
      const policy = getPolicyById(policyId)
      if (policy) {
        console.log(`[v0] Policy deactivated: ${policy.name}`)

        // Show browser notification if supported and permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Política Desactivada", {
            body: `${policy.name} ya no está activa`,
            icon: "/icon-192x192.png",
            tag: `policy-deactivated-${policyId}`,
          })
        }
      }
    })

    // Update the reference for next comparison
    previousPoliciesRef.current = currentPolicyIds
  }, [activePolicies])

  // Check for expiring policies (within 5 minutes)
  useEffect(() => {
    const checkExpiringPolicies = () => {
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      activePolicies.forEach((activePolicy) => {
        if (activePolicy.expiresAt) {
          const timeUntilExpiry = activePolicy.expiresAt - now

          // Notify if policy expires in less than 5 minutes
          if (timeUntilExpiry > 0 && timeUntilExpiry <= fiveMinutes) {
            const policy = getPolicyById(activePolicy.policyId)
            if (policy) {
              const minutesLeft = Math.ceil(timeUntilExpiry / 60000)
              console.log(`[v0] Policy expiring soon: ${policy.name} (${minutesLeft}min left)`)

              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Política Expirando", {
                  body: `${policy.name} expira en ${minutesLeft} minuto${minutesLeft !== 1 ? "s" : ""}`,
                  icon: "/icon-192x192.png",
                  tag: `policy-expiring-${activePolicy.policyId}`,
                })
              }
            }
          }
        }
      })
    }

    const TIME_ACCELERATION = 20 // Must match the value in game-state.ts
    const baseInterval = 60000 // 1 minute
    const acceleratedInterval = baseInterval / TIME_ACCELERATION // 3 seconds for 20x speed

    const interval = setInterval(checkExpiringPolicies, acceleratedInterval)

    // Check immediately
    checkExpiringPolicies()

    return () => clearInterval(interval)
  }, [activePolicies])

  // Request notification permission on first use
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log(`[v0] Notification permission: ${permission}`)
      })
    }
  }, [])
}
