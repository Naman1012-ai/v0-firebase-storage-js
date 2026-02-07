"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getBloodRequests,
  updateBloodRequest,
  getDonorDonations,
  addNotification,
  updateDonor,
  subscribe,
  getDistanceKm,
  GPS_RADIUS_KM,
  type BloodRequestRecord,
} from "@/lib/store"

interface BloodRequest {
  id: string
  hospitalName: string
  bloodGroup: string
  units: number
  urgency: string
  status: string
  createdAt: string
  acceptedBy?: string
  donorId?: string
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
}

export function DonorDashboard({ donor, onStatusChange }: DonorDashboardProps) {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [cooldownDays, setCooldownDays] = useState<number | null>(null)
  const [isInactive, setIsInactive] = useState(donor.status === "inactive")

  // Calculate cooldown
  const checkCooldown = useCallback(() => {
    if (donor.lastDonationApproved) {
      const lastDate = new Date(donor.lastDonationApproved as string)
      const cooldownEnd = new Date(lastDate.getTime() + 60 * 24 * 60 * 60 * 1000)
      const now = new Date()
      if (now < cooldownEnd) {
        const remaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        setCooldownDays(remaining)
        setIsInactive(true)
      } else {
        setCooldownDays(null)
        setIsInactive(false)
        if (donor.status === "inactive") {
          updateDonor(donor.id, { status: "active" })
          onStatusChange("active")
        }
      }
    }
  }, [donor.lastDonationApproved, donor.status, donor.id, onStatusChange])

  useEffect(() => {
    checkCooldown()
  }, [checkCooldown])

  // Blood requests listener with 15km GPS radius filtering
  useEffect(() => {
    const refresh = () => {
      const allRequests = getBloodRequests()
      const matching = allRequests.filter((req: BloodRequestRecord) => {
        // Always show requests already accepted by this donor
        if (req.donorId === donor.id) return true
        // Must match blood group
        if (req.bloodGroup !== donor.bloodGroup && req.bloodGroup !== "Any") return false
        // Must be pending
        if (req.status !== "pending") return false
        // GPS radius check: only show if hospital is within 15km
        if (donor.location && req.hospitalLocation) {
          const dist = getDistanceKm(
            donor.location.lat, donor.location.lng,
            req.hospitalLocation.lat, req.hospitalLocation.lng
          )
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
  }, [donor.bloodGroup, donor.id, donor.location])

  // Donations listener
  useEffect(() => {
    const refresh = () => {
      const donationList = getDonorDonations(donor.id) as unknown as Donation[]
      setDonations(
        donationList.sort((a, b) => new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime())
      )
    }
    refresh()
    const unsub = subscribe(refresh)
    return () => unsub()
  }, [donor.id])

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

  const pendingCount = requests.filter(r => r.status === "pending").length

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        {/* Pending Requests Banner */}
        {pendingCount > 0 && !isInactive && (
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blood-600 to-blood-500 p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="h-6 w-6 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-yellow-400" />
              </div>
              <span className="font-semibold">{pendingCount} emergency request(s) waiting for your response!</span>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-blood-100 px-4 py-1.5 text-sm font-bold text-blood-700">{donor.bloodGroup}</span>
                  <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    isInactive ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                  }`}>
                    {isInactive ? "Recovery Period" : "Active Donor"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cooldown Warning */}
          {cooldownDays !== null && (
            <div className="mt-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-6 w-6 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-blue-800">Recovery Period Active</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    You are in a 60-day recovery period after your last donation. You can donate again in <span className="font-bold">{cooldownDays} days</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Requests */}
        {requests.filter(r => r.status === "pending").length > 0 && (
          <div className="rounded-3xl bg-gradient-to-r from-blood-500 to-blood-600 p-6 shadow-xl">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <svg className="h-6 w-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Emergency Blood Requests
            </h3>
            <div className="space-y-3">
              {requests.filter(r => r.status === "pending").map(req => (
                <div key={req.id} className="rounded-2xl bg-white p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{req.hospitalName}</h4>
                      <p className="text-sm text-gray-600">{req.bloodGroup} - {req.units} unit(s)</p>
                      <span className={`mt-1 inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${getUrgencyColor(req.urgency)}`}>
                        {req.urgency}
                      </span>
                    </div>
                    <button
                      onClick={() => acceptRequest(req.id)}
                      disabled={isInactive}
                      className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request History */}
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
              requests.map(req => (
                <div key={req.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{req.hospitalName}</h4>
                    <p className="text-sm text-gray-500">{req.bloodGroup} - {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Donation History */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Donation History
          </h3>
          <div className="space-y-3">
            {donations.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No completed donations</p>
                <p className="mt-1 text-sm">Your approved donations will appear here with confirmation numbers</p>
              </div>
            ) : (
              donations.map(d => (
                <div key={d.id} className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{d.hospitalName}</h4>
                      <p className="text-sm text-gray-600">{d.bloodGroup} - {new Date(d.donatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Confirmed</span>
                      <p className="mt-1 text-xs font-mono text-gray-500">{d.donationNumber}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
