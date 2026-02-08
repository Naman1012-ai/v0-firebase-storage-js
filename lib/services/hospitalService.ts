import { database } from "@/lib/firebase"
import {
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database"
import type { Hospital, ApiResponse } from "@/types"

export async function registerHospital(
  hospitalData: Omit<Hospital, "id">
): Promise<ApiResponse<Hospital>> {
  try {
    const hospitalRef = push(ref(database, "hospitals"))
    const hospital: Hospital = { ...hospitalData, id: hospitalRef.key! }
    await set(hospitalRef, hospital)
    return { success: true, data: hospital, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register hospital"
    return { success: false, data: null, error: message }
  }
}

export async function getHospital(hospitalId: string): Promise<ApiResponse<Hospital>> {
  try {
    const snapshot = await get(ref(database, `hospitals/${hospitalId}`))
    if (!snapshot.exists()) {
      return { success: false, data: null, error: "Hospital not found" }
    }
    return { success: true, data: { id: hospitalId, ...snapshot.val() } as Hospital, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get hospital"
    return { success: false, data: null, error: message }
  }
}

export async function getHospitalByEmailAndLicense(
  email: string,
  license: string
): Promise<ApiResponse<Hospital>> {
  try {
    const q = query(
      ref(database, "hospitals"),
      orderByChild("email"),
      equalTo(email.toLowerCase().trim())
    )
    const snapshot = await get(q)
    if (!snapshot.exists()) {
      return { success: false, data: null, error: "Hospital not found" }
    }
    let hospital: Hospital | null = null
    snapshot.forEach((child) => {
      const val = child.val()
      if (val.license?.toLowerCase().trim() === license.toLowerCase().trim()) {
        hospital = { id: child.key!, ...val } as Hospital
      }
    })
    if (!hospital) {
      return { success: false, data: null, error: "Hospital not found" }
    }
    return { success: true, data: hospital, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to find hospital"
    return { success: false, data: null, error: message }
  }
}

export async function getAllHospitals(): Promise<ApiResponse<Hospital[]>> {
  try {
    const snapshot = await get(ref(database, "hospitals"))
    if (!snapshot.exists()) {
      return { success: true, data: [], error: null }
    }
    const hospitals: Hospital[] = []
    snapshot.forEach((child) => {
      hospitals.push({ id: child.key!, ...child.val() } as Hospital)
    })
    return { success: true, data: hospitals, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get hospitals"
    return { success: false, data: null, error: message }
  }
}
