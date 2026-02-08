import { NextResponse } from "next/server"
import { getRequestsForDonor } from "@/lib/services/requestService"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bloodGroup = searchParams.get("bloodGroup")
    if (!bloodGroup) {
      return NextResponse.json(
        { success: false, data: null, error: "bloodGroup is required" },
        { status: 400 }
      )
    }
    const result = await getRequestsForDonor(bloodGroup)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}
