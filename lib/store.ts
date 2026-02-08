// localStorage-based data store replacing Firebase

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

// Helper to generate IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Generic CRUD helpers
function getCollection<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setCollection<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// ---- DONORS ----
export function getDonors(): DonorRecord[] {
  return getCollection<DonorRecord>("biolynk_donors")
}

export function getDonorById(id: string): DonorRecord | undefined {
  return getDonors().find(d => d.id === id)
}

export function findDonorByName(name: string): DonorRecord | undefined {
  return getDonors().find(d => d.name.toLowerCase() === name.toLowerCase())
}

export function findDonorByEmail(email: string): DonorRecord | undefined {
  return getDonors().find(d => d.email.toLowerCase() === email.trim().toLowerCase())
}

export function addDonor(data: Omit<DonorRecord, "id">): DonorRecord {
  const donors = getDonors()
  const newDonor: DonorRecord = { ...data, id: generateId() }
  donors.push(newDonor)
  setCollection("biolynk_donors", donors)
  notifyChange()
  return newDonor
}

export function updateDonor(id: string, updates: Partial<DonorRecord>): void {
  const donors = getDonors()
  const index = donors.findIndex(d => d.id === id)
  if (index !== -1) {
    donors[index] = { ...donors[index], ...updates }
    setCollection("biolynk_donors", donors)
    notifyChange()
  }
}

// ---- HOSPITALS ----
export function getHospitals(): HospitalRecord[] {
  return getCollection<HospitalRecord>("biolynk_hospitals")
}

export function findHospital(identifier: string): HospitalRecord | undefined {
  const trimmed = identifier.trim().toLowerCase()
  return getHospitals().find(
    h =>
      h.email.toLowerCase() === trimmed ||
      h.name.toLowerCase() === trimmed ||
      h.license.toLowerCase() === trimmed
  )
}

export function findHospitalByEmailAndLicense(email: string, license: string): HospitalRecord | undefined {
  const e = email.trim().toLowerCase()
  const l = license.trim().toLowerCase()
  return getHospitals().find(
    h => h.email.toLowerCase() === e && h.license.toLowerCase() === l
  )
}

export function addHospital(data: Omit<HospitalRecord, "id">): HospitalRecord {
  const hospitals = getHospitals()
  const newHospital: HospitalRecord = { ...data, id: generateId() }
  hospitals.push(newHospital)
  setCollection("biolynk_hospitals", hospitals)
  notifyChange()
  return newHospital
}

// ---- BLOOD REQUESTS ----
export function getBloodRequests(): BloodRequestRecord[] {
  return getCollection<BloodRequestRecord>("biolynk_requests")
}

export function addBloodRequest(data: Omit<BloodRequestRecord, "id">): BloodRequestRecord {
  const requests = getBloodRequests()
  const newReq: BloodRequestRecord = { ...data, id: generateId() }
  requests.push(newReq)
  setCollection("biolynk_requests", requests)
  notifyChange()
  return newReq
}

export function updateBloodRequest(id: string, updates: Partial<BloodRequestRecord>): void {
  const requests = getBloodRequests()
  const index = requests.findIndex(r => r.id === id)
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates }
    setCollection("biolynk_requests", requests)
    notifyChange()
  }
}

// ---- DONOR DONATIONS ----
export function getDonorDonations(donorId: string): DonationRecord[] {
  const all = getCollection<DonationRecord & { donorId: string }>("biolynk_donations")
  return all.filter(d => d.donorId === donorId)
}

export function addDonorDonation(donorId: string, data: Omit<DonationRecord, "id">): DonationRecord {
  const all = getCollection<DonationRecord & { donorId: string }>("biolynk_donations")
  const newDon = { ...data, id: generateId(), donorId }
  all.push(newDon)
  setCollection("biolynk_donations", all)
  notifyChange()
  return newDon
}

// ---- NOTIFICATIONS ----
export function addNotification(data: Omit<NotificationRecord, "id">): void {
  const all = getCollection<NotificationRecord>("biolynk_notifications")
  all.push({ ...data, id: generateId() })
  setCollection("biolynk_notifications", all)
  notifyChange()
}

// ---- ALL DONATIONS ----
export function getAllDonations(): (DonationRecord & { donorId: string })[] {
  return getCollection<DonationRecord & { donorId: string }>("biolynk_donations")
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
  const donors = getDonors()
  let changed = false
  for (let i = 0; i < donors.length; i++) {
    const d = donors[i]
    if (d.status === "inactive" && d.lastDonationApproved && !isDonorOnCooldown(d)) {
      donors[i] = { ...d, status: "active" }
      changed = true
    }
  }
  if (changed) {
    setCollection("biolynk_donors", donors)
    notifyChange()
  }
}

// Get eligible donors for a hospital request (matching blood group, within 15km, active)
export function getEligibleDonorsForRequest(
  bloodGroup: string,
  hospitalLocation: { lat: number; lng: number }
): DonorRecord[] {
  reactivateExpiredCooldowns()
  const donors = getDonors()
  return donors.filter(d => {
    if (d.status !== "active") return false
    if (isDonorOnCooldown(d)) return false
    if (bloodGroup !== "Any" && d.bloodGroup !== bloodGroup) return false
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
  const donors = getDonors()
  const hospitals = getHospitals()
  const totalDonations = getAllDonations().length
  const active = donors.filter(d => d.status === "active").length
  const byBlood: Record<string, number> = {}
  for (const d of donors) {
    byBlood[d.bloodGroup] = (byBlood[d.bloodGroup] || 0) + 1
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
  return getCollection<NotificationRecord>("biolynk_notifications")
    .filter(n => n.donorId === donorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getNotificationsForHospital(hospitalId: string): NotificationRecord[] {
  return getCollection<NotificationRecord>("biolynk_notifications")
    .filter(n => n.hospitalId === hospitalId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function markNotificationRead(id: string): void {
  const all = getCollection<NotificationRecord>("biolynk_notifications")
  const idx = all.findIndex(n => n.id === id)
  if (idx !== -1) {
    all[idx] = { ...all[idx], read: true }
    setCollection("biolynk_notifications", all)
    notifyChange()
  }
}

export function markAllNotificationsRead(donorId: string): void {
  const all = getCollection<NotificationRecord>("biolynk_notifications")
  let changed = false
  for (let i = 0; i < all.length; i++) {
    if (all[i].donorId === donorId && !all[i].read) {
      all[i] = { ...all[i], read: true }
      changed = true
    }
  }
  if (changed) {
    setCollection("biolynk_notifications", all)
    notifyChange()
  }
}

// ---- REJECTED REQUESTS TRACKING ----
export function rejectBloodRequest(requestId: string, donorId: string, donorName: string): void {
  // Add a rejection record so the donor doesn't see this request again
  const rejections = getCollection<{ requestId: string; donorId: string }>("biolynk_rejections")
  rejections.push({ requestId, donorId })
  setCollection("biolynk_rejections", rejections)
  notifyChange()
}

export function getDonorRejections(donorId: string): string[] {
  return getCollection<{ requestId: string; donorId: string }>("biolynk_rejections")
    .filter(r => r.donorId === donorId)
    .map(r => r.requestId)
}

// ---- GPS DISTANCE (Haversine) ----
export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // Earth radius in km
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

// Event system for cross-component reactivity
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


