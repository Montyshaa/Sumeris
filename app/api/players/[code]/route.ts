import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params

    if (!code) {
      return NextResponse.json({ error: "Player code is required" }, { status: 400 })
    }

    console.log("[v0] API: Getting player:", code.slice(-8))

    // For now, simulate player retrieval
    // In a real implementation, this would query the database
    // Return 404 for demonstration of player not found
    if (code.includes("notfound")) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    const playerData = {
      id: Math.floor(Math.random() * 10000),
      name: "TestPlayer",
      code,
      resources: {
        materials: 1200,
        energy: 600,
        data: 250,
        talent: 6,
        civicCredit: 75,
      },
      indices: {
        welfare: 65,
        sustainability: 60,
        legitimacy: 70,
      },
      lastUpdate: Date.now(),
    }

    return NextResponse.json(playerData)
  } catch (error) {
    console.error("[v0] API: Failed to get player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
