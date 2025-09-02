"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Database, Wifi, WifiOff } from "lucide-react"
import { GameDatabase } from "@/lib/database"

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      const db = GameDatabase.getInstance()
      const connected = await db.connect()
      setIsConnected(connected)
    }

    checkConnection()

    const TIME_ACCELERATION = 20 // Must match the value in game-state.ts
    const baseInterval = 30000 // 30 seconds
    const acceleratedInterval = baseInterval / TIME_ACCELERATION // 1.5 seconds for 20x speed

    const interval = setInterval(checkConnection, acceleratedInterval)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Update last sync time when database operations occur
    const updateSyncTime = () => setLastSync(new Date())

    // Listen for custom sync events (would be dispatched from database operations)
    window.addEventListener("database-sync", updateSyncTime)

    return () => window.removeEventListener("database-sync", updateSyncTime)
  }, [])

  if (isConnected === null) {
    return (
      <Badge variant="outline" className="border-slate-600 text-slate-400">
        <Database className="w-3 h-3 mr-1" />
        Conectando...
      </Badge>
    )
  }

  if (isConnected) {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <Wifi className="w-3 h-3 mr-1" />
        Online
        {lastSync && <span className="ml-1 text-xs opacity-75">{lastSync.toLocaleTimeString()}</span>}
      </Badge>
    )
  }

  return (
    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
      <WifiOff className="w-3 h-3 mr-1" />
      Local
    </Badge>
  )
}
