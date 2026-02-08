import { NextResponse } from "next/server"
import { setDonorAvailability } from "@/lib/services/donorService"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body
    if (!id || !status) {
      return NextResponse.json(
        { success: false, data: null, error: "Donor ID and status are required" },
        { status: 400 }
      )
    }
    const result = await setDonorAvailability(id, status)
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
