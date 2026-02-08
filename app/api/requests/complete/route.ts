import { NextResponse } from "next/server"
import { completeRequest } from "@/lib/services/requestService"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { requestId, donationNumber, donorId } = body
    if (!requestId || !donationNumber) {
      return NextResponse.json(
        { success: false, data: null, error: "requestId and donationNumber are required" },
        { status: 400 }
      )
    }
    const result = await completeRequest(requestId, donationNumber, donorId)
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
