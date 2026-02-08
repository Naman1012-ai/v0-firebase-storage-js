import { database } from "@/lib/firebase"
import {
  ref,
  push,
  set,
  get,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database"
import type { Donor, ApiResponse } from "@/types"

export async function registerDonor(
  donorData: Omit<Donor, "id">
): Promise<ApiResponse<Donor>> {
  try {
    const donorRef = push(ref(database, "donors"))
    const donor: Donor = { ...donorData, id: donorRef.key! }
    await set(donorRef, donor)
    return { success: true, data: donor, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register donor"
    return { success: false, data: null, error: message }
  }
}

export async function updateDonorProfile(
  donorId: string,
  updatedData: Partial<Donor>
): Promise<ApiResponse<Partial<Donor> & { id: string }>> {
  try {
    const donorRef = ref(database, `donors/${donorId}`)
    await update(donorRef, updatedData)
    return { success: true, data: { id: donorId, ...updatedData }, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update donor"
    return { success: false, data: null, error: message }
  }
}

export async function setDonorAvailability(
  donorId: string,
  status: string
): Promise<ApiResponse<{ id: string; status: string }>> {
  try {
    const donorRef = ref(database, `donors/${donorId}`)
    await update(donorRef, { status })
    return { success: true, data: { id: donorId, status }, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update availability"
    return { success: false, data: null, error: message }
  }
}

export async function getDonor(donorId: string): Promise<ApiResponse<Donor>> {
  try {
    const snapshot = await get(ref(database, `donors/${donorId}`))
    if (!snapshot.exists()) {
      return { success: false, data: null, error: "Donor not found" }
    }
    return { success: true, data: { id: donorId, ...snapshot.val() } as Donor, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get donor"
    return { success: false, data: null, error: message }
  }
}

export async function getDonorByEmail(email: string): Promise<ApiResponse<Donor>> {
  try {
    const q = query(
      ref(database, "donors"),
      orderByChild("email"),
      equalTo(email.toLowerCase().trim())
    )
    const snapshot = await get(q)
    if (!snapshot.exists()) {
      return { success: false, data: null, error: "Donor not found" }
    }
    let donor: Donor | null = null
    snapshot.forEach((child) => {
      donor = { id: child.key!, ...child.val() } as Donor
    })
    return { success: true, data: donor, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to find donor"
    return { success: false, data: null, error: message }
  }
}

export async function getAllDonors(): Promise<ApiResponse<Donor[]>> {
  try {
    const snapshot = await get(ref(database, "donors"))
    if (!snapshot.exists()) {
      return { success: true, data: [], error: null }
    }
    const donors: Donor[] = []
    snapshot.forEach((child) => {
      donors.push({ id: child.key!, ...child.val() } as Donor)
    })
    return { success: true, data: donors, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get donors"
    return { success: false, data: null, error: message }
  }
}
