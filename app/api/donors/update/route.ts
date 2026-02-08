import { NextResponse } from "next/server"
import { updateDonorProfile } from "@/lib/services/donorService"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: "Donor ID is required" },
        { status: 400 }
      )
    }
    const result = await updateDonorProfile(id, updates)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}
