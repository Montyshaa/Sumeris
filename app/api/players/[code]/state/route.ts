import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params
    const { resources, indices } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Player code is required" }, { status: 400 })
    }

    if (!resources || !indices) {
      return NextResponse.json({ error: "Resources and indices are required" }, { status: 400 })
    }

    console.log("[v0] API: Updating player state:", {
      code: code.slice(-8),
      resources: Object.keys(resources),
      indices: Object.keys(indices),
    })

    // For now, simulate successful update
    // In a real implementation, this would update the database
    return NextResponse.json({
      success: true,
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] API: Failed to update player state:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
