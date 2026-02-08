"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  getBloodRequests,
  updateBloodRequest,
  getDonorDonations,
  addNotification,
  updateDonor,
  subscribe,
  getDistanceKm,
  GPS_RADIUS_KM,
  rejectBloodRequest,
  getDonorRejections,
  getNotificationsForDonor,
  markAllNotificationsRead,
  getDonorById,
  COOLDOWN_DAYS,
  calculateAgeFromDOB,
  reactivateExpiredCooldowns,
  type BloodRequestRecord,
  type NotificationRecord,
} from "@/lib/store"

interface BloodRequest {
  id: string
  hospitalId: string
  hospitalName: string
  bloodGroup: string
  units: number
  urgency: string
  status: string
  createdAt: string
  acceptedBy?: string
  donorId?: string
  hospitalLocation?: { lat: number; lng: number }
  donationApproved?: boolean
  approvedAt?: string
}

interface Donation {
  id: string
  donationNumber: string
  hospitalName: string
  bloodGroup: string
  donatedAt: string
  approvedAt: string
}

interface DonorData {
  id: string
  name: string
  bloodGroup: string
  status: string
  location?: { lat: number; lng: number }
  donationCount?: number
  lastDonationApproved?: string
  [key: string]: unknown
}

interface DonorDashboardProps {
  donor: DonorData
  onStatusChange: (status: string) => void
  onLocationUpdate?: (loc: { lat: number; lng: number }) => void
  onLogout: () => void
  onProfileUpdate?: (updates: Partial<DonorData>) => void
}

const GOOGLE_MAPS_KEY = "AIzaSyDOeHp6xcsp8Eblz0R9N8nA9xW5fYFhgr8"

export function DonorDashboard({ donor, onStatusChange, onLocationUpdate, onLogout, onProfileUpdate }: DonorDashboardProps) {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [cooldownDays, setCooldownDays] = useState<number | null>(null)
  const [manualInactive, setManualInactive] = useState(donor.status === "inactive" && !donor.lastDonationApproved)
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(donor.location || null)
  const [locationAddress, setLocationAddress] = useState<string>("")
  const [locationUpdating, setLocationUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<"requests" | "history" | "donations">("requests")
  const watchIdRef = useRef<number | null>(null)
  const onLocationUpdateRef = useRef(onLocationUpdate)
  const [mapError, setMapError] = useState(false)

  // Edit Profile state
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    name: donor.name,
    phone: (donor.phone as string) || "",
    email: (donor.email as string) || "",
    weight: (donor.weight as number)?.toString() || "",
    diseases: (donor.medical as string[]) || [],
    noDiseases: (donor.medical as string[])?.includes("none") || (donor.medical as string[])?.length === 0,
  })
  const [editError, setEditError] = useState("")
  const [editSaving, setEditSaving] = useState(false)

  const diseases = [
    { value: "hiv", label: "HIV/AIDS" },
    { value: "hepatitis", label: "Hepatitis B/C" },
    { value: "diabetes", label: "Diabetes" },
    { value: "heart", label: "Heart Disease" },
    { value: "malaria", label: "Malaria (3mo)" },
  ]

  const toggleEditDisease = (disease: string) => {
    if (disease === "none") {
      setEditForm(prev => ({ ...prev, noDiseases: !prev.noDiseases, diseases: [] }))
    } else {
      setEditForm(prev => ({
        ...prev,
        noDiseases: false,
        diseases: prev.diseases.includes(disease)
          ? prev.diseases.filter(d => d !== disease)
          : [...prev.diseases, disease]
      }))
    }
  }

  // Calculate age from DOB
  const donorAge = donor.dateOfBirth ? calculateAgeFromDOB(donor.dateOfBirth as string) : (donor.age as number) || null

  // Keep ref in sync without triggering effects
  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate
  }, [onLocationUpdate])

  const isOnCooldown = cooldownDays !== null
  const isInactive = manualInactive || isOnCooldown || donor.status === "inactive"

  // Reverse geocode to get address (with graceful fallback)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`
      )
      const data = await res.json()
      if (data.status === "REQUEST_DENIED" || data.status === "OVER_QUERY_LIMIT") {
        setLocationAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        setMapError(true)
        return
      }
      if (data.results?.[0]?.formatted_address) {
        setLocationAddress(data.results[0].formatted_address)
      } else {
        setLocationAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      }
    } catch {
      setLocationAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
  }, [])

  // Start live location tracking (stable -- no prop dependencies)
  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) return
    setLocationUpdating(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLiveLocation(loc)
        reverseGeocode(loc.lat, loc.lng)
        updateDonor(donor.id, { location: loc })
        onLocationUpdateRef.current?.(loc)
        setLocationUpdating(false)
      },
      () => setLocationUpdating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )

    // Watch for updates
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLiveLocation(loc)
        updateDonor(donor.id, { location: loc })
        onLocationUpdateRef.current?.(loc)
        reverseGeocode(loc.lat, loc.lng)
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    )
    watchIdRef.current = id
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donor.id, reverseGeocode])

  // Start tracking on mount, clean up on unmount (runs only once per donor.id)
  useEffect(() => {
    startLiveTracking()
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [startLiveTracking])

  // Calculate cooldown
  const checkCooldown = useCallback(() => {
    if (donor.lastDonationApproved) {
      const lastDate = new Date(donor.lastDonationApproved as string)
      const cooldownEnd = new Date(lastDate.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
      const now = new Date()
      if (now < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        setCooldownDays(remaining)
      } else {
        setCooldownDays(null)
        if (donor.status === "inactive" && !manualInactive) {
          updateDonor(donor.id, { status: "active" })
          onStatusChange("active")
        }
      }
    }
  }, [donor.lastDonationApproved, donor.status, donor.id, onStatusChange, manualInactive])

  useEffect(() => {
    checkCooldown()
  }, [checkCooldown])

  // Blood requests listener with 15km GPS radius + rejection filtering
  // Shows ONLY hospital-originated requests (all have hospitalId)
  useEffect(() => {
    const refresh = () => {
      // Auto-reactivate expired cooldowns
      reactivateExpiredCooldowns()

      const allRequests = getBloodRequests()
      const rejectedIds = getDonorRejections(donor.id)
      const loc = liveLocation || donor.location
      const matching = allRequests.filter((req: BloodRequestRecord) => {
        // Only show requests that originate from hospitals (have hospitalId)
        if (!req.hospitalId) return false
        // Skip requests this donor has rejected
        if (rejectedIds.includes(req.id)) return false
        // Always show requests this donor accepted or was approved for
        if (req.donorId === donor.id) return true
        // For pending requests: match blood group and distance
        if (req.bloodGroup !== donor.bloodGroup && req.bloodGroup !== "Any") return false
        if (req.status !== "pending") return false
        if (loc && req.hospitalLocation) {
          const dist = getDistanceKm(loc.lat, loc.lng, req.hospitalLocation.lat, req.hospitalLocation.lng)
          if (dist > GPS_RADIUS_KM) return false
        }
        return true
      })
      setRequests(
        matching.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as BloodRequest[]
      )
    }
    refresh()
    const unsub = subscribe(refresh)
    return () => unsub()
  }, [donor.bloodGroup, donor.id, donor.location, liveLocation])

  // Donations listener
  useEffect(() => {
    const refresh = () => {
      const donationList = getDonorDonations(donor.id) as unknown as Donation[]
      setDonations(donationList.sort((a, b) => new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime()))
    }
    refresh()
    const unsub = subscribe(refresh)
    return () => unsub()
  }, [donor.id])

  // Notifications listener
  useEffect(() => {
    const refresh = () => {
      setNotifications(getNotificationsForDonor(donor.id))
    }
    refresh()
    const unsub = subscribe(refresh)
    return () => unsub()
  }, [donor.id])

  // Mark notifications as read when viewing
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    if (unread > 0) {
      const timer = setTimeout(() => markAllNotificationsRead(donor.id), 3000)
      return () => clearTimeout(timer)
    }
  }, [notifications, donor.id])

  const toggleActiveStatus = () => {
    if (isOnCooldown) return
    const newStatus = manualInactive ? "active" : "inactive"
    setManualInactive(!manualInactive)
    updateDonor(donor.id, { status: newStatus })
    onStatusChange(newStatus)
  }

  const acceptRequest = (requestId: string) => {
    if (isInactive) return
    try {
      const allRequests = getBloodRequests()
      const request = allRequests.find((r) => r.id === requestId)
      if (!request) return
      if (request.status !== "pending") {
        alert("This request has already been accepted by another donor.")
        return
      }
      updateBloodRequest(requestId, {
        status: "accepted",
        acceptedBy: donor.name,
        donorId: donor.id,
        acceptedAt: new Date().toISOString(),
      })
      addNotification({
        type: "donor_accepted",
        hospitalId: request.hospitalId,
        donorId: donor.id,
        donorName: donor.name,
        bloodGroup: donor.bloodGroup,
        requestId,
        message: `${donor.name} (${donor.bloodGroup}) has accepted your blood request.`,
        createdAt: new Date().toISOString(),
        read: false,
      })
    } catch (err) {
      console.error("Error accepting request:", err)
    }
  }

  const handleReject = (requestId: string) => {
    rejectBloodRequest(requestId, donor.id, donor.name)
    const allRequests = getBloodRequests()
    const request = allRequests.find(r => r.id === requestId)
    if (request) {
      addNotification({
        type: "donor_rejected",
        hospitalId: request.hospitalId,
        donorId: donor.id,
        donorName: donor.name,
        bloodGroup: donor.bloodGroup,
        requestId,
        message: `${donor.name} has declined the blood request.`,
        createdAt: new Date().toISOString(),
        read: false,
      })
    }
  }

  const handleSaveProfile = () => {
    setEditError("")
    if (!(editForm.name || "").trim()) {
      setEditError("Name is required.")
      return
    }
    if (!editForm.phone || !/^[0-9]{10}$/.test(editForm.phone)) {
      setEditError("Phone must be a valid 10-digit number.")
      return
    }
    if (!editForm.email) {
      setEditError("Email is required.")
      return
    }
    if (editForm.weight && Number(editForm.weight) < 45) {
      setEditError("Minimum weight is 45 kg.")
      return
    }
    setEditSaving(true)
    try {
      const medicalData = editForm.noDiseases || editForm.diseases.length === 0 ? ["none"] : editForm.diseases
      const updates: Partial<DonorData> = {
        name: (editForm.name || "").trim(),
        phone: editForm.phone,
        email: editForm.email,
        weight: editForm.weight ? Number(editForm.weight) : undefined,
        medical: medicalData,
      }
      updateDonor(donor.id, updates)
      onProfileUpdate?.(updates)
      setShowEditProfile(false)
    } catch {
      setEditError("Failed to save profile.")
    } finally {
      setEditSaving(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical": return "bg-red-100 text-red-700 border-red-200"
      case "high": return "bg-orange-100 text-orange-700 border-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default: return "bg-green-100 text-green-700 border-green-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700"
      case "accepted": return "bg-blue-100 text-blue-700"
      case "completed": return "bg-green-100 text-green-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const pendingRequests = requests.filter(r => r.status === "pending")
  const approvedRequests = requests.filter(r => r.donorId === donor.id && r.donationApproved === true)
  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl space-y-6 px-4">

        {/* Notification Banner for new blood requests */}
        {unreadNotifications > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white shadow-lg">
            <div className="relative">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-white" />
            </div>
            <span className="font-semibold">You have {unreadNotifications} new notification{unreadNotifications > 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Approval Confirmation Messages */}
        {approvedRequests.length > 0 && (
          <div className="space-y-3">
            {approvedRequests.map(req => (
              <div key={`approval-${req.id}`} className="flex items-start gap-3 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5 shadow-lg">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-green-800">Donation Approved</h4>
                  <p className="mt-1 text-sm font-medium text-green-700">
                    {`You have been approved for donating blood of ${req.bloodGroup} by ${req.hospitalName}.`}
                  </p>
                  {req.approvedAt && (
                    <p className="mt-1 text-xs text-green-600">
                      Approved on: {new Date(req.approvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending Requests Banner */}
        {pendingRequests.length > 0 && !isInactive && (
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blood-600 to-blood-500 p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="h-6 w-6 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-yellow-400" />
              </div>
              <span className="font-semibold">{pendingRequests.length} emergency request(s) waiting for your response!</span>
            </div>
          </div>
        )}

        {/* Status Card with Active/Inactive Toggle + Live Location + Logout */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${
                isInactive ? "bg-orange-100" : "bg-green-100"
              }`}>
                {isInactive ? (
                  <svg className="h-10 w-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {donor.name}!</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blood-100 px-4 py-1.5 text-sm font-bold text-blood-700">{donor.bloodGroup}</span>
                  <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    isInactive ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                  }`}>
                    {isOnCooldown ? "Recovery Period" : manualInactive ? "Inactive" : "Active Donor"}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls: Active/Inactive toggle + Edit Profile */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={toggleActiveStatus}
                disabled={isOnCooldown}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold shadow transition-all ${
                  isOnCooldown
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : manualInactive
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {isOnCooldown ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    On Cooldown
                  </>
                ) : manualInactive ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Go Active
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Go Inactive
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  const current = getDonorById(donor.id)
                  if (current) {
                    setEditForm({
                      name: current.name,
                      phone: current.phone || "",
                      email: current.email || "",
                      weight: current.weight?.toString() || "",
                      diseases: current.medical?.filter(m => m !== "none") || [],
                      noDiseases: current.medical?.includes("none") || current.medical?.length === 0,
                    })
                  }
                  setEditError("")
                  setShowEditProfile(true)
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 font-semibold text-blue-700 transition-all hover:bg-blue-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Cooldown Warning */}
          {isOnCooldown && (
            <div className="mt-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-6 w-6 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-blue-800">Recovery Period Active</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    You are in a 56-day recovery period after your last donation. You can donate again in <span className="font-bold">{cooldownDays} days</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live Location */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Live Location</p>
                  {locationUpdating ? (
                    <p className="text-xs text-gray-500">Detecting your location...</p>
                  ) : liveLocation ? (
                    <p className="text-xs text-gray-500">
                      {locationAddress || `${liveLocation.lat.toFixed(4)}, ${liveLocation.lng.toFixed(4)}`}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">Location unavailable</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!navigator.geolocation) return
                    setLocationUpdating(true)
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                        setLiveLocation(loc)
                        reverseGeocode(loc.lat, loc.lng)
                        updateDonor(donor.id, { location: loc })
                        onLocationUpdateRef.current?.(loc)
                        setLocationUpdating(false)
                      },
                      () => setLocationUpdating(false),
                      { enableHighAccuracy: true, timeout: 10000 }
                    )
                  }}
                  disabled={locationUpdating}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-200 disabled:opacity-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {locationUpdating ? "Detecting..." : "Detect Live Location"}
                </button>
                <button
                  onClick={startLiveTracking}
                  disabled={locationUpdating}
                  className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 transition-all hover:bg-green-200 disabled:opacity-50"
                >
                  {locationUpdating ? "Updating..." : "Refresh"}
                </button>
              </div>
            </div>
            {liveLocation && (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                {mapError ? (
                  <div className="flex flex-col items-center justify-center bg-gray-100 p-6">
                    <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-600">Map preview unavailable</p>
                    <p className="mt-1 text-xs text-gray-400">Location: {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}</p>
                    <a
                      href={`https://www.google.com/maps?q=${liveLocation.lat},${liveLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                ) : (
                  <iframe
                    title="Live Location Map"
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${liveLocation.lat},${liveLocation.lng}&zoom=14`}
                    onError={() => setMapError(true)}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 rounded-2xl bg-gray-100 p-1.5">
          {[
            { key: "requests" as const, label: "Blood Requests", count: pendingRequests.length },
            { key: "history" as const, label: "Request History", count: requests.length },
            { key: "donations" as const, label: "Past Donations", count: donations.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white text-blood-600 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === tab.key ? "bg-blood-100 text-blood-600" : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB: Emergency Blood Requests with Accept/Reject */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              <div className="rounded-3xl bg-gradient-to-r from-blood-500 to-blood-600 p-6 shadow-xl">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                  <svg className="h-6 w-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Emergency Blood Requests
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="rounded-2xl bg-white p-5 shadow-md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{req.hospitalName}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blood-100 px-3 py-1 text-sm font-bold text-blood-700">{req.bloodGroup}</span>
                            <span className="text-sm text-gray-600">{req.units} unit(s) needed</span>
                            <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${getUrgencyColor(req.urgency)}`}>
                              {req.urgency}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
                          {req.hospitalLocation && liveLocation && (
                            <p className="mt-1 text-xs text-blue-600">
                              {getDistanceKm(liveLocation.lat, liveLocation.lng, req.hospitalLocation.lat, req.hospitalLocation.lng).toFixed(1)} km away
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => acceptRequest(req.id)}
                            disabled={isInactive}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-5 py-2.5 font-bold text-gray-700 transition-all hover:bg-red-50 hover:text-red-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-100 bg-white py-16 text-center shadow-xl">
                <svg className="mx-auto mb-4 h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">No Pending Requests</h3>
                <p className="mt-2 text-gray-500">When hospitals near you send blood requests matching your type, they will appear here.</p>
              </div>
            )}

            {/* Accepted by this donor */}
            {requests.filter(r => r.status === "accepted" && r.donorId === donor.id).length > 0 && (
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-xl">
                <h3 className="mb-3 text-lg font-bold text-blue-800">Your Accepted Requests</h3>
                <div className="space-y-3">
                  {requests.filter(r => r.status === "accepted" && r.donorId === donor.id).map(req => (
                    <div key={req.id} className="rounded-xl border border-blue-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{req.hospitalName}</h4>
                          <p className="text-sm text-gray-600">{req.bloodGroup} - {req.units} unit(s)</p>
                          <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                          {req.hospitalLocation && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${req.hospitalLocation.lat},${req.hospitalLocation.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Get Directions to Hospital
                            </a>
                          )}
                        </div>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Awaiting Approval</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Request History */}
        {activeTab === "history" && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Request History</h3>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <svg className="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No requests yet</p>
                  <p className="mt-1 text-sm">When hospitals send you requests, they will appear here</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">Hospital</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Blood Type</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {requests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{req.hospitalName}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-blood-100 px-2 py-0.5 text-xs font-bold text-blood-700">{req.bloodGroup}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Past Blood Donation Records */}
        {activeTab === "donations" && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Past Blood Donation Records
            </h3>
            {donations.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <svg className="mx-auto mb-3 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold">No completed donations yet</p>
                <p className="mt-1 text-sm">Your approved donations will appear here with confirmation numbers</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Hospital</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Blood Type</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-700">Donation ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {donations.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{new Date(d.donatedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{d.hospitalName}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-blood-100 px-2 py-0.5 text-xs font-bold text-blood-700">{d.bloodGroup}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Completed</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.donationNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary Stats */}
            {donations.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{donations.length}</div>
                  <div className="text-xs text-green-600">Total Donations</div>
                </div>
                <div className="rounded-xl bg-blood-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blood-700">{donations.length * 3}</div>
                  <div className="text-xs text-blood-600">Lives Impacted</div>
                </div>
                <div className="rounded-xl bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {new Set(donations.map(d => d.hospitalName)).size}
                  </div>
                  <div className="text-xs text-blue-600">Hospitals Helped</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Recent Notifications</h3>
            <div className="space-y-2">
              {notifications.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-xl p-3 transition-all ${
                    n.read ? "bg-gray-50" : "border border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-gray-300" : "bg-blue-500"}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close edit profile"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{editError}</div>
            )}

            <div className="max-h-[70vh] space-y-4 overflow-y-auto">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500"
                />
              </div>
              {donorAge !== null && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Age (auto-calculated)</label>
                  <div className="rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-gray-600">{donorAge} years</div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  value={editForm.weight}
                  onChange={e => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                  min={45}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500"
                />
              </div>

              {/* Disease Editing */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Medical Conditions</label>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {diseases.map(d => (
                      <label key={d.value} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-2.5 hover:border-red-300">
                        <input type="checkbox" checked={editForm.diseases.includes(d.value)} onChange={() => toggleEditDisease(d.value)} className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{d.label}</span>
                      </label>
                    ))}
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-2.5 hover:border-green-300">
                      <input type="checkbox" checked={editForm.noDiseases} onChange={() => toggleEditDisease("none")} className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">None</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 rounded-xl border-2 border-gray-200 bg-white py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={editSaving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-blood-600 hover:to-blood-700 disabled:opacity-60"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
