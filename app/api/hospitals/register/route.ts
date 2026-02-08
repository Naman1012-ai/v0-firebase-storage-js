import { NextResponse } from "next/server"
import { registerHospital } from "@/lib/services/hospitalService"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await registerHospital(body)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}
