import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple test to verify database connectivity
    // In a real implementation, this would test the actual database connection
    console.log("[v0] Database test endpoint called")

    // For now, return success to simulate database availability
    // This will be replaced with actual database connection testing
    return NextResponse.json({
      status: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Database test failed:", error)
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}
