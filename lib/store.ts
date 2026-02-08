// Firebase-backed data store with local in-memory cache for synchronous reads
// Every write persists to Firebase RTDB and updates the local cache.
// Firebase onValue listeners pull remote changes for cross-device real-time sync.

import { database } from "@/lib/firebase"
import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
} from "firebase/database"

// ---- INTERFACES (unchanged) ----

export interface DonorRecord {
  id: string
  name: string
  bloodGroup: string
  age: number
  weight: number
  phone: string
  email: string
  password: string
  location: { lat: number; lng: number }
  medical: string[]
  lifestyle: { smoke: string; alcohol: string; tattoo: string }
  lastDonation: string | null
  status: string
  registeredAt: string
  donationCount: number
  lastDonationApproved?: string
  dateOfBirth?: string
}

export const COOLDOWN_DAYS = 56

export function calculateAgeFromDOB(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export interface HospitalRecord {
  id: string
  name: string
  license: string
  establishment: string | null
  email: string
  contact: string
  emergencyHotline: string | null
  location: { lat: number; lng: number }
  password: string
  status: string
  registeredAt: string
}

export interface BloodRequestRecord {
  id: string
  hospitalId: string
  hospitalName: string
  hospitalLocation: { lat: number; lng: number }
  bloodGroup: string
  units: number
  urgency: string
  status: string
  createdAt: string
  acceptedBy?: string
  donorId?: string
  donationApproved?: boolean
  donationNumber?: string
  approvedAt?: string
  acceptedAt?: string
}

export interface DonationRecord {
  id: string
  donorId?: string
  donationNumber: string
  hospitalName: string
  hospitalId: string
  bloodGroup: string
  units: number
  donatedAt: string
  approvedAt: string
}

export interface NotificationRecord {
  id: string
  type: string
  donorId?: string
  hospitalId?: string
  donorName?: string
  hospitalName?: string
  bloodGroup?: string
  requestId?: string
  donationNumber?: string
  message: string
  createdAt: string
  read: boolean
}

// ---- IN-MEMORY CACHE ----
// Used for synchronous reads. Updated by Firebase listeners.

const cache: {
  donors: DonorRecord[]
  hospitals: HospitalRecord[]
  requests: BloodRequestRecord[]
  donations: (DonationRecord & { donorId: string })[]
  notifications: NotificationRecord[]
  rejections: { requestId: string; donorId: string }[]
  initialized: boolean
} = {
  donors: [],
  hospitals: [],
  requests: [],
  donations: [],
  notifications: [],
  rejections: [],
  initialized: false,
}

// ---- FIREBASE REAL-TIME LISTENERS ----
// These automatically sync remote data into the local cache

let listenersAttached = false

function attachFirebaseListeners() {
  if (typeof window === "undefined") return
  if (listenersAttached) return
  listenersAttached = true

  onValue(ref(database, "donors"), (snapshot) => {
    const data = snapshot.val()
    if (data) {
      cache.donors = Object.entries(data).map(([key, val]) => ({
        ...(val as DonorRecord),
        id: key,
      }))
    } else {
      cache.donors = []
    }
    cache.initialized = true
    notifyChange()
  })

  onValue(ref(database, "hospitals"), (snapshot) => {
    const data = snapshot.val()
    if (data) {
      cache.hospitals = Object.entries(data).map(([key, val]) => ({
        ...(val as HospitalRecord),
        id: key,
      }))
    } else {
      cache.hospitals = []
    }
    notifyChange()
  })

  onValue(ref(database, "requests"), (snapshot) => {
    const data = snapshot.val()
    if (data) {
      cache.requests = Object.entries(data).map(([key, val]) => ({
        ...(val as BloodRequestRecord),
        id: key,
      }))
    } else {
      cache.requests = []
    }
    notifyChange()
  })

  onValue(ref(database, "donations"), (snapshot) => {
    const data = snapshot.val()
    if (data) {
      cache.donations = Object.entries(data).map(([key, val]) => ({
        ...(val as DonationRecord & { donorId: string }),
        id: key,
      }))
    } else {
      cache.donations = []
    }
    notifyChange()
  })

  onValue(ref(database, "notifications"), (snapshot) => {
    const data = snapshot.val()
    if (data) {
      cache.notifications = Object.entries(data).map(([key, val]) => ({
        ...(val as NotificationRecord),
        id: key,
      }))
    } else {
      cache.notifications = []
    }
    notifyChange()
  })

  onValue(ref(database, "rejections"), (snapshot) => {
    const data = snapshot.val()
    if (data) {
      cache.rejections = Object.entries(data).map(([, val]) => val as { requestId: string; donorId: string })
    } else {
      cache.rejections = []
    }
    notifyChange()
  })
}

// Initialize listeners on first import (client-side only)
if (typeof window !== "undefined") {
  attachFirebaseListeners()
}

// ---- HELPER: Generate ID ----
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// ---- DONORS ----
export function getDonors(): DonorRecord[] {
  return cache.donors
}

export function getDonorById(id: string): DonorRecord | undefined {
  return cache.donors.find(d => d.id === id)
}

export function findDonorByName(name: string): DonorRecord | undefined {
  return cache.donors.find(d => (d.name || "").toLowerCase() === (name || "").toLowerCase())
}

export function findDonorByEmail(email: string): DonorRecord | undefined {
  return cache.donors.find(d => (d.email || "").toLowerCase() === (email || "").trim().toLowerCase())
}

export function addDonor(data: Omit<DonorRecord, "id">): DonorRecord {
  // Push to Firebase -- generates a Firebase key
  const donorRef = push(ref(database, "donors"))
  const id = donorRef.key || generateId()
  const newDonor: DonorRecord = { ...data, id }

  // Optimistic update to local cache
  cache.donors.push(newDonor)
  notifyChange()

  // Persist to Firebase (fire-and-forget)
  set(donorRef, newDonor).catch(err => console.error("[v0] Firebase write error (addDonor):", err))

  return newDonor
}

export function updateDonor(id: string, updates: Partial<DonorRecord>): void {
  // Optimistic local update
  const index = cache.donors.findIndex(d => d.id === id)
  if (index !== -1) {
    cache.donors[index] = { ...cache.donors[index], ...updates }
    notifyChange()
  }

  // Persist to Firebase
  const donorRef = ref(database, `donors/${id}`)
  update(donorRef, updates).catch(err => console.error("[v0] Firebase write error (updateDonor):", err))
}

// ---- HOSPITALS ----
export function getHospitals(): HospitalRecord[] {
  return cache.hospitals
}

export function findHospital(identifier: string): HospitalRecord | undefined {
  const trimmed = (identifier || "").trim().toLowerCase()
  return cache.hospitals.find(
    h =>
      (h.email || "").toLowerCase() === trimmed ||
      (h.name || "").toLowerCase() === trimmed ||
      (h.license || "").toLowerCase() === trimmed
  )
}

export function findHospitalByEmailAndLicense(email: string, license: string): HospitalRecord | undefined {
  const e = (email || "").trim().toLowerCase()
  const l = (license || "").trim().toLowerCase()
  return cache.hospitals.find(
    h => (h.email || "").toLowerCase() === e && (h.license || "").toLowerCase() === l
  )
}

export function addHospital(data: Omit<HospitalRecord, "id">): HospitalRecord {
  const hospitalRef = push(ref(database, "hospitals"))
  const id = hospitalRef.key || generateId()
  const newHospital: HospitalRecord = { ...data, id }

  cache.hospitals.push(newHospital)
  notifyChange()

  set(hospitalRef, newHospital).catch(err => console.error("[v0] Firebase write error (addHospital):", err))

  return newHospital
}

// ---- BLOOD REQUESTS ----
export function getBloodRequests(): BloodRequestRecord[] {
  return cache.requests
}

export function addBloodRequest(data: Omit<BloodRequestRecord, "id">): BloodRequestRecord {
  const requestRef = push(ref(database, "requests"))
  const id = requestRef.key || generateId()
  const newReq: BloodRequestRecord = { ...data, id }

  // Optimistic local update
  cache.requests.push(newReq)
  notifyChange()

  // Atomic Firebase update: request + hospital reference
  const updates: Record<string, unknown> = {}
  updates[`requests/${id}`] = newReq
  if (data.hospitalId) {
    updates[`hospitals/${data.hospitalId}/requests/${id}`] = true
  }
  update(ref(database), updates).catch(err => console.error("[v0] Firebase write error (addBloodRequest):", err))

  return newReq
}

export function updateBloodRequest(id: string, updates: Partial<BloodRequestRecord>): void {
  // Optimistic local update
  const index = cache.requests.findIndex(r => r.id === id)
  if (index !== -1) {
    cache.requests[index] = { ...cache.requests[index], ...updates }
    notifyChange()
  }

  // Build Firebase atomic update
  const fbUpdates: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(updates)) {
    fbUpdates[`requests/${id}/${key}`] = val
  }

  // Cross-sync: if donor accepts, add donor reference
  if (updates.donorId && updates.status === "accepted") {
    fbUpdates[`donors/${updates.donorId}/acceptedRequests/${id}`] = true
  }

  update(ref(database), fbUpdates).catch(err => console.error("[v0] Firebase write error (updateBloodRequest):", err))
}

// ---- DONOR DONATIONS ----
export function getDonorDonations(donorId: string): DonationRecord[] {
  return cache.donations.filter(d => d.donorId === donorId)
}

export function addDonorDonation(donorId: string, data: Omit<DonationRecord, "id">): DonationRecord {
  const donationRef = push(ref(database, "donations"))
  const id = donationRef.key || generateId()
  const newDon = { ...data, id, donorId }

  cache.donations.push(newDon)
  notifyChange()

  set(donationRef, newDon).catch(err => console.error("[v0] Firebase write error (addDonorDonation):", err))

  return newDon
}

// ---- NOTIFICATIONS ----
export function addNotification(data: Omit<NotificationRecord, "id">): void {
  const notifRef = push(ref(database, "notifications"))
  const id = notifRef.key || generateId()
  const notification = { ...data, id }

  cache.notifications.push(notification)
  notifyChange()

  set(notifRef, notification).catch(err => console.error("[v0] Firebase write error (addNotification):", err))
}

// ---- ALL DONATIONS ----
export function getAllDonations(): (DonationRecord & { donorId: string })[] {
  return cache.donations
}

// ---- COOLDOWN HELPERS ----
export function isDonorOnCooldown(donor: DonorRecord): boolean {
  if (!donor.lastDonationApproved) return false
  const lastDate = new Date(donor.lastDonationApproved)
  const cooldownEnd = new Date(lastDate.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
  return new Date() < cooldownEnd
}

export function getCooldownRemainingDays(donor: DonorRecord): number | null {
  if (!donor.lastDonationApproved) return null
  const lastDate = new Date(donor.lastDonationApproved)
  const cooldownEnd = new Date(lastDate.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
  const now = new Date()
  if (now >= cooldownEnd) return null
  return Math.ceil((cooldownEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
}

// Auto-reactivate donors whose cooldown has expired
export function reactivateExpiredCooldowns(): void {
  let changed = false
  for (let i = 0; i < cache.donors.length; i++) {
    const d = cache.donors[i]
    if (d.status === "inactive" && d.lastDonationApproved && !isDonorOnCooldown(d)) {
      cache.donors[i] = { ...d, status: "active" }
      changed = true
      // Persist to Firebase
      update(ref(database, `donors/${d.id}`), { status: "active" }).catch(err =>
        console.error("[v0] Firebase write error (reactivate):", err)
      )
    }
  }
  if (changed) {
    notifyChange()
  }
}

// Get eligible donors for a hospital request (matching blood group, within 15km, active)
export function getEligibleDonorsForRequest(
  bloodGroup: string,
  hospitalLocation: { lat: number; lng: number }
): DonorRecord[] {
  reactivateExpiredCooldowns()
  return cache.donors.filter(d => {
    if (d.status !== "active") return false
    if (isDonorOnCooldown(d)) return false
    if (bloodGroup !== "Any" && (d.bloodGroup || "") !== bloodGroup) return false
    if (!d.location) return false
    const dist = getDistanceKm(
      hospitalLocation.lat, hospitalLocation.lng,
      d.location.lat, d.location.lng
    )
    return dist <= GPS_RADIUS_KM
  })
}

// ---- STATS ----
export function getStats() {
  const donors = cache.donors
  const hospitals = cache.hospitals
  const totalDonations = cache.donations.length
  const active = donors.filter(d => d.status === "active").length
  const byBlood: Record<string, number> = {}
  for (const d of donors) {
    const bg = d.bloodGroup || "Unknown"
    byBlood[bg] = (byBlood[bg] || 0) + 1
  }
  return {
    donorCount: donors.length,
    hospitalCount: hospitals.length,
    activeDonors: active,
    totalDonations,
    livesImpacted: totalDonations * 3,
    byBlood,
  }
}

// ---- NOTIFICATIONS (read helpers) ----
export function getNotificationsForDonor(donorId: string): NotificationRecord[] {
  return cache.notifications
    .filter(n => n.donorId === donorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getNotificationsForHospital(hospitalId: string): NotificationRecord[] {
  return cache.notifications
    .filter(n => n.hospitalId === hospitalId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function markNotificationRead(id: string): void {
  const idx = cache.notifications.findIndex(n => n.id === id)
  if (idx !== -1) {
    cache.notifications[idx] = { ...cache.notifications[idx], read: true }
    notifyChange()
    update(ref(database, `notifications/${id}`), { read: true }).catch(err =>
      console.error("[v0] Firebase write error (markNotificationRead):", err)
    )
  }
}

export function markAllNotificationsRead(donorId: string): void {
  let changed = false
  const fbUpdates: Record<string, unknown> = {}
  for (let i = 0; i < cache.notifications.length; i++) {
    if (cache.notifications[i].donorId === donorId && !cache.notifications[i].read) {
      cache.notifications[i] = { ...cache.notifications[i], read: true }
      fbUpdates[`notifications/${cache.notifications[i].id}/read`] = true
      changed = true
    }
  }
  if (changed) {
    notifyChange()
    update(ref(database), fbUpdates).catch(err =>
      console.error("[v0] Firebase write error (markAllNotificationsRead):", err)
    )
  }
}

// ---- REJECTED REQUESTS TRACKING ----
export function rejectBloodRequest(requestId: string, donorId: string, _donorName: string): void {
  cache.rejections.push({ requestId, donorId })
  notifyChange()

  const rejRef = push(ref(database, "rejections"))
  set(rejRef, { requestId, donorId }).catch(err =>
    console.error("[v0] Firebase write error (rejectBloodRequest):", err)
  )
}

export function getDonorRejections(donorId: string): string[] {
  return cache.rejections
    .filter(r => r.donorId === donorId)
    .map(r => r.requestId)
}

// ---- GPS DISTANCE (Haversine) ----
export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const GPS_RADIUS_KM = 15

// ---- EVENT SYSTEM (unchanged) ----
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

let _notifyScheduled = false
export function notifyChange(): void {
  if (_notifyScheduled) return
  _notifyScheduled = true
  setTimeout(() => {
    _notifyScheduled = false
    listeners.forEach(fn => fn())
  }, 0)
}
