import { NextResponse } from "next/server"
import { registerDonor } from "@/lib/services/donorService"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await registerDonor(body)
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
