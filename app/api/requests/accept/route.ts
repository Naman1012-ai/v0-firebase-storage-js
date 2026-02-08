import { NextResponse } from "next/server"
import { acceptRequest } from "@/lib/services/requestService"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { requestId, donorId, donorName } = body
    if (!requestId || !donorId) {
      return NextResponse.json(
        { success: false, data: null, error: "requestId and donorId are required" },
        { status: 400 }
      )
    }
    const result = await acceptRequest(requestId, donorId, donorName || "")
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
