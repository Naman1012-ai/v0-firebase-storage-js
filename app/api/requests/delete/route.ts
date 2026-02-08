import { NextResponse } from "next/server"
import { deleteRequest } from "@/lib/services/requestService"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")
    if (!requestId) {
      return NextResponse.json(
        { success: false, data: null, error: "requestId is required" },
        { status: 400 }
      )
    }
    const result = await deleteRequest(requestId)
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
