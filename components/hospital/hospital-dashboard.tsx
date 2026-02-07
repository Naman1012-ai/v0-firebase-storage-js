"use client"

import { useEffect, useState } from "react"
import {
  getBloodRequests,
  addBloodRequest,
  updateBloodRequest,
  getDonors,
  getDonorById,
  updateDonor,
  addDonorDonation,
  addNotification,
  subscribe,
} from "@/lib/store"
import { DonorMap } from "@/components/hospital/donor-map"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

interface BloodRequest {
  id: string
  bloodGroup: string
  units: number
  urgency: string
  status: string
  createdAt: string
  acceptedBy?: string
  donorId?: string
  donationApproved?: boolean
}

interface HospitalData {
  id: string
  name: string
  location: { lat: number; lng: number }
  [key: string]: unknown
}

interface HospitalDashboardProps {
  hospital: HospitalData
}

export function HospitalDashboard({ hospital }: HospitalDashboardProps) {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [donorCounts, setDonorCounts] = useState({ total: 0, active: 0, byBlood: {} as Record<string, number> })
  const [requestForm, setRequestForm] = useState({ bloodGroup: "A+", units: 1, urgency: "critical" })
  const [sending, setSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Requests listener
  useEffect(() => {
    const refresh = () => {
      const allRequests = getBloodRequests()
      const hospitalRequests = allRequests
        .filter((req) => req.hospitalId === hospital.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as BloodRequest[]
      setRequests(hospitalRequests)
    }
    refresh()
    const unsub = subscribe(refresh)
    return () => unsub()
  }, [hospital.id])

  // Donor counts listener
  useEffect(() => {
    const refresh = () => {
      const allDonors = getDonors()
      let total = 0
      let active = 0
      const byBlood: Record<string, number> = {}
      bloodGroups.forEach(bg => { byBlood[bg] = 0 })

      for (const donor of allDonors) {
        total++
        if (donor.status === "active") active++
        if (donor.bloodGroup && byBlood[donor.bloodGroup] !== undefined) byBlood[donor.bloodGroup]++
      }

      setDonorCounts({ total, active, byBlood })
    }
    refresh()
    const unsub = subscribe(refresh)
    return () => unsub()
  }, [])

  const sendRequest = () => {
    setSending(true)
    try {
      addBloodRequest({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        hospitalLocation: hospital.location,
        bloodGroup: requestForm.bloodGroup,
        units: requestForm.units,
        urgency: requestForm.urgency,
        status: "pending",
        createdAt: new Date().toISOString(),
      })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to send request:", err)
    } finally {
      setSending(false)
    }
  }

  const approveDonation = (request: BloodRequest) => {
    if (!request.donorId) return
    try {
      // Generate donation number
      const date = new Date()
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
      const bgCode = request.bloodGroup.replace("+", "P").replace("-", "N")
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
      const donationNumber = `DON-${dateStr}-${bgCode}-${rand}`

      // Update request
      updateBloodRequest(request.id, {
        status: "completed",
        donationApproved: true,
        donationNumber,
        approvedAt: new Date().toISOString(),
      })

      // Create donation record for donor
      addDonorDonation(request.donorId, {
        donationNumber,
        hospitalName: hospital.name,
        hospitalId: hospital.id,
        bloodGroup: request.bloodGroup,
        units: request.units,
        donatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      })

      // Update donor status to inactive (60-day cooldown)
      const donorData = getDonorById(request.donorId)
      if (donorData) {
        updateDonor(request.donorId, {
          status: "inactive",
          lastDonationApproved: new Date().toISOString(),
          donationCount: (donorData.donationCount || 0) + 1,
        })
      }

      // Create notification for donor
      addNotification({
        type: "donation_approved",
        donorId: request.donorId,
        hospitalName: hospital.name,
        donationNumber,
        message: `Your donation has been approved! Donation Number: ${donationNumber}`,
        createdAt: new Date().toISOString(),
        read: false,
      })
    } catch (err) {
      console.error("Error approving donation:", err)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-100 text-red-700 border-red-200"
      case "high": return "bg-orange-100 text-orange-700 border-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default: return "bg-green-100 text-green-700 border-green-200"
    }
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-6xl space-y-6 px-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <div className="text-3xl font-bold text-blood-600">{donorCounts.active}</div>
            <div className="text-sm text-gray-500">Active Donors</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <div className="text-3xl font-bold text-gray-900">{donorCounts.total}</div>
            <div className="text-sm text-gray-500">Total Donors</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">{requests.filter(r => r.status === "pending").length}</div>
            <div className="text-sm text-gray-500">Pending Requests</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-lg">
            <div className="text-3xl font-bold text-green-600">{requests.filter(r => r.status === "completed").length}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        {/* Blood Group Availability */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Donor Availability by Blood Group</h3>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {bloodGroups.map(bg => (
              <div key={bg} className={`rounded-xl border p-3 text-center ${
                donorCounts.byBlood[bg] > 0 ? "border-green-200 bg-gradient-to-br from-green-50 to-green-100" : "border-gray-200 bg-gray-50"
              }`}>
                <div className={`text-sm font-bold ${donorCounts.byBlood[bg] > 0 ? "text-green-600" : "text-gray-400"}`}>{bg}</div>
                <div className={`text-xl font-bold ${donorCounts.byBlood[bg] > 0 ? "text-green-700" : "text-gray-500"}`}>{donorCounts.byBlood[bg] || 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Send Request */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <svg className="h-5 w-5 text-blood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Emergency Blood Request
            </h3>

            {showSuccess && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                Request sent successfully! Matching donors will be notified.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Blood Group Needed</label>
                <select value={requestForm.bloodGroup} onChange={e => setRequestForm(p => ({ ...p, bloodGroup: e.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-bold text-blood-600 focus:border-blood-500 focus:ring-2 focus:ring-blood-500">
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  <option value="Any">Any Blood Group</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Units Required</label>
                  <input type="number" value={requestForm.units} onChange={e => setRequestForm(p => ({ ...p, units: Number(e.target.value) }))}
                    min={1} max={10} className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-blood-500 focus:ring-2 focus:ring-blood-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Urgency</label>
                  <select value={requestForm.urgency} onChange={e => setRequestForm(p => ({ ...p, urgency: e.target.value }))}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus:border-blood-500 focus:ring-2 focus:ring-blood-500">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <button onClick={sendRequest} disabled={sending}
                className="w-full rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-blood-600 hover:to-blood-700 disabled:opacity-60">
                {sending ? "Sending..." : "Send Emergency Request"}
              </button>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Recent Requests</h3>
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {requests.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>No requests sent yet</p>
                </div>
              ) : (
                requests.slice(0, 10).map(req => (
                  <div key={req.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blood-600">{req.bloodGroup}</span>
                          <span className="text-sm text-gray-500">{req.units} unit(s)</span>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getUrgencyColor(req.urgency)}`}>
                            {req.urgency}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
                        {req.acceptedBy && (
                          <p className="mt-1 text-sm font-medium text-blue-600">Accepted by: {req.acceptedBy}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          req.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          req.status === "accepted" ? "bg-blue-100 text-blue-700" :
                          req.status === "completed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {req.status}
                        </span>
                        {req.status === "accepted" && !req.donationApproved && (
                          <button onClick={() => approveDonation(req)}
                            className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-3 py-1.5 text-xs font-bold text-white shadow transition-all hover:from-green-600 hover:to-green-700">
                            Approve Donation
                          </button>
                        )}
                        {req.donationApproved && (
                          <span className="text-xs font-semibold text-green-600">Donation Approved</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
