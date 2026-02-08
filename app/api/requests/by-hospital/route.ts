import { NextResponse } from "next/server"
import { getRequestsByHospital } from "@/lib/services/requestService"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get("hospitalId")
    if (!hospitalId) {
      return NextResponse.json(
        { success: false, data: null, error: "hospitalId is required" },
        { status: 400 }
      )
    }
    const result = await getRequestsByHospital(hospitalId)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}
