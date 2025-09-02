import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, code } = await request.json()

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 })
    }

    console.log("[v0] API: Creating player:", { name, code: code.slice(-8) })

    // For now, simulate player creation
    // In a real implementation, this would insert into the database
    const playerData = {
      id: Math.floor(Math.random() * 10000),
      name,
      code,
      resources: {
        materials: 1000,
        energy: 500,
        data: 200,
        talent: 5,
        civicCredit: 50,
      },
      indices: {
        welfare: 60,
        sustainability: 55,
        legitimacy: 65,
      },
      lastUpdate: Date.now(),
    }

    return NextResponse.json(playerData)
  } catch (error) {
    console.error("[v0] API: Failed to create player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
