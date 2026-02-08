import { NextResponse } from "next/server"
import { getHospital } from "@/lib/services/hospitalService"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await getHospital(id)
    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}
