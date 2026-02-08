import { database } from "@/lib/firebase"
import {
  ref,
  push,
  get,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database"
import type { BloodRequest, ApiResponse } from "@/types"

export async function createRequest(
  requestData: Omit<BloodRequest, "id">
): Promise<ApiResponse<BloodRequest>> {
  try {
    const requestRef = push(ref(database, "requests"))
    const requestId = requestRef.key!
    const request: BloodRequest = { ...requestData, id: requestId }

    // Atomic update: save request + hospital reference
    const updates: Record<string, unknown> = {}
    updates[`requests/${requestId}`] = request
    updates[`hospitals/${requestData.hospitalId}/requests/${requestId}`] = true

    await update(ref(database), updates)
    return { success: true, data: request, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create request"
    return { success: false, data: null, error: message }
  }
}

export async function acceptRequest(
  requestId: string,
  donorId: string,
  donorName: string
): Promise<ApiResponse<BloodRequest>> {
  try {
    // Atomic update: update request status + add donor reference
    const updates: Record<string, unknown> = {}
    updates[`requests/${requestId}/status`] = "accepted"
    updates[`requests/${requestId}/acceptedBy`] = donorName
    updates[`requests/${requestId}/donorId`] = donorId
    updates[`requests/${requestId}/acceptedAt`] = new Date().toISOString()
    updates[`donors/${donorId}/acceptedRequests/${requestId}`] = true

    await update(ref(database), updates)

    const snapshot = await get(ref(database, `requests/${requestId}`))
    const data = snapshot.val()
    return { success: true, data: { id: requestId, ...data } as BloodRequest, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to accept request"
    return { success: false, data: null, error: message }
  }
}

export async function completeRequest(
  requestId: string,
  donationNumber: string,
  donorId: string
): Promise<ApiResponse<BloodRequest>> {
  try {
    const updates: Record<string, unknown> = {}
    updates[`requests/${requestId}/status`] = "completed"
    updates[`requests/${requestId}/donationApproved`] = true
    updates[`requests/${requestId}/donationNumber`] = donationNumber
    updates[`requests/${requestId}/approvedAt`] = new Date().toISOString()

    await update(ref(database), updates)

    const snapshot = await get(ref(database, `requests/${requestId}`))
    const data = snapshot.val()
    return { success: true, data: { id: requestId, ...data } as BloodRequest, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete request"
    return { success: false, data: null, error: message }
  }
}

export async function deleteRequest(requestId: string): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    // Read request first to find related references
    const snapshot = await get(ref(database, `requests/${requestId}`))
    if (!snapshot.exists()) {
      return { success: false, data: null, error: "Request not found" }
    }

    const request = snapshot.val()
    const updates: Record<string, null> = {}

    // Remove main request node
    updates[`requests/${requestId}`] = null

    // Remove hospital reference
    if (request.hospitalId) {
      updates[`hospitals/${request.hospitalId}/requests/${requestId}`] = null
    }

    // Remove donor reference if accepted
    if (request.donorId) {
      updates[`donors/${request.donorId}/acceptedRequests/${requestId}`] = null
    }

    await update(ref(database), updates)
    return { success: true, data: { deleted: true }, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete request"
    return { success: false, data: null, error: message }
  }
}

export async function getRequestsForDonor(
  bloodGroup: string
): Promise<ApiResponse<BloodRequest[]>> {
  try {
    const q = query(
      ref(database, "requests"),
      orderByChild("bloodGroup"),
      equalTo(bloodGroup)
    )
    const snapshot = await get(q)
    if (!snapshot.exists()) {
      return { success: true, data: [], error: null }
    }
    const requests: BloodRequest[] = []
    snapshot.forEach((child) => {
      const data = child.val()
      if (data.status === "pending") {
        requests.push({ id: child.key!, ...data } as BloodRequest)
      }
    })
    return { success: true, data: requests, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get requests"
    return { success: false, data: null, error: message }
  }
}

export async function getRequestsByHospital(
  hospitalId: string
): Promise<ApiResponse<BloodRequest[]>> {
  try {
    const q = query(
      ref(database, "requests"),
      orderByChild("hospitalId"),
      equalTo(hospitalId)
    )
    const snapshot = await get(q)
    if (!snapshot.exists()) {
      return { success: true, data: [], error: null }
    }
    const requests: BloodRequest[] = []
    snapshot.forEach((child) => {
      requests.push({ id: child.key!, ...child.val() } as BloodRequest)
    })
    return { success: true, data: requests, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get requests"
    return { success: false, data: null, error: message }
  }
}

export async function getAllRequests(): Promise<ApiResponse<BloodRequest[]>> {
  try {
    const snapshot = await get(ref(database, "requests"))
    if (!snapshot.exists()) {
      return { success: true, data: [], error: null }
    }
    const requests: BloodRequest[] = []
    snapshot.forEach((child) => {
      requests.push({ id: child.key!, ...child.val() } as BloodRequest)
    })
    return { success: true, data: requests, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get requests"
    return { success: false, data: null, error: message }
  }
}
